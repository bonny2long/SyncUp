-- ============================================================
-- System Errors Table for Robust Error Handling
-- ============================================================

CREATE TABLE IF NOT EXISTS system_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  error_type ENUM('javascript', 'api', 'server', 'validation') NOT NULL DEFAULT 'server',
  message TEXT NOT NULL,
  stack TEXT,
  user_id INT,
  page_url VARCHAR(500),
  user_agent VARCHAR(500),
  status ENUM('open', 'resolved', 'ignored') NOT NULL DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME DEFAULT NULL,
  resolved_by INT DEFAULT NULL,
  INDEX idx_status (status),
  INDEX idx_error_type (error_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert some sample errors for testing
INSERT INTO system_errors (error_type, message, page_url, status) VALUES
('javascript', 'TypeError: Cannot read property "name" of undefined', '/dashboard', 'open'),
('api', 'Failed to fetch user data - 500 Internal Server Error', '/api/users', 'open'),
('server', 'Database connection timeout after 30s', '/api/projects', 'resolved'),
('validation', 'Invalid email format: missing @ symbol', '/api/auth/register', 'ignored');

SELECT * FROM system_errors ORDER BY created_at DESC LIMIT 10;
