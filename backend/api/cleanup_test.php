<?php
require_once 'db.php';
require_once 'config.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Delete recipes with 'test' in the title (case-insensitive)
$sql = "DELETE FROM recipes WHERE title LIKE '%test%'";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$count = $stmt->rowCount();

echo json_encode([
    'success' => true,
    'deleted_count' => $count,
    'message' => "Deleted $count recipes with 'test' in the title."
]);
?>
