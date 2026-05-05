-- Cohort Messages Table (intern-to-intern communication)
CREATE TABLE IF NOT EXISTS cohort_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cycle_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cycle (cycle_id, created_at),
    FOREIGN KEY (cycle_id) REFERENCES intern_cycles(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add all interns to cohort channels (optional - for reference)
-- This table acts as a messaging system scoped to intern_cycle_id
