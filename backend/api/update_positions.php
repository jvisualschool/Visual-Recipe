<?php
// backend/api/update_positions.php - Save user-corrected text positions
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['id']) || !isset($input['positions'])) {
        throw new Exception('Recipe ID and positions are required');
    }
    
    $recipeId = intval($input['id']);
    $positions = $input['positions'];
    
    // Validate positions is an array
    if (!is_array($positions)) {
        throw new Exception('Positions must be an array');
    }
    
    // Update the text_positions_json in database
    $stmt = $pdo->prepare("UPDATE recipes SET text_positions_json = ? WHERE id = ?");
    $stmt->execute([
        json_encode($positions),
        $recipeId
    ]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Recipe not found or no changes made');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Positions saved successfully',
        'id' => $recipeId
    ]);

} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
