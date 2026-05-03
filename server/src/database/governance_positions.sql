CREATE TABLE IF NOT EXISTS governance_positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  position ENUM(
    'president',
    'vice_president',
    'treasurer',
    'secretary',
    'parliamentarian',
    'tech_lead',
    'tech_member'
  ) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE KEY one_position_per_user (user_id, position),
  INDEX idx_active_position (is_active, position),
  CONSTRAINT fk_governance_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_governance_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);
