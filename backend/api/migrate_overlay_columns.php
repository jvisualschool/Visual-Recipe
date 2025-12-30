<?php
require_once 'db.php';

try {
    echo "<h2>Adding overlay support columns...</h2>";
    
    // Add image_embedded_url column
    try {
        $pdo->exec("ALTER TABLE recipes ADD COLUMN image_embedded_url TEXT DEFAULT NULL AFTER image_url");
        echo "✓ Added image_embedded_url column<br>";
    } catch (PDOException $e) {
        echo "- image_embedded_url: " . (strpos($e->getMessage(), 'Duplicate') !== false ? "Already exists" : $e->getMessage()) . "<br>";
    }
    
    // Add text_positions_json column
    try {
        $pdo->exec("ALTER TABLE recipes ADD COLUMN text_positions_json JSON DEFAULT NULL AFTER render_mode");
        echo "✓ Added text_positions_json column<br>";
    } catch (PDOException $e) {
        echo "- text_positions_json: " . (strpos($e->getMessage(), 'Duplicate') !== false ? "Already exists" : $e->getMessage()) . "<br>";
    }
    
    echo "<br><b>Migration complete!</b>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
