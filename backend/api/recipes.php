<?php
// backend/api/recipes.php
require_once 'db.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get Single Recipe
if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM recipes WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $recipe = $stmt->fetch();
    echo json_encode($recipe);
    exit;
}

// Get List (with optional search)
$sql = "SELECT * FROM recipes ORDER BY created_at DESC LIMIT 20";
if (isset($_GET['search'])) {
    $sql = "SELECT * FROM recipes WHERE title LIKE ? ORDER BY created_at DESC LIMIT 20";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['%' . $_GET['search'] . '%']);
} else {
    $stmt = $pdo->query($sql);
}

$recipes = $stmt->fetchAll();
echo json_encode($recipes);
?>
