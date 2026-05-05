-- Add missing default channels (safe to run — INSERT IGNORE won't duplicate)
INSERT IGNORE INTO channels (name, description, created_by, is_private) VALUES
('opportunities', 'Jobs and opportunities shared by the community', 1, FALSE),
('introductions', 'Welcome new iCAA community members', 1, FALSE),
('events', 'Upcoming iCAA events and activities', 1, FALSE);

-- Add all community members to default channels
INSERT IGNORE INTO channel_members (channel_id, user_id)
SELECT c.id, u.id
FROM channels c
CROSS JOIN users u
WHERE c.name IN ('general', 'announcements', 'opportunities', 'introductions', 'events')
  AND u.role IN ('alumni', 'resident')
  AND (u.is_active IS NULL OR u.is_active != FALSE);
