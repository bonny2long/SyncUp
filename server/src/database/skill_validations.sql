-- Skill Validations Table
-- Allows team members to validate each other's skill signals
-- and mentors to endorse intern skills

CREATE TABLE IF NOT EXISTS skill_validations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  signal_id INT NOT NULL,
  validator_id INT NOT NULL,
  validation_type ENUM('upvote', 'mentor_endorsement') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_validation (signal_id, validator_id, validation_type),
  FOREIGN KEY (signal_id) REFERENCES user_skill_signals(id) ON DELETE CASCADE,
  FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_signal_id (signal_id),
  INDEX idx_validator_id (validator_id)
);
