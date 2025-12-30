<?php
// backend/api/like.php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['id'])) exit;

$stmt = $pdo->prepare("UPDATE recipes SET likes = likes + 1 WHERE id = ?");
$stmt->execute([$input['id']]);

echo json_encode(['success' => true]);
?>
