<?php
require_once 'db.php';

try {
    echo "Attempting to fix DB schema...<br>";
    
    // 1. Alter style_type to VARCHAR(50) to allow any new styles
    $sql = "ALTER TABLE recipes MODIFY style_type VARCHAR(50) NOT NULL DEFAULT 'minimal'";
    $pdo->exec($sql);
    echo "✓ Success: recipes.style_type matches new requirements (VARCHAR 50).<br>";

} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage();
}
?>
