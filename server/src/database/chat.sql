-- =============================================
-- Chat System Tables
-- =============================================

-- Channels (user-created group chats)
CREATE TABLE IF NOT EXISTS channels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_channel_name (name)
);

-- Channel members (who's in which channel)
CREATE TABLE IF NOT EXISTS channel_members (
    channel_id INT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- Messages (both channel messages and DMs)
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
    sender_id INT NOT NULL REFERENCES users(id),
    recipient_id INT REFERENCES users(id),  -- NULL for channel messages, set for DMs
    content TEXT NOT NULL,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_channel (channel_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at DESC)
);

-- User presence (online/offline status)
CREATE TABLE IF NOT EXISTS user_presence (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_channel_id INT REFERENCES channels(id) ON DELETE SET NULL
);

-- Insert default channels
INSERT INTO channels (name, description, created_by, is_private) VALUES 
('general', 'General discussion', 1, FALSE),
('announcements', 'Important announcements', 1, FALSE);

-- Add all existing users to general channel (for demo)
INSERT INTO channel_members (channel_id, user_id)
SELECT 1, id FROM users WHERE id != 1;

-- Initialize presence for all users as offline
INSERT INTO user_presence (user_id, status)
SELECT id, 'offline' FROM users ON DUPLICATE KEY UPDATE status = 'offline';

-- Verify tables
SELECT 'channels' as table_name, COUNT(*) as count FROM channels
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'user_presence', COUNT(*) FROM user_presence;
