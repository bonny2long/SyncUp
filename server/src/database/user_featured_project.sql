-- Allow members to manually choose the project featured on their profile.

SET @featured_project_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN featured_project_id INT NULL AFTER personal_site_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'featured_project_id'
);
PREPARE featured_project_stmt FROM @featured_project_sql;
EXECUTE featured_project_stmt;
DEALLOCATE PREPARE featured_project_stmt;
