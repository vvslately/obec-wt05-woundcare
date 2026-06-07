-- Parent table for AI wound analysis (required by ai_possible_conditions & first_aid_recommendations)

CREATE TABLE IF NOT EXISTS `ai_analysis_results` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wound_case_id` bigint unsigned NOT NULL,
  `ai_source` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ai_model` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ai_note` text COLLATE utf8mb4_unicode_ci,
  `risk_score` decimal(5,2) NOT NULL,
  `risk_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disclaimer` text COLLATE utf8mb4_unicode_ci,
  `warning_note` text COLLATE utf8mb4_unicode_ci,
  `findings` json DEFAULT NULL,
  `emergency_warnings` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_analysis_wound_case_id` (`wound_case_id`),
  KEY `idx_ai_analysis_created_at` (`created_at`),
  CONSTRAINT `fk_ai_analysis_wound_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
