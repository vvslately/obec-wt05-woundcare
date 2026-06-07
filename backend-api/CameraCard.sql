-- -------------------------------------------------------------
-- TablePlus 6.9.1(670)
--
-- https://tableplus.com/
--
-- Database: thief_detection
-- Generation Time: 2569-06-06 17:19:04.4200
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `ai_possible_conditions`;
CREATE TABLE `ai_possible_conditions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `analysis_result_id` bigint unsigned NOT NULL,
  `condition_name_th` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition_name_en` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `probability` decimal(5,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_possible_conditions_analysis_id` (`analysis_result_id`),
  KEY `idx_possible_conditions_probability` (`probability`),
  CONSTRAINT `fk_possible_conditions_analysis` FOREIGN KEY (`analysis_result_id`) REFERENCES `ai_analysis_results` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `case_hospital_recommendations`;
CREATE TABLE `case_hospital_recommendations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wound_case_id` bigint unsigned NOT NULL,
  `hospital_id` bigint unsigned NOT NULL,
  `distance_km` decimal(7,2) DEFAULT NULL,
  `estimated_time_min` int unsigned DEFAULT NULL,
  `ranking` int unsigned DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_case_hospital_case_id` (`wound_case_id`),
  KEY `idx_case_hospital_hospital_id` (`hospital_id`),
  KEY `idx_case_hospital_ranking` (`ranking`),
  CONSTRAINT `fk_case_hospital_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_case_hospital_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `contact_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_emergency_contacts_user_id` (`user_id`),
  CONSTRAINT `fk_emergency_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `first_aid_recommendations`;
CREATE TABLE `first_aid_recommendations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `analysis_result_id` bigint unsigned NOT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_order` int unsigned DEFAULT '1',
  `is_warning` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_first_aid_analysis_id` (`analysis_result_id`),
  KEY `idx_first_aid_step_order` (`step_order`),
  CONSTRAINT `fk_first_aid_analysis` FOREIGN KEY (`analysis_result_id`) REFERENCES `ai_analysis_results` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `hospitals`;
CREATE TABLE `hospitals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` text COLLATE utf8mb4_unicode_ci,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `hospital_type` enum('government','private','clinic','other') COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `is_24_hours` tinyint(1) DEFAULT '0',
  `has_emergency` tinyint(1) DEFAULT '0',
  `has_dermatology` tinyint(1) DEFAULT '0',
  `has_wound_care` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hospitals_name` (`name`),
  KEY `idx_hospitals_location` (`latitude`,`longitude`),
  KEY `idx_hospitals_type` (`hospital_type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `wound_case_id` bigint unsigned DEFAULT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('analysis','follow_up','warning','hospital','system') COLLATE utf8mb4_unicode_ci DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_case` (`wound_case_id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  CONSTRAINT `fk_notifications_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_user_id` (`user_id`),
  KEY `idx_password_reset_expires_at` (`expires_at`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_refresh_tokens_user_id` (`user_id`),
  KEY `idx_refresh_tokens_expires_at` (`expires_at`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `saved_hospitals`;
CREATE TABLE `saved_hospitals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `hospital_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_saved_hospital` (`user_id`,`hospital_id`),
  KEY `fk_saved_hospitals_hospital` (`hospital_id`),
  KEY `idx_saved_hospitals_user_id` (`user_id`),
  CONSTRAINT `fk_saved_hospitals_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_hospitals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_consents`;
CREATE TABLE `user_consents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `consent_type` enum('terms','privacy_policy','health_data_storage','ai_analysis','location_access','marketing') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_accepted` tinyint(1) DEFAULT '1',
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accepted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_consents_user_id` (`user_id`),
  KEY `idx_user_consents_type` (`consent_type`),
  CONSTRAINT `fk_user_consents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_medical_profiles`;
CREATE TABLE `user_medical_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','other','not_specified') COLLATE utf8mb4_unicode_ci DEFAULT 'not_specified',
  `blood_type` enum('A','B','AB','O','unknown') COLLATE utf8mb4_unicode_ci DEFAULT 'unknown',
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `has_diabetes` tinyint(1) DEFAULT '0',
  `has_hypertension` tinyint(1) DEFAULT '0',
  `has_allergy` tinyint(1) DEFAULT '0',
  `has_skin_disease` tinyint(1) DEFAULT '0',
  `has_immune_disease` tinyint(1) DEFAULT '0',
  `has_bleeding_disorder` tinyint(1) DEFAULT '0',
  `is_pregnant` tinyint(1) DEFAULT '0',
  `allergy_detail` text COLLATE utf8mb4_unicode_ci,
  `current_medications` text COLLATE utf8mb4_unicode_ci,
  `chronic_disease_detail` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_medical_profile` (`user_id`),
  CONSTRAINT `fk_medical_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `language` enum('th','en') COLLATE utf8mb4_unicode_ci DEFAULT 'th',
  `theme` enum('light','dark','system') COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `push_notification` tinyint(1) DEFAULT '1',
  `email_notification` tinyint(1) DEFAULT '0',
  `sms_notification` tinyint(1) DEFAULT '0',
  `allow_location` tinyint(1) DEFAULT '1',
  `allow_health_data_storage` tinyint(1) DEFAULT '1',
  `allow_ai_analysis_history` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_settings` (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `role` enum('user','doctor','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `status` enum('active','inactive','banned','deleted') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `email_verified_at` datetime DEFAULT NULL,
  `phone_verified_at` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wound_cases`;
CREATE TABLE `wound_cases` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `case_code` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wound_location` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wound_body_part` enum('head','face','neck','chest','abdomen','back','arm','hand','leg','foot','other','unknown') COLLATE utf8mb4_unicode_ci DEFAULT 'unknown',
  `wound_duration` enum('less_3_days','3_7_days','1_4_weeks','more_4_weeks','unknown') COLLATE utf8mb4_unicode_ci DEFAULT 'unknown',
  `status` enum('pending','analyzing','analyzed','follow_up','closed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `location_address` text COLLATE utf8mb4_unicode_ci,
  `user_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `case_code` (`case_code`),
  KEY `idx_wound_cases_user_id` (`user_id`),
  KEY `idx_wound_cases_status` (`status`),
  KEY `idx_wound_cases_created_at` (`created_at`),
  KEY `idx_wound_cases_location` (`latitude`,`longitude`),
  CONSTRAINT `fk_wound_cases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wound_follow_ups`;
CREATE TABLE `wound_follow_ups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wound_case_id` bigint unsigned NOT NULL,
  `follow_up_image_url` text COLLATE utf8mb4_unicode_ci,
  `follow_up_image_storage_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `pain_level` enum('none','mild','moderate','severe') COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `is_better` tinyint(1) DEFAULT '0',
  `is_worse` tinyint(1) DEFAULT '0',
  `has_new_warning_sign` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_followups_case_id` (`wound_case_id`),
  KEY `idx_followups_created_at` (`created_at`),
  CONSTRAINT `fk_followups_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wound_images`;
CREATE TABLE `wound_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wound_case_id` bigint unsigned NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_storage_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_type` enum('original','cropped','follow_up') COLLATE utf8mb4_unicode_ci DEFAULT 'original',
  `mime_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` bigint unsigned DEFAULT NULL,
  `width_px` int unsigned DEFAULT NULL,
  `height_px` int unsigned DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wound_images_case_id` (`wound_case_id`),
  KEY `idx_wound_images_type` (`image_type`),
  CONSTRAINT `fk_wound_images_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wound_symptoms`;
CREATE TABLE `wound_symptoms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `wound_case_id` bigint unsigned NOT NULL,
  `pain_level` enum('none','mild','moderate','severe') COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `has_fever` tinyint(1) DEFAULT '0',
  `has_itching` tinyint(1) DEFAULT '0',
  `has_swelling` tinyint(1) DEFAULT '0',
  `has_redness` tinyint(1) DEFAULT '0',
  `has_pus` tinyint(1) DEFAULT '0',
  `has_bleeding` tinyint(1) DEFAULT '0',
  `has_bad_smell` tinyint(1) DEFAULT '0',
  `has_numbness` tinyint(1) DEFAULT '0',
  `has_warm_skin` tinyint(1) DEFAULT '0',
  `has_spreading_redness` tinyint(1) DEFAULT '0',
  `temperature_c` decimal(4,1) DEFAULT NULL,
  `additional_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wound_symptoms_case_id` (`wound_case_id`),
  CONSTRAINT `fk_wound_symptoms_case` FOREIGN KEY (`wound_case_id`) REFERENCES `wound_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `emergency_contacts` (`id`, `user_id`, `contact_name`, `relationship`, `phone`, `email`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 1, 'คุณแม่', 'แม่', '0899999999', NULL, 1, '2026-06-06 10:17:13', '2026-06-06 10:17:13');

INSERT INTO `hospitals` (`id`, `name`, `address`, `phone`, `website`, `latitude`, `longitude`, `hospital_type`, `is_24_hours`, `has_emergency`, `has_dermatology`, `has_wound_care`, `created_at`, `updated_at`) VALUES
(1, 'รพ. ศิริราช', '2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพมหานคร', '02-419-7000', 'https://www.si.mahidol.ac.th', 13.75889500, 100.48510300, 'government', 1, 1, 1, 1, '2026-06-06 10:17:13', '2026-06-06 10:17:13'),
(2, 'รพ. สมิติเวช สุขุมวิท', '133 ถนนสุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร', '02-022-2222', 'https://www.samitivejhospitals.com', 13.73432800, 100.57682700, 'private', 1, 1, 1, 1, '2026-06-06 10:17:13', '2026-06-06 10:17:13'),
(3, 'รพ. กรุงเทพคริสเตียน', '124 ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพมหานคร', '02-235-1000', 'https://www.bch.in.th', 13.72859000, 100.53118700, 'private', 1, 1, 1, 1, '2026-06-06 10:17:13', '2026-06-06 10:17:13');

INSERT INTO `user_consents` (`id`, `user_id`, `consent_type`, `is_accepted`, `version`, `accepted_at`, `revoked_at`) VALUES
(1, 1, 'terms', 1, '1.0', '2026-06-06 10:17:13', NULL),
(2, 1, 'privacy_policy', 1, '1.0', '2026-06-06 10:17:13', NULL),
(3, 1, 'health_data_storage', 1, '1.0', '2026-06-06 10:17:13', NULL),
(4, 1, 'ai_analysis', 1, '1.0', '2026-06-06 10:17:13', NULL),
(5, 1, 'location_access', 1, '1.0', '2026-06-06 10:17:13', NULL);

INSERT INTO `user_medical_profiles` (`id`, `user_id`, `birth_date`, `gender`, `blood_type`, `weight_kg`, `height_cm`, `has_diabetes`, `has_hypertension`, `has_allergy`, `has_skin_disease`, `has_immune_disease`, `has_bleeding_disorder`, `is_pregnant`, `allergy_detail`, `current_medications`, `chronic_disease_detail`, `created_at`, `updated_at`) VALUES
(1, 1, '2007-05-15', 'male', 'O', 60.00, 175.00, 1, 0, 1, 0, 0, 0, 0, 'แพ้ยา Penicillin', 'ไม่มี', 'มีเบาหวานและภูมิแพ้', '2026-06-06 10:17:13', '2026-06-06 10:17:13');

INSERT INTO `user_settings` (`id`, `user_id`, `language`, `theme`, `push_notification`, `email_notification`, `sms_notification`, `allow_location`, `allow_health_data_storage`, `allow_ai_analysis_history`, `created_at`, `updated_at`) VALUES
(1, 1, 'th', 'light', 1, 0, 0, 1, 1, 1, '2026-06-06 10:17:13', '2026-06-06 10:17:13');

INSERT INTO `users` (`id`, `full_name`, `username`, `email`, `phone`, `password_hash`, `avatar_url`, `role`, `status`, `email_verified_at`, `phone_verified_at`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Mood Quartz', 'moodquartz', 'mood@example.com', '0812345678', '$2b$10$REPLACE_WITH_REAL_HASH', NULL, 'user', 'active', NULL, NULL, NULL, '2026-06-06 10:17:13', '2026-06-06 10:17:13');



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;