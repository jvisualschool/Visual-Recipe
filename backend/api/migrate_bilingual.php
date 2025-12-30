<?php
// backend/api/migrate_bilingual.php
require_once 'db.php';
require_once 'config.php';

set_time_limit(0); // Allow long execution

echo "<h1>Starting Bilingual Migration for Recipes</h1>";
echo "<pre>";

try {
    // 1. Fetch all recipes
    $stmt = $pdo->query("SELECT id, title, ingredients_json, steps_json FROM recipes ORDER BY id DESC");
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $count = 0;
    $updated = 0;

    foreach ($recipes as $recipe) {
        $id = $recipe['id'];
        $title = $recipe['title'];
        
        $ingredients = json_decode($recipe['ingredients_json'], true);
        $steps = json_decode($recipe['steps_json'], true);

        // Check if already bilingual (is Object and has 'en' key)
        $isBilingual = false;
        if (!is_array($ingredients)) {
             echo "[$id] Error: Invalid JSON. Skipping.\n";
             continue;
        }

        // If it's a list (indexing 0, 1..) -> Legacy. If assoc array with 'en' -> New.
        // Simple check: isset($ingredients['en'])
        if (isset($ingredients['en']) && isset($ingredients['ko'])) {
            echo "[$id] Already bilingual. Skipping.\n";
            continue;
        }

        echo "[$id] Migrating '$title'... ";
        flush();

        // 2. Prepare Data for AI
        $promptData = [
            'ingredients' => $ingredients,
            'steps' => $steps
        ];

        // 3. call Gemini Flash to translate
        $chefUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . MODEL_TEXT . ":generateContent?key=" . GEMINI_API_KEY;
        $chefPrompt = "Translate and structure correct English and Korean arrays for the following recipe data:
" . json_encode($promptData) . "
Return ONLY a JSON object with keys: ingredients_en, ingredients_ko, steps_en, steps_ko.
Output raw JSON only.";

        $chefPayload = ["contents" => [["parts" => [["text" => $chefPrompt]]]]];
        
        $ch = curl_init($chefUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($chefPayload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        // Retry logic? For now, just one shot.
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            echo "Failed AI Request ($httpCode). Skipping.\n";
            continue;
        }

        $resJson = json_decode($response, true);
        $rawText = $resJson['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
        $rawText = str_replace(['```json', '```'], '', $rawText);
        $newData = json_decode($rawText, true);

        if (!$newData || !isset($newData['ingredients_en'])) {
            echo "AI returned invalid JSON. Skipping.\n";
            continue;
        }

        // 4. Update DB
        $newIng = [
            'en' => $newData['ingredients_en'],
            'ko' => $newData['ingredients_ko'] ?? $ingredients // Fallback if missing
        ];
        $newSteps = [
            'en' => $newData['steps_en'],
            'ko' => $newData['steps_ko'] ?? $steps
        ];

        $updateStmt = $pdo->prepare("UPDATE recipes SET ingredients_json = ?, steps_json = ? WHERE id = ?");
        $updateStmt->execute([
            json_encode($newIng),
            json_encode($newSteps),
            $id
        ]);

        echo "Done.\n";
        $updated++;
        
        // Initial delay to respect rate limits
        usleep(500000); // 0.5s
    }

    echo "\nMigration Complete. Updated $updated recipes out of " . count($recipes) . ".";

} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage();
}

echo "</pre>";
?>
