<?php
require_once 'db.php';
require_once 'config.php';

$search = $_GET['search'] ?? 'Kimchi';
$id = $_GET['id'] ?? null;
echo "<h1>Debug Recipe: " . ($id ? "ID #$id" : $search) . "</h1>";

if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
    $stmt->execute([$id]);
} else {
    $stmt = $pdo->prepare("SELECT * FROM recipes WHERE title LIKE ?");
    $stmt->execute(["%$search%"]);
}
$recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($recipes as $r) {
    echo "<h3>ID: {$r['id']} - {$r['title']}</h3>";
    echo "<b>Ingredients JSON:</b> " . htmlspecialchars($r['ingredients_json']) . "<br>";
    echo "<b>Steps JSON:</b> " . htmlspecialchars($r['steps_json']) . "<br>";
    
    $ing = json_decode($r['ingredients_json'], true);
    if (isset($ing['en']) && isset($ing['ko'])) {
        echo "<span style='color:green'>[Bilingual Data Detected]</span><br>";
    } else {
        echo "<span style='color:red'>[Legacy/Single Data Detected]</span><br>";
    }
}
?>
