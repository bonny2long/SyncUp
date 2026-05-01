SET @db_name = DATABASE();

SET @headline_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN headline VARCHAR(160) NULL AFTER bio',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'headline'
);

PREPARE headline_stmt FROM @headline_sql;
EXECUTE headline_stmt;
DEALLOCATE PREPARE headline_stmt;

SET @github_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN github_url VARCHAR(500) NULL AFTER headline',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'github_url'
);

PREPARE github_url_stmt FROM @github_url_sql;
EXECUTE github_url_stmt;
DEALLOCATE PREPARE github_url_stmt;

SET @linkedin_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(500) NULL AFTER github_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'linkedin_url'
);

PREPARE linkedin_url_stmt FROM @linkedin_url_sql;
EXECUTE linkedin_url_stmt;
DEALLOCATE PREPARE linkedin_url_stmt;

SET @personal_site_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN personal_site_url VARCHAR(500) NULL AFTER linkedin_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'personal_site_url'
);

PREPARE personal_site_url_stmt FROM @personal_site_url_sql;
EXECUTE personal_site_url_stmt;
DEALLOCATE PREPARE personal_site_url_stmt;
