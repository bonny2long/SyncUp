-- Add privacy settings columns to users table
ALTER TABLE users ADD COLUMN profile_visibility ENUM('anyone', 'team', 'me') DEFAULT 'team' AFTER notify_weekly_summary;
ALTER TABLE users ADD COLUMN show_email BOOLEAN DEFAULT FALSE AFTER profile_visibility;
ALTER TABLE users ADD COLUMN show_projects BOOLEAN DEFAULT TRUE AFTER show_email;
ALTER TABLE users ADD COLUMN show_skills BOOLEAN DEFAULT TRUE AFTER show_projects;
ALTER TABLE users ADD COLUMN accept_mentorship BOOLEAN DEFAULT TRUE AFTER show_skills;
ALTER TABLE users ADD COLUMN auto_accept_teammates BOOLEAN DEFAULT FALSE AFTER accept_mentorship;
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER auto_accept_teammates;
