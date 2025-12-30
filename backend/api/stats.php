<?php
// backend/api/stats.php
require_once 'db.php';
require_once 'config.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 1. Total Recipes
$totalStmt = $pdo->query("SELECT COUNT(*) FROM recipes");
$totalCount = $totalStmt->fetchColumn();

// 2. Today's Recipes
$todayStmt = $pdo->query("SELECT COUNT(*) FROM recipes WHERE DATE(created_at) = CURDATE()");
$todayCount = $todayStmt->fetchColumn();

echo json_encode([
    'total' => (int)$totalCount,
    'today' => (int)$todayCount
]);
?>
