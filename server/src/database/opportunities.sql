CREATE TABLE IF NOT EXISTS opportunities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  author_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  type ENUM(
    'full_time',
    'part_time',
    'contract',
    'internship',
    'apprenticeship',
    'scholarship',
    'event'
  ) NOT NULL DEFAULT 'full_time',
  description VARCHAR(500) NULL,
  apply_url VARCHAR(500) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_opportunities_active (is_active, created_at),
  INDEX idx_opportunities_author (author_id),
  CONSTRAINT fk_opportunities_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
