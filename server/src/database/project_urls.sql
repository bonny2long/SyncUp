SET @db_name = DATABASE();

SET @github_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN github_url VARCHAR(500) NULL AFTER visibility',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'github_url'
);

PREPARE github_url_stmt FROM @github_url_sql;
EXECUTE github_url_stmt;
DEALLOCATE PREPARE github_url_stmt;

SET @live_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN live_url VARCHAR(500) NULL AFTER github_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'live_url'
);

PREPARE live_url_stmt FROM @live_url_sql;
EXECUTE live_url_stmt;
DEALLOCATE PREPARE live_url_stmt;
