-- Phase 8 notification foundation.
-- Allows new notification entity types and adds preference/grouping columns.

ALTER TABLE notifications
  MODIFY COLUMN related_type VARCHAR(50) NULL;

SET @has_group_key = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'notifications'
    AND COLUMN_NAME = 'group_key'
);
SET @ddl = IF(
  @has_group_key = 0,
  'ALTER TABLE notifications ADD COLUMN group_key VARCHAR(150) NULL AFTER related_type',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notify_channel_messages = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'notify_channel_messages'
);
SET @ddl = IF(
  @has_notify_channel_messages = 0,
  'ALTER TABLE users ADD COLUMN notify_channel_messages BOOLEAN DEFAULT TRUE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notify_dm_messages = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'notify_dm_messages'
);
SET @ddl = IF(
  @has_notify_dm_messages = 0,
  'ALTER TABLE users ADD COLUMN notify_dm_messages BOOLEAN DEFAULT TRUE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notify_opportunities = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'notify_opportunities'
);
SET @ddl = IF(
  @has_notify_opportunities = 0,
  'ALTER TABLE users ADD COLUMN notify_opportunities BOOLEAN DEFAULT TRUE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notify_events = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'notify_events'
);
SET @ddl = IF(
  @has_notify_events = 0,
  'ALTER TABLE users ADD COLUMN notify_events BOOLEAN DEFAULT TRUE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notify_encouragements = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'notify_encouragements'
);
SET @ddl = IF(
  @has_notify_encouragements = 0,
  'ALTER TABLE users ADD COLUMN notify_encouragements BOOLEAN DEFAULT TRUE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_digest_mode = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'digest_mode'
);
SET @ddl = IF(
  @has_digest_mode = 0,
  'ALTER TABLE users ADD COLUMN digest_mode BOOLEAN DEFAULT FALSE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx_notifications_group = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'notifications'
    AND INDEX_NAME = 'idx_notifications_group'
);
SET @ddl = IF(
  @has_idx_notifications_group = 0,
  'CREATE INDEX idx_notifications_group ON notifications(user_id, group_key, is_read, created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
