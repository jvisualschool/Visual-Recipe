<?php
// Force migrate a single recipe by ID
require_once 'db.php';
require_once 'config.php';

$id = $_GET['id'] ?? null;
if (!$id) die("Usage: ?id=33");

$stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
$stmt->execute([$id]);
$recipe = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$recipe) die("Recipe not found.");

echo "<h2>Migrating ID #$id: {$recipe['title']}</h2>";

$ingredients = json_decode($recipe['ingredients_json'], true);
$steps = json_decode($recipe['steps_json'], true);

// Already bilingual?
if (isset($ingredients['en']) && isset($ingredients['ko'])) {
    die("Already bilingual. No action needed.");
}

// Call Gemini to translate
$chefUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . MODEL_TEXT . ":generateContent?key=" . GEMINI_API_KEY;
$chefPrompt = "Translate this recipe data to both English and Korean:
" . json_encode(['ingredients' => $ingredients, 'steps' => $steps]) . "
Return ONLY a JSON with: ingredients_en, ingredients_ko, steps_en, steps_ko.";

$payload = ["contents" => [["parts" => [["text" => $chefPrompt]]]]];

$ch = curl_init($chefUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) die("API Error: $httpCode");

$resJson = json_decode($response, true);
$rawText = $resJson['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
$rawText = str_replace(['```json', '```'], '', $rawText);
$newData = json_decode($rawText, true);

if (!$newData || !isset($newData['ingredients_en'])) die("AI Error: " . htmlspecialchars(substr($rawText, 0, 200)));

$newIng = ['en' => $newData['ingredients_en'], 'ko' => $newData['ingredients_ko'] ?? $ingredients];
$newSteps = ['en' => $newData['steps_en'], 'ko' => $newData['steps_ko'] ?? $steps];

$stmt = $pdo->prepare("UPDATE recipes SET ingredients_json = ?, steps_json = ? WHERE id = ?");
$stmt->execute([json_encode($newIng), json_encode($newSteps), $id]);

echo "<p style='color:green'>Migration Complete!</p>";
echo "<b>New Ingredients:</b> " . json_encode($newIng, JSON_UNESCAPED_UNICODE) . "<br>";
echo "<b>New Steps:</b> " . json_encode($newSteps, JSON_UNESCAPED_UNICODE);
?>
