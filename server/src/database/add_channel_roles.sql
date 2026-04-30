-- Add channel visibility metadata
ALTER TABLE channels
ADD COLUMN allowed_roles JSON DEFAULT NULL,
ADD COLUMN channel_type ENUM('general', 'announcements', 'community', 'restricted') DEFAULT 'general';

-- Tag existing channels
UPDATE channels SET channel_type = 'announcements' WHERE name = 'announcements';
UPDATE channels SET channel_type = 'general' WHERE name = 'general';

-- Seed default community channels
INSERT INTO channels (name, description, created_by, is_private, channel_type, allowed_roles) VALUES
('introductions', 'Welcome new IC Stars members', 1, FALSE, 'community', NULL),
('opportunities', 'Jobs, gigs, and collaborations', 1, FALSE, 'community', NULL),
('events', 'Upcoming ICCA events', 1, FALSE, 'community', NULL),
('residents', 'Resident-specific space', 1, FALSE, 'restricted', '["resident"]'),
('alumni-network', 'Alumni community', 1, FALSE, 'restricted', '["alumni", "resident"]');

-- Add existing community members to the shared channels
INSERT INTO channel_members (channel_id, user_id)
SELECT c.id, u.id
FROM channels c
CROSS JOIN users u
WHERE u.role IN ('mentor', 'admin')
  AND c.name IN ('introductions', 'opportunities', 'events')
ON DUPLICATE KEY UPDATE joined_at = joined_at;
