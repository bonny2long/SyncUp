SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_visibility');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN profile_visibility ENUM(''anyone'', ''team'', ''me'') DEFAULT ''team'' AFTER notify_weekly_summary', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'show_email');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN show_email BOOLEAN DEFAULT FALSE AFTER profile_visibility', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'show_projects');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN show_projects BOOLEAN DEFAULT TRUE AFTER show_email', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'show_skills');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN show_skills BOOLEAN DEFAULT TRUE AFTER show_projects', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'accept_mentorship');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN accept_mentorship BOOLEAN DEFAULT TRUE AFTER show_skills', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'auto_accept_teammates');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN auto_accept_teammates BOOLEAN DEFAULT FALSE AFTER accept_mentorship', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER auto_accept_teammates', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
