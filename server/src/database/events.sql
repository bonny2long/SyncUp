-- ICCA events with optional RSVP support
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    author_id INT NOT NULL REFERENCES users(id),
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(300),
    requires_rsvp BOOLEAN DEFAULT FALSE,
    max_attendees INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (event_date),
    INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS event_rsvps (
    event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status ENUM('attending', 'not_attending') DEFAULT 'attending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);
