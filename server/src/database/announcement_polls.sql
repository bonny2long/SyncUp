CREATE TABLE IF NOT EXISTS polls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  announcement_id INT NOT NULL,
  question VARCHAR(300) NOT NULL,
  poll_type ENUM('yes_no', 'multiple_choice') DEFAULT 'yes_no',
  closes_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_polls_announcement (announcement_id, is_active),
  CONSTRAINT fk_polls_announcement
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  poll_id INT NOT NULL,
  option_text VARCHAR(200) NOT NULL,
  display_order INT DEFAULT 0,
  INDEX idx_poll_options_poll (poll_id, display_order),
  CONSTRAINT fk_poll_options_poll
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  poll_id INT NOT NULL,
  poll_option_id INT NOT NULL,
  user_id INT NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_vote_per_user_per_poll (poll_id, user_id),
  INDEX idx_poll_votes_poll (poll_id),
  CONSTRAINT fk_poll_votes_poll
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  CONSTRAINT fk_poll_votes_option
    FOREIGN KEY (poll_option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  CONSTRAINT fk_poll_votes_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
