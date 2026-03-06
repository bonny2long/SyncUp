-- Add notification preference columns to users table
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE AFTER bio;
ALTER TABLE users ADD COLUMN notify_join_requests BOOLEAN DEFAULT TRUE AFTER email_notifications;
ALTER TABLE users ADD COLUMN notify_mentions BOOLEAN DEFAULT TRUE AFTER notify_join_requests;
ALTER TABLE users ADD COLUMN notify_session_reminders BOOLEAN DEFAULT TRUE AFTER notify_mentions;
ALTER TABLE users ADD COLUMN notify_project_updates BOOLEAN DEFAULT TRUE AFTER notify_session_reminders;
ALTER TABLE users ADD COLUMN notify_weekly_summary BOOLEAN DEFAULT FALSE AFTER notify_project_updates;
