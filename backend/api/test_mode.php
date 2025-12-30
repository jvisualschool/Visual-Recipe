<?php
// Debug endpoint to test overlay vs embedded mode
require_once 'config.php';

$mode = $_GET['mode'] ?? 'overlay';
$dish = $_GET['dish'] ?? 'Tuna Kimchi Stew';

echo "<h1>Testing Mode: $mode for '$dish'</h1>";

// Simulate Chef AI response
$recipeData = [
    'title_en' => $dish,
    'ingredients_en' => ['Tuna', 'Kimchi', 'Tofu'],
    'steps_en' => ['Stir fry kimchi', 'Add tuna', 'Simmer']
];

$ingredientsStr = implode(', ', $recipeData['ingredients_en']);
$stepsStr = implode(', ', $recipeData['steps_en']);

// Build prompt based on mode
if ($mode === 'overlay') {
    $textInstruction = " NO TEXT LABELS. Do not include any text, ingredients names, or numbers in the image. Clean visualization only.";
} else {
    $textInstruction = " Include stylish English text labels for ingredients and steps. Typography should match the style.";
}

$visualPrompt = "A visual recipe for '$dish'. Modern minimalist style. Clean white background. Ingredients ($ingredientsStr). Steps ($stepsStr). High clarity, 4k." . $textInstruction;

echo "<h3>Prompt:</h3><pre>" . htmlspecialchars($visualPrompt) . "</pre>";

// Call API
$artistUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . MODEL_IMAGE . ":generateContent?key=" . GEMINI_API_KEY;

$geminiPayload = [
    "contents" => [["parts" => [["text" => $visualPrompt]]]],
    "generationConfig" => ["temperature" => 0.4]
];

echo "<h3>Calling API...</h3>";
$start = microtime(true);

$ch = curl_init($artistUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$elapsed = round(microtime(true) - $start, 2);

echo "<h3>Result:</h3>";
echo "<p>HTTP Code: <b>$httpCode</b></p>";
echo "<p>Time: {$elapsed}s</p>";

if ($httpCode === 200) {
    $imgJson = json_decode($response, true);
    if (isset($imgJson['candidates'][0]['content']['parts'])) {
        foreach ($imgJson['candidates'][0]['content']['parts'] as $part) {
            if (isset($part['inlineData']['data'])) {
                echo "<p style='color:green'>✓ Image Generated Successfully!</p>";
                echo "<img src='data:image/png;base64," . $part['inlineData']['data'] . "' style='max-width:400px'/>";
                break;
            }
        }
    } else {
        echo "<p style='color:orange'>Response has no image data.</p>";
        echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
    }
} else {
    echo "<p style='color:red'>✗ API Error!</p>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
}
?>
