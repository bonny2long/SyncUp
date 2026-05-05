SET @has_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'channels' AND COLUMN_NAME = 'allowed_roles'
);
SET @ddl = IF(@has_col = 0, 'ALTER TABLE channels ADD COLUMN allowed_roles JSON DEFAULT NULL', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'channels' AND COLUMN_NAME = 'channel_type'
);
SET @ddl = IF(@has_col = 0, 'ALTER TABLE channels ADD COLUMN channel_type ENUM(''general'', ''announcements'', ''community'', ''restricted'') DEFAULT ''general''', 'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tag existing channels
UPDATE channels SET channel_type = 'announcements' WHERE name = 'announcements';
UPDATE channels SET channel_type = 'general' WHERE name = 'general';

-- Seed default community channels
INSERT IGNORE INTO channels (name, description, created_by, is_private, channel_type, allowed_roles) VALUES
('introductions', 'Welcome new IC Stars members', 1, FALSE, 'community', NULL),
('opportunities', 'Jobs, gigs, and collaborations', 1, FALSE, 'community', NULL),
('events', 'Upcoming ICCA events', 1, FALSE, 'community', NULL),
('residents', 'Resident-specific space', 1, FALSE, 'restricted', '["resident"]'),
('alumni-network', 'Alumni community', 1, FALSE, 'restricted', '["alumni", "resident"]');

-- Add existing community members to the shared channels
INSERT IGNORE INTO channel_members (channel_id, user_id)
SELECT c.id, u.id
FROM channels c
CROSS JOIN users u
WHERE u.role IN ('resident', 'alumni', 'admin')
  AND c.name IN ('introductions', 'opportunities', 'events');
