CREATE TABLE IF NOT EXISTS welcome_reads (
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  CONSTRAINT fk_welcome_reads_message
    FOREIGN KEY (message_id) REFERENCES messages(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_welcome_reads_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_welcome_reads_user (user_id, seen_at)
);

