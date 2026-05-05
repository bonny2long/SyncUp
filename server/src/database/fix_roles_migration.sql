-- Fix user roles: Separate identity from permissions

SET @has_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_admin'
);
SET @ddl = IF(@has_col = 0, 'ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate existing admin users to alumni + is_admin
UPDATE users
SET role = 'alumni', is_admin = TRUE
WHERE role = 'admin';

-- Migrate existing mentor users to alumni
UPDATE users
SET role = 'alumni'
WHERE role = 'mentor';

-- Update role enum to remove admin and mentor (MODIFY is idempotent)
ALTER TABLE users
MODIFY COLUMN role ENUM('intern', 'resident', 'alumni') DEFAULT 'intern';
