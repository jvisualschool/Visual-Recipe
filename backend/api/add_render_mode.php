<?php
require_once 'db.php';

try {
    echo "Adding render_mode column to recipes table...<br>";
    
    // Add render_mode column
    $sql = "ALTER TABLE recipes ADD COLUMN render_mode VARCHAR(20) DEFAULT 'embedded' AFTER style_type";
    $pdo->exec($sql);
    echo "✓ Success: render_mode column added.<br>";

} catch (PDOException $e) {
    // Check if column already exists
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "✓ Column already exists. No action needed.<br>";
    } else {
        echo "✗ Error: " . $e->getMessage();
    }
}
?>
