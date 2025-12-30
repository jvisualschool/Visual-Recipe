<?php
require_once 'db.php';
require_once 'config.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Delete recipes with placeholder images (Sample data or Failed generations)
$sql = "DELETE FROM recipes WHERE image_url LIKE '%placehold.co%'";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$count = $stmt->rowCount();

echo json_encode([
    'success' => true,
    'deleted_count' => $count,
    'message' => "Deleted $count recipes with placeholder images."
]);
?>
