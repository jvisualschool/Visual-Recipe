DROP TABLE IF EXISTS `recipes`;

CREATE TABLE `recipes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `ingredients_json` JSON NOT NULL COMMENT 'List of ingredients',
  `steps_json` JSON NOT NULL COMMENT 'List of cooking steps',
  `image_url` TEXT NOT NULL,
  `image_embedded_url` TEXT DEFAULT NULL COMMENT 'URL of image with embedded text',
  `view_type` ENUM('vertical', 'horizontal', 'square') DEFAULT 'vertical' COMMENT 'Canvas Ratio',
  `layout_type` ENUM('standard', 'bento', 'radial', 'magazine') DEFAULT 'standard',
  `style_type` VARCHAR(50) DEFAULT 'minimal',
  `language_code` ENUM('ko', 'en', 'bilingual') DEFAULT 'ko',
  `render_mode` VARCHAR(20) DEFAULT 'embedded' COMMENT 'embedded or overlay',
  `text_positions_json` JSON DEFAULT NULL COMMENT 'Detected text positions for overlay',
  `final_prompt` TEXT DEFAULT NULL COMMENT 'Prompt used for generation',
  `likes` INT DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `tags` VARCHAR(255) DEFAULT NULL COMMENT 'Hashtags',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data
INSERT INTO `recipes` (`title`, `ingredients_json`, `steps_json`, `image_url`, `view_type`, `layout_type`, `style_type`, `language_code`) VALUES 
('Test Gimbap', '["Rice", "Seaweed", "Carrot"]', '["Spread rice", "Place ingredients", "Roll"]', 'https://placehold.co/600x400?text=Gimbap', 'horizontal', 'standard', 'minimal', 'en');
