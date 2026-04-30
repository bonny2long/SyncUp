-- Announcements: pinned org content and time-limited news
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL REFERENCES users(id),
    announcement_type ENUM('pinned', 'news', 'event_promo') DEFAULT 'news',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active, created_at DESC),
    INDEX idx_type (announcement_type)
);

INSERT INTO announcements (title, content, author_id, announcement_type, expires_at) VALUES
('ICCA Bylaws', 'Link to bylaws document goes here. Admin: update this content.', 1, 'pinned', NULL),
('Code of Conduct', 'Link to code of conduct goes here. Admin: update this content.', 1, 'pinned', NULL);
