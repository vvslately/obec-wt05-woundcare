-- MySQL schema for "obec-thief-detector"
-- Run this manually after creating DB (DB_NAME)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  device_uid VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_devices_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  user_id INT NOT NULL,
  alert_type VARCHAR(80) NOT NULL,
  severity INT NOT NULL DEFAULT 3,
  confidence DECIMAL(5,4) NULL,
  occurred_at DATETIME NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alerts_user_id (user_id),
  INDEX idx_alerts_occurred_at (occurred_at),
  CONSTRAINT fk_alerts_device
    FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE CASCADE
);

