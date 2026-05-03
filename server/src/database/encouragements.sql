CREATE TABLE IF NOT EXISTS encouragements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  author_id INT NOT NULL,
  author_cycle VARCHAR(10) NULL,
  author_role VARCHAR(20) NULL,
  message TEXT NOT NULL,
  target_cycle VARCHAR(10) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_encouragements_active (is_active, created_at),
  INDEX idx_encouragements_target (target_cycle, is_active),
  INDEX idx_encouragements_author (author_id),
  CONSTRAINT fk_encouragements_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
