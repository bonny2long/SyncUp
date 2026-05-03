-- Public credential profile fields for community members.

SET @current_title_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN current_title VARCHAR(200) NULL AFTER featured_project_id',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'current_title'
);
PREPARE current_title_stmt FROM @current_title_sql;
EXECUTE current_title_stmt;
DEALLOCATE PREPARE current_title_stmt;

SET @current_employer_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN current_employer VARCHAR(200) NULL AFTER current_title',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'current_employer'
);
PREPARE current_employer_stmt FROM @current_employer_sql;
EXECUTE current_employer_stmt;
DEALLOCATE PREPARE current_employer_stmt;
