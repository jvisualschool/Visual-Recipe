<?php
require_once 'db.php';

try {
    echo "Attempting to add final_prompt column...<br>";
    
    // Add final_prompt column
    // Check if column exists first? Or just try and catch. 
    // Usually standard SQL doesn't have "ADD COLUMN IF NOT EXISTS" in all versions, 
    // but in MySQL 8.0+ it does. To be safe, we can just run it and ignore "Duplicate column" error or check information_schema.
    // However, simplest way for this environment is just to run it.
    
    $sql = "ALTER TABLE recipes ADD COLUMN final_prompt TEXT DEFAULT NULL";
    $pdo->exec($sql);
    echo "✓ Success: Added final_prompt column.<br>";

} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column") !== false) {
         echo "✓ Column final_prompt already exists.<br>";
    } else {
         echo "✗ Error: " . $e->getMessage();
    }
}
?>
