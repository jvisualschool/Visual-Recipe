<?php
// backend/api/generate.php - Advanced Overlay with Position Detection
require_once 'db.php';
require_once 'config.php';
set_time_limit(300); // Allow 5 minutes for dual-image AI

// Handle CORS and Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['dish'])) {
        throw new Exception('Dish name is required');
    }

    $dish = $input['dish'];
    $style = $input['style'] ?? 'minimal';
    $ratio = $input['ratio'] ?? 'vertical';
    $lang = $input['lang'] ?? 'bilingual';
    $createdBy = $input['created_by'] ?? null;
    $renderMode = $input['render_mode'] ?? 'embedded';
    $keyType = $input['key_type'] ?? 'paid'; // 'free' or 'paid'
    
    // Select API key based on key_type
    $apiKey = ($keyType === 'free') ? GEMINI_API_KEY_FREE : GEMINI_API_KEY_PAID;

    // --- STEP 1: CHEF AI (Text) ---
    $chefUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . MODEL_TEXT . ":generateContent?key=" . $apiKey;

    $chefPrompt = "You are a professional chef. Analyze this dish: '$dish'.
    Return ONLY a valid JSON object with DOUBLE QUOTES (not single quotes):
    {
      \"title_en\": \"English Name\",
      \"title_ko\": \"Korean Name\",
      \"ingredients_en\": [\"Ingredient 1 (En)\", \"Ingredient 2 (En)\"],
      \"ingredients_ko\": [\"재료 1 (한글)\", \"재료 2 (한글)\"],
      \"steps_en\": [\"Step 1 (En)\", \"Step 2 (En)\"],
      \"steps_ko\": [\"과정 1 (한글)\", \"과정 2 (한글)\"]
    }
    
    CRITICAL INSTRUCTIONS:
    - Keep ingredients list to maximum 5-6 items
    - Keep steps to maximum 5-6 steps
    - Each step MUST be VERY SHORT and CONCISE (maximum 5-7 words in Korean, 7-10 words in English)
    - Use simple, direct language
    - Avoid detailed explanations or time specifications
    - Focus on essential actions only
    - IMPORTANT: Use DOUBLE QUOTES for all JSON strings, NOT single quotes
    
    Output raw JSON only, no markdown, no code blocks.";

    $chefData = [
        "contents" => [["parts" => [["text" => $chefPrompt]]]]
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($chefData),
            'ignore_errors' => true
        ]
    ];

    $context  = stream_context_create($options);
    $chefResult = file_get_contents($chefUrl, false, $context);
    
    // Debug: Log raw response
    error_log("=== CHEF AI DEBUG ===");
    error_log("API Key exists: " . (!empty($apiKey) ? 'YES' : 'NO'));
    error_log("API Key length: " . strlen($apiKey));
    error_log("Model: " . MODEL_TEXT);
    error_log("Raw Response: " . substr($chefResult, 0, 500));
    
    // Check HTTP response headers
    if (isset($http_response_header)) {
        error_log("HTTP Headers: " . print_r($http_response_header, true));
    }
    
    $chefJson = json_decode($chefResult, true);
    
    // Debug: Check if response is valid
    if (!$chefJson) {
        throw new Exception('Chef AI returned invalid JSON. Raw response: ' . substr($chefResult, 0, 200));
    }
    
    // Check for API error
    if (isset($chefJson['error'])) {
        $errorMsg = $chefJson['error']['message'] ?? 'Unknown API error';
        $errorCode = $chefJson['error']['code'] ?? 'N/A';
        throw new Exception("Chef AI API Error [$errorCode]: $errorMsg");
    }

    $rawText = $chefJson['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
    $rawText = str_replace(['```json', '```'], '', $rawText);
    $recipeData = json_decode($rawText, true);

    if (!$recipeData) {
        error_log("Failed to parse recipe data. Raw text: " . $rawText);
        throw new Exception('Chef AI failed to cook. Raw response: ' . substr($rawText, 0, 100) . ' | Full API response: ' . substr($chefResult, 0, 300));
    }

    // Prepare content strings based on requested language
    if ($lang === 'ko') {
        $titleForPrompt = $recipeData['title_ko'] ?? $recipeData['title_en'];
        $ingredientsStr = implode(', ', $recipeData['ingredients_ko'] ?? $recipeData['ingredients_en']);
        $stepsStr = implode(', ', $recipeData['steps_ko'] ?? $recipeData['steps_en']);
    } else {
        $titleForPrompt = $recipeData['title_en'];
        $ingredientsStr = implode(', ', $recipeData['ingredients_en'] ?? []);
        $stepsStr = implode(', ', $recipeData['steps_en'] ?? []);
    }

    // --- HELPER FUNCTION: Generate Image with Retry (Supports Imagen 3 & Gemini) ---
    function generateImage($prompt, $apiKey, $maxRetries = 3) {
        $model = MODEL_IMAGE;
        $isImagen = strpos($model, 'imagen') !== false;
        
        if ($isImagen) {
            // Imagen 3 API format
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:predict?key=" . $apiKey;
            $payload = [
                "instances" => [["prompt" => $prompt]],
                "parameters" => [
                    "sampleCount" => 1,
                    "aspectRatio" => "3:4"
                ]
            ];
        } else {
            // Gemini API format
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;
            $payload = [
                "contents" => [["parts" => [["text" => $prompt]]]],
                "generationConfig" => ["temperature" => 0.4]
            ];
        }
        
        $lastHttpCode = 0;
        $lastResponse = '';
        $lastCurlError = '';
        
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 180);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            $lastHttpCode = $httpCode;
            $lastResponse = $response;
            $lastCurlError = $curlError;
            
            // Success - parse response
            if ($httpCode === 200 && $response) {
                $imgJson = json_decode($response, true);
                $base64 = null;
                
                if ($isImagen) {
                    // Imagen 3 response format
                    if (isset($imgJson['predictions'][0]['bytesBase64Encoded'])) {
                        $base64 = $imgJson['predictions'][0]['bytesBase64Encoded'];
                    }
                } else {
                    // Gemini response format
                    if (isset($imgJson['candidates'][0]['content']['parts'])) {
                        foreach ($imgJson['candidates'][0]['content']['parts'] as $part) {
                            if (isset($part['inlineData']['data'])) {
                                $base64 = $part['inlineData']['data'];
                                break;
                            }
                        }
                    }
                }
                
                if ($base64) {
                    return ['base64' => $base64, 'httpCode' => $httpCode, 'response' => $response];
                }
            }
            
            // Retry on 503 (overloaded) or 0 (network error) or 429 (rate limit)
            if ($httpCode === 503 || $httpCode === 0 || $httpCode === 429) {
                $waitTime = pow(2, $attempt);
                error_log("Image Gen Attempt $attempt failed (Code: $httpCode). Retrying in {$waitTime}s...");
                sleep($waitTime);
                continue;
            }
            
            // Other errors - don't retry
            break;
        }
        
        // All retries failed
        $errorMsg = $lastCurlError ?: "HTTP $lastHttpCode";
        error_log("Image Gen Failed after $maxRetries attempts. Last error: $errorMsg");
        
        return ['base64' => null, 'httpCode' => $lastHttpCode, 'response' => $lastResponse, 'curlError' => $lastCurlError];
    }

    // --- HELPER FUNCTION: Save Image ---
    function saveImage($base64, $prefix = 'recipe') {
        if (!$base64) return null;
        $imgData = base64_decode($base64);
        $fileName = $prefix . '_' . time() . '_' . uniqid() . '.png';
        $filePath = '../uploads/' . $fileName;
        file_put_contents($filePath, $imgData);
        return "https://jvibeschool.org/CHEF/uploads/" . $fileName;
    }

    // --- STEP 2: Build Prompt Components ---
    $layout = $input['layout'] ?? 'standard';
    $layoutInstruction = "";
    switch ($layout) {
        case 'bento':
            $layoutInstruction = " COMPOSITION: Bento Grid Layout.";
            break;
        case 'radial':
            $layoutInstruction = " COMPOSITION: Radial Focus.";
            break;
        case 'magazine':
            $layoutInstruction = " COMPOSITION: Magazine Hero.";
            break;
        default:
            $layoutInstruction = " COMPOSITION: Vertical 3-Tier Layout.";
    }

    // Language instruction for embedded text
    $langInstruction = "";
    switch ($lang) {
        case 'ko':
            $langInstruction = "ONLY Korean text labels (한글만). DO NOT include any English text. All text must be in Korean language only. Use LARGE, BOLD Korean text with clean sans-serif Korean fonts (고딕체). Text should be clear and legible with high contrast and sharp edges. Balance text size with visual content - text should not dominate the image.";
            break;
        case 'en':
            $langInstruction = "ONLY English text labels. DO NOT include any Korean text. All text must be in English language only. Use LARGE, BOLD text with clean sans-serif fonts. Text should be clear and legible with high contrast. Balance text size with visual content.";
            break;
        default: // bilingual
            $langInstruction = "Both English and Korean text labels together (한/영 병기). Use LARGE, BOLD Korean and English text with clean sans-serif fonts. Text should be clear and legible with high contrast and sharp edges for both languages. Balance text size with visual content - text should not dominate the image.";
    }

    // Aspect ratio instruction
    $ratioInstruction = "";
    switch ($ratio) {
        case 'horizontal':
            $ratioInstruction = " ASPECT RATIO: Wide horizontal 16:9 landscape format.";
            break;
        case 'square':
            $ratioInstruction = " ASPECT RATIO: Perfect square 1:1 format.";
            break;
        default: // vertical
            $ratioInstruction = " ASPECT RATIO: Tall vertical 9:16 portrait format.";
    }

    // Base visual prompt (style-specific)
    $stylePrompts = [
        'minimal' => "Modern minimalist style. Clean white background, high-contrast sans-serif typography.",
        'infographic' => "3D Exploded-view infographic. High-detail 3D illustrations. Vibrant isometric style.",
        'watercolor' => "Artistic watercolor painting. Soft pastel colors, textured paper background.",
        'graphic' => "Graphic Recording style. Hand-drawn marker style, limited color palette.",
        'sketch' => "Light pencil sketch style. Very soft and faint graphite pencil strokes. Minimal detail, simple and clean lines. Subtle shading with sparse hatching. Off-white sketchbook paper background. Less busy, more whitespace. Understated and elegant sketch aesthetic.",
        'girlish' => "Soft colored pencil illustration style. ABSOLUTELY NO HARD OUTLINES - all shapes extremely soft and blended, edges fade into each other. Clean notebook paper background with subtle grid lines. NO decorative elements. Warm pastel colors with soft colored pencil shading, heavy blending, smudged soft transitions. ALL TEXT AND LETTERING MUST LOOK HAND-DRAWN WITH COLORED PENCILS - slightly wobbly, textured, childlike handwriting style with visible pencil strokes in the letters. Dreamy soft focus aesthetic. Simple and clean composition.",
        'botanical' => "Soft colored pencil sticker style on beige paper. ABSOLUTELY NO BLACK OUTLINES. Objects should have a VERY THIN, SUBTLE white glow around them (not thick borders). Line work should be EXTREMELY LIGHT and THIN - 50% less prominent than normal, almost invisible. Soft pastel colors, gentle shading, fuzzy edges. Minimalist hand-drawn aesthetic. Cute, cozy, warm atmosphere. Light touch, delicate strokes."
    ];
    $styleDesc = $stylePrompts[$style] ?? $stylePrompts['minimal'];

    // --- STEP 3: Generate Image(s) based on Mode ---
    $finalImageUrl = "";
    $embeddedImageUrl = null;
    $textPositionsJson = null;

    if ($renderMode === 'overlay') {
        // ========== ADVANCED OVERLAY: Dual Image + Position Detection ==========
        
        // 3a. Generate EMBEDDED image (with text)
        $embeddedPrompt = "A visual recipe for '" . $titleForPrompt . "'. $styleDesc **Display the Title: '$titleForPrompt' prominently at the top.** Include stylish $langInstruction for ingredients and steps. $layoutInstruction $ratioInstruction Ingredients: $ingredientsStr. Steps: $stepsStr. CRITICAL VISUAL FOCUS: Prioritize stunning, detailed illustrations. Show beautifully arranged ingredients with realistic textures and colors. Include appetizing visuals of the finished dish with professional food styling. Add visual elements showing key cooking techniques. Use vibrant, natural colors and dramatic lighting. Create a composition that makes viewers hungry. High clarity, 4k, professional food photography quality.";
        $embeddedResult = generateImage($embeddedPrompt, $apiKey);
        $embeddedImageUrl = saveImage($embeddedResult['base64'], 'embedded');
        
        // 3b. Generate CLEAN image (no text)
        $cleanPrompt = "A visual recipe for '" . $titleForPrompt . "'. $styleDesc NO TEXT LABELS. Do not include any text, words, letters, or numbers. Only visual illustrations. $layoutInstruction $ratioInstruction MAXIMUM VISUAL QUALITY: Create a stunning, magazine-worthy food illustration. Show: 1) The finished dish as hero image with professional styling and dramatic lighting, 2) Individual ingredients arranged beautifully with realistic details and textures, 3) Key cooking process steps illustrated clearly. Use rich, vibrant colors that make the food look delicious and appetizing. Add depth, shadows, and highlights for realism. Professional food photography quality with artistic composition. Fill every part of the canvas with engaging, beautiful visual content. Ingredients: $ingredientsStr. Steps: $stepsStr. Ultra high clarity, 4k, award-winning food photography style.";
        $cleanResult = generateImage($cleanPrompt, $apiKey);
        $finalImageUrl = saveImage($cleanResult['base64'], 'overlay');
        
        // 3c. Use Vision API to detect text positions from embedded image
        if ($embeddedResult['base64']) {
            $visionUrl = "https://generativelanguage.googleapis.com/v1beta/models/" . MODEL_TEXT . ":generateContent?key=" . $apiKey;
            $visionPrompt = "Analyze this recipe infographic image. Identify all text elements and their approximate positions.
Return a JSON array of text blocks. Each block should have:
- type: 'title', 'ingredient', or 'step'
- x: horizontal position from left (0-100 as percentage)
- y: vertical position from top (0-100 as percentage)
- fontSize: approximate font size (sm, md, lg, xl)

Format: [{\"type\":\"title\",\"x\":10,\"y\":5,\"fontSize\":\"xl\"},{\"type\":\"ingredient\",\"x\":5,\"y\":20,\"fontSize\":\"sm\"}...]
Only return the JSON array, no markdown or explanation.";

            $visionPayload = [
                "contents" => [[
                    "parts" => [
                        ["text" => $visionPrompt],
                        ["inlineData" => ["mimeType" => "image/png", "data" => $embeddedResult['base64']]]
                    ]
                ]]
            ];
            
            $ch = curl_init($visionUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($visionPayload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            $visionResponse = curl_exec($ch);
            curl_close($ch);
            
            $visionJson = json_decode($visionResponse, true);
            $positionsRaw = $visionJson['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
            $positionsRaw = str_replace(['```json', '```'], '', trim($positionsRaw));
            $textPositionsJson = $positionsRaw;
        }
        
        // Fallback if no images generated
        if (!$finalImageUrl) {
            $finalImageUrl = "https://placehold.co/600x800/orange/white?text=" . urlencode("Overlay Gen Failed");
        }
        
    } else {
        // ========== EMBEDDED MODE: Single Image ==========
        $embeddedPrompt = "A visual recipe for '" . $titleForPrompt . "'. $styleDesc **Display the Title: '$titleForPrompt' prominently at the top.** Include stylish $langInstruction for ingredients and steps. $layoutInstruction $ratioInstruction Ingredients: $ingredientsStr. Steps: $stepsStr. CRITICAL VISUAL FOCUS: Prioritize stunning, detailed illustrations. Show beautifully arranged ingredients with realistic textures and colors. Include appetizing visuals of the finished dish with professional food styling. Add visual elements showing key cooking techniques. Use vibrant, natural colors and dramatic lighting. Create a composition that makes viewers hungry. Fill the canvas with engaging visual content. High clarity, 4k, professional food photography quality.";
        $result = generateImage($embeddedPrompt, $apiKey);
        $finalImageUrl = saveImage($result['base64']);
        
        if (!$finalImageUrl) {
            $curlErrMsg = isset($result['curlError']) && $result['curlError'] ? " (cURL: {$result['curlError']})" : "";
            error_log("Image Gen Failed. Code: " . $result['httpCode'] . $curlErrMsg);
            $finalImageUrl = "https://placehold.co/600x800/orange/white?text=" . urlencode("Gen Failed");
            $errObj = json_decode($result['response']);
            $errMsg = ($errObj && isset($errObj->error->message)) ? $errObj->error->message : ($result['curlError'] ?: 'API Timeout - Try Again');
            $recipeData['title_en'] .= " [Retry: " . $result['httpCode'] . " - $errMsg]";
        }
    }

    // --- STEP 4: SAVE TO DB ---
    // Determine which prompt was used for the final image
    $finalPromptToSave = "";
    if ($renderMode === 'overlay') {
        $finalPromptToSave = $cleanPrompt; // The clean image is the final one shown
    } else {
        $finalPromptToSave = $embeddedPrompt;
    }

    $stmt = $pdo->prepare("INSERT INTO recipes (title, ingredients_json, steps_json, image_url, image_embedded_url, style_type, view_type, layout_type, language_code, render_mode, text_positions_json, final_prompt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $title = $recipeData['title_ko'] . ' (' . $recipeData['title_en'] . ')';
    
    $ingredientsData = [
        'en' => $recipeData['ingredients_en'] ?? [],
        'ko' => $recipeData['ingredients_ko'] ?? []
    ];
    $stepsData = [
        'en' => $recipeData['steps_en'] ?? [],
        'ko' => $recipeData['steps_ko'] ?? []
    ];

    $stmt->execute([
        $title,
        json_encode($ingredientsData),
        json_encode($stepsData),
        $finalImageUrl,
        $embeddedImageUrl,
        $style,
        $ratio,
        $layout,
        $lang,
        $renderMode,
        $textPositionsJson,
        $finalPromptToSave
    ]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'id' => $newId,
        'data' => [
            'title' => $title,
            'image_url' => $finalImageUrl,
            'image_embedded_url' => $embeddedImageUrl,
            'ingredients' => $ingredientsData,
            'steps' => $stepsData,
            'text_positions' => json_decode($textPositionsJson, true),
            'render_mode' => $renderMode
        ]
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server Error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
