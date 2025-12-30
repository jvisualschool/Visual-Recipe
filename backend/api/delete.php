<?php
// backend/api/delete.php
require_once 'db.php';
require_once 'config.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get Input
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$email = $input['email'] ?? '';

// Check Admin Access
$ADMIN_EMAILS = ['phploveme@gmail.com'];

if (!in_array($email, $ADMIN_EMAILS)) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized: Only admins can delete recipes.']);
    exit;
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipe ID is required']);
    exit;
}

// 1. Get Image URL to delete file
$stmt = $pdo->prepare("SELECT image_url FROM recipes WHERE id = ?");
$stmt->execute([$id]);
$recipe = $stmt->fetch();

if ($recipe) {
    $imageUrl = $recipe['image_url'];
    // Convert URL to File Path logic
    // URL: https://jvibeschool.org/CHEF/uploads/filename.png
    // Path: ../uploads/filename.png
    
    $filename = basename($imageUrl);
    $filePath = '../uploads/' . $filename;
    
    if (file_exists($filePath)) {
        unlink($filePath);
    }
}

// 2. Delete from DB
$delStmt = $pdo->prepare("DELETE FROM recipes WHERE id = ?");
$delStmt->execute([$id]);

if ($delStmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => "Recipe #$id deleted"]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Recipe not found']);
}
?>
