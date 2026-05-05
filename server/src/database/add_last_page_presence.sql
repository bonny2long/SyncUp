-- =============================================
-- Add last_page to user_presence
-- =============================================

ALTER TABLE user_presence ADD COLUMN last_page VARCHAR(255) DEFAULT NULL;
