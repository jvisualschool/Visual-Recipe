<?php
// backend/api/migrate_prompts.php
require_once 'db.php';

// Disable time limit for batch processing
set_time_limit(0);

echo "<h1>Recipe Prompt Restoration & Migration</h1>";

try {
    // 1. Add Column if not exists
    echo "<h3>Step 1: Checking Database Schema...</h3>";
    try {
        $pdo->exec("SELECT final_prompt FROM recipes LIMIT 1");
        echo "✓ 'final_prompt' column already exists.<br>";
    } catch (PDOException $e) {
        // Column likely missing
        try {
            $pdo->exec("ALTER TABLE recipes ADD COLUMN final_prompt TEXT DEFAULT NULL");
            echo "✓ Successfully added 'final_prompt' column.<br>";
        } catch (PDOException $ex) {
            die("✗ Error adding column: " . $ex->getMessage());
        }
    }

    // 2. Fetch all recipes with empty prompts
    echo "<h3>Step 2: Restoring Prompts for Existing Recipes...</h3>";
    $stmt = $pdo->query("SELECT * FROM recipes WHERE final_prompt IS NULL OR final_prompt = ''");
    $recipes = $stmt->fetchAll();

    if (count($recipes) === 0) {
        echo "All recipes already have prompts. Nothing to do.<br>";
        exit;
    }

    echo "Found " . count($recipes) . " recipes to restore.<br><ul>";

    // Style Definitions (Must match generate.php)
    $stylePrompts = [
        'minimal' => "Modern minimalist style. Clean white background, high-contrast sans-serif typography.",
        'infographic' => "3D Exploded-view infographic. High-detail 3D illustrations. Vibrant isometric style.",
        'watercolor' => "Artistic watercolor painting. Soft pastel colors, textured paper background.",
        'graphic' => "Graphic Recording style. Hand-drawn marker style, limited color palette.",
        'sketch' => "Light pencil sketch style. Very soft and faint graphite pencil strokes. Minimal detail, simple and clean lines. Subtle shading with sparse hatching. Off-white sketchbook paper background. Less busy, more whitespace. Understated and elegant sketch aesthetic.",
        'girlish' => "Soft colored pencil illustration style. ABSOLUTELY NO HARD OUTLINES - all shapes extremely soft and blended, edges fade into each other. Clean notebook paper background with subtle grid lines. NO decorative elements. Warm pastel colors with soft colored pencil shading, heavy blending, smudged soft transitions. ALL TEXT AND LETTERING MUST LOOK HAND-DRAWN WITH COLORED PENCILS - slightly wobbly, textured, childlike handwriting style with visible pencil strokes in the letters. Dreamy soft focus aesthetic. Simple and clean composition."
    ];

    $updateStmt = $pdo->prepare("UPDATE recipes SET final_prompt = ? WHERE id = ?");
    $count = 0;

    foreach ($recipes as $r) {
        $id = $r['id'];
        $style = $r['style_type'] ?? 'minimal';
        $layout = $r['layout_type'] ?? 'standard';
        $ratio = $r['view_type'] ?? 'vertical';
        $lang = $r['language_code'] ?? 'bilingual';
        $fullTitle = $r['title'];

        // Extract English Title
        $titleEn = $fullTitle;
        if (preg_match('/\((.*?)\)$/', $fullTitle, $matches)) {
            $titleEn = $matches[1];
        }

        // Layout Instruction
        $layoutInstruction = "";
        switch ($layout) {
            case 'bento': $layoutInstruction = " COMPOSITION: Bento Grid Layout."; break;
            case 'radial': $layoutInstruction = " COMPOSITION: Radial Focus."; break;
            case 'magazine': $layoutInstruction = " COMPOSITION: Magazine Hero."; break;
            default: $layoutInstruction = " COMPOSITION: Vertical 3-Tier Layout.";
        }

        // Language Instruction
        $langInstruction = "";
        switch ($lang) {
            case 'ko': $langInstruction = "ONLY Korean text labels (한글만). DO NOT include any English text. All text must be in Korean language only."; break;
            case 'en': $langInstruction = "ONLY English text labels. DO NOT include any Korean text. All text must be in English language only."; break;
            default: $langInstruction = "Both English and Korean text labels together (한/영 병기).";
        }

        // Ratio Instruction
        $ratioInstruction = "";
        switch ($ratio) {
            case 'horizontal': $ratioInstruction = " ASPECT RATIO: Wide horizontal 16:9 landscape format."; break;
            case 'square': $ratioInstruction = " ASPECT RATIO: Perfect square 1:1 format."; break;
            default: $ratioInstruction = " ASPECT RATIO: Tall vertical 9:16 portrait format.";
        }

        // Style Desc
        $styleDesc = $stylePrompts[$style] ?? $stylePrompts['minimal'];

        // Ingredients & Steps
        $ingJson = json_decode($r['ingredients_json'], true);
        $ingredientsStr = "";
        if (isset($ingJson['en']) && is_array($ingJson['en'])) {
            $ingredientsStr = implode(', ', $ingJson['en']);
        } else if (is_array($ingJson)) {
            // Fallback for flat arrays
            $ingredientsStr = implode(', ', $ingJson);
        }

        $stepsJson = json_decode($r['steps_json'], true);
        $stepsStr = "";
        if (isset($stepsJson['en']) && is_array($stepsJson['en'])) {
            $stepsStr = implode(', ', $stepsJson['en']);
        } else if (is_array($stepsJson)) {
            $stepsStr = implode(', ', $stepsJson);
        }

        // Construct Prompt
        // Note: For overlay mode, generate.php uses $cleanPrompt variable logic which is slightly different (NO TEXT LABELS)
        // Check render_mode
        $renderMode = $r['render_mode'] ?? 'embedded';
        
        $finalPrompt = "";
        if ($renderMode === 'overlay') {
            $finalPrompt = "A visual recipe for '" . $titleEn . "'. $styleDesc NO TEXT LABELS. Do not include any text, words, letters, or numbers. Only visual illustrations. $layoutInstruction $ratioInstruction Ingredients: $ingredientsStr. Steps: $stepsStr. High clarity, 4k.";
        } else {
            $finalPrompt = "A visual recipe for '" . $titleEn . "'. $styleDesc Include stylish $langInstruction for ingredients and steps. $layoutInstruction $ratioInstruction Ingredients: $ingredientsStr. Steps: $stepsStr. High clarity, 4k.";
        }

        // Update DB
        $updateStmt->execute([$finalPrompt, $id]);
        echo "<li>Restored Recipe #$id: $titleEn</li>";
        $count++;
    }

    echo "</ul><br><h3>✓ Completed! Restored $count prompts.</h3>";

} catch (PDOException $e) {
    echo "<h2>Server Error:</h2>" . $e->getMessage();
}
?>
