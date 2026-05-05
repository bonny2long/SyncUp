SET @has_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'has_commenced'
);
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN has_commenced BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'cycle'
);
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN cycle VARCHAR(10) DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- MODIFY is idempotent: safe to run repeatedly
ALTER TABLE users
MODIFY COLUMN role ENUM('intern', 'mentor', 'resident', 'alumni', 'admin') DEFAULT 'intern';

UPDATE users
SET has_commenced = TRUE
WHERE role IN ('mentor', 'admin');
