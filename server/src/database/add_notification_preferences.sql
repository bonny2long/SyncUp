SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_notifications');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE AFTER bio', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_join_requests');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN notify_join_requests BOOLEAN DEFAULT TRUE AFTER email_notifications', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_mentions');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN notify_mentions BOOLEAN DEFAULT TRUE AFTER notify_join_requests', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_session_reminders');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN notify_session_reminders BOOLEAN DEFAULT TRUE AFTER notify_mentions', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_project_updates');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN notify_project_updates BOOLEAN DEFAULT TRUE AFTER notify_session_reminders', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'notify_weekly_summary');
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN notify_weekly_summary BOOLEAN DEFAULT FALSE AFTER notify_project_updates', 'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;
