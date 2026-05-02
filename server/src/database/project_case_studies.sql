-- Add public case-study fields to projects.

SET @case_problem_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN case_study_problem TEXT NULL AFTER live_url',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'case_study_problem'
);
PREPARE case_problem_stmt FROM @case_problem_sql;
EXECUTE case_problem_stmt;
DEALLOCATE PREPARE case_problem_stmt;

SET @case_solution_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN case_study_solution TEXT NULL AFTER case_study_problem',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'case_study_solution'
);
PREPARE case_solution_stmt FROM @case_solution_sql;
EXECUTE case_solution_stmt;
DEALLOCATE PREPARE case_solution_stmt;

SET @case_tech_stack_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN case_study_tech_stack VARCHAR(500) NULL AFTER case_study_solution',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'case_study_tech_stack'
);
PREPARE case_tech_stack_stmt FROM @case_tech_stack_sql;
EXECUTE case_tech_stack_stmt;
DEALLOCATE PREPARE case_tech_stack_stmt;

SET @case_outcomes_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN case_study_outcomes TEXT NULL AFTER case_study_tech_stack',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'case_study_outcomes'
);
PREPARE case_outcomes_stmt FROM @case_outcomes_sql;
EXECUTE case_outcomes_stmt;
DEALLOCATE PREPARE case_outcomes_stmt;

SET @case_artifact_url_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE projects ADD COLUMN case_study_artifact_url VARCHAR(500) NULL AFTER case_study_outcomes',
    'SELECT 1'
  )
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'case_study_artifact_url'
);
PREPARE case_artifact_url_stmt FROM @case_artifact_url_sql;
EXECUTE case_artifact_url_stmt;
DEALLOCATE PREPARE case_artifact_url_stmt;
