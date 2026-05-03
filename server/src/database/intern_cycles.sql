CREATE TABLE IF NOT EXISTS intern_cycles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cycle_name VARCHAR(10) NOT NULL UNIQUE,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('active', 'commenced', 'closed') DEFAULT 'active',
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_intern_cycles_status (status),
  CONSTRAINT fk_intern_cycles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

SET @has_intern_cycle_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'intern_cycle_id'
);
SET @add_intern_cycle_id_sql := IF(
  @has_intern_cycle_id = 0,
  'ALTER TABLE users ADD COLUMN intern_cycle_id INT NULL AFTER cycle',
  'SELECT 1'
);
PREPARE add_intern_cycle_id_stmt FROM @add_intern_cycle_id_sql;
EXECUTE add_intern_cycle_id_stmt;
DEALLOCATE PREPARE add_intern_cycle_id_stmt;

SET @has_intern_cycle_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'idx_users_intern_cycle_id'
);
SET @add_intern_cycle_idx_sql := IF(
  @has_intern_cycle_idx = 0,
  'CREATE INDEX idx_users_intern_cycle_id ON users(intern_cycle_id)',
  'SELECT 1'
);
PREPARE add_intern_cycle_idx_stmt FROM @add_intern_cycle_idx_sql;
EXECUTE add_intern_cycle_idx_stmt;
DEALLOCATE PREPARE add_intern_cycle_idx_stmt;

SET @has_intern_cycle_fk := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND CONSTRAINT_NAME = 'fk_users_intern_cycle'
);
SET @add_intern_cycle_fk_sql := IF(
  @has_intern_cycle_fk = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_intern_cycle FOREIGN KEY (intern_cycle_id) REFERENCES intern_cycles(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE add_intern_cycle_fk_stmt FROM @add_intern_cycle_fk_sql;
EXECUTE add_intern_cycle_fk_stmt;
DEALLOCATE PREPARE add_intern_cycle_fk_stmt;
