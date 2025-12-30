<?php
// backend/api/recover_db.php
// Scans uploads directory and repopulates DB using Gemini Vision

require_once 'db.php';
require_once 'config.php';

// Disable time limit for long recovery process
set_time_limit(0);
ob_implicit_flush(true);
ob_end_flush();

$apiKey = GEMINI_API_KEY;
$uploadDir = '/opt/bitnami/apache/htdocs/CHEF/uploads/';
$baseUrl = 'https://jvibeschool.org/CHEF/uploads/';

echo "<h1>Recipe Recovery Started</h1>";
echo "<pre>";

if (!is_dir($uploadDir)) {
    die("Uploads directory not found!");
}

$files = scandir($uploadDir);
$files = array_diff($files, array('.', '..', '.DS_Store', 'index.php'));

$count = 0;
$success = 0;

foreach ($files as $file) {
    // Only process PNG files that look like recipes
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'png') continue;
    
    // Check if this image already exists in DB
    $fullUrl = $baseUrl . $file;
    $stmt = $pdo->prepare("SELECT id FROM recipes WHERE image_url = ? OR image_embedded_url = ?");
    $stmt->execute([$fullUrl, $fullUrl]);
    
    if ($stmt->fetch()) {
        echo "Skipping (Already in DB): $file\n";
        continue;
    }

    echo "Processing: $file ... ";
    flush();

    try {
        // Prepare Vision API Request
        $imageData = base64_encode(file_get_contents($uploadDir . $file));
        $model = 'gemini-2.0-flash-exp'; // Use the same model as the main generator
        $url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=" . $apiKey;

        $prompt = "You are a data recovery bot. This image is a recipe card. Analyze it and extract the recipe data.
        Return ONLY a JSON object with this structure:
        {
            \"title\": \"Full Dish Name\",
            \"title_en\": \"English Name (if present)\",
            \"ingredients\": [\"ing 1\", \"ing 2\"],
            \"steps\": [\"step 1\", \"step 2\"],
            \"lang\": \"ko\"
        }
        Do not add markdown formatting. Just raw JSON.";

        $payload = [
            "contents" => [[
                "parts" => [
                    ["text" => $prompt],
                    ["inlineData" => [
                        "mimeType" => "image/png",
                        "data" => $imageData
                    ]]
                ]
            ]]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for old servers
        
        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            echo "[FAILED] cURL Error: $curlError\n";
            continue;
        }

        $json = json_decode($response, true);
        
        if (isset($json['error'])) {
            echo "[FAILED] API Error: " . $json['error']['message'] . "\n";
            continue;
        }

        $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        $rawText = str_replace(['```json', '```'], '', $rawText);
        $data = json_decode($rawText, true);

        if (!$data || empty($data['title'])) {
            echo "[FAILED] Could not parse AI response. Raw: " . substr($rawText, 0, 50) . "...\n";
            continue;
        }

        // Determine view_type and render_mode from filename or metadata if possible
        // For recovery, we set defaults or guess
        $viewType = 'vertical'; // Default
        list($width, $height) = getimagesize($uploadDir . $file);
        if ($width > $height) $viewType = 'horizontal';
        elseif ($width == $height) $viewType = 'square';

        $renderMode = (strpos($file, 'embedded') !== false) ? 'embedded' : 'overlay';
        $imageUrl = $fullUrl;
        $embeddedUrl = ($renderMode === 'embedded') ? $fullUrl : null;
        
        // Insert into DB
        $stmtInsert = $pdo->prepare("INSERT INTO recipes (title, ingredients_json, steps_json, image_url, image_embedded_url, view_type, language_code, render_mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Use file modification time as creation time
        $createdAt = date("Y-m-d H:i:s", filemtime($uploadDir . $file));

        $stmtInsert->execute([
            $data['title'],
            json_encode(['recovered' => $data['ingredients']]),
            json_encode(['recovered' => $data['steps']]),
            $imageUrl,
            $embeddedUrl,
            $viewType,
            $data['lang'] ?? 'ko',
            $renderMode,
            $createdAt
        ]);

        echo "[OK] Recovered '{$data['title']}'\n";
        $success++;

        // Sleep to avoid rate limits
        usleep(500000); 

    } catch (Exception $e) {
        echo "[ERROR] " . $e->getMessage() . "\n";
    }
}

echo "\nRecovery Complete. Total Recovered: $success";
echo "</pre>";
?>
