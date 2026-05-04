-- Fix user roles: Separate identity from permissions
-- Run this on your dev DB first, verify, then production

-- 1. Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- 2. Migrate existing admin users to alumni + is_admin
-- They went through the program so they're alumni
UPDATE users 
SET role = 'alumni', is_admin = TRUE 
WHERE role = 'admin';

-- 3. Migrate existing mentor users to alumni
-- Mentor is earned behavior, not a role
UPDATE users 
SET role = 'alumni' 
WHERE role = 'mentor';

-- 4. Update role enum to remove admin and mentor
ALTER TABLE users 
MODIFY COLUMN role ENUM('intern', 'resident', 'alumni') DEFAULT 'intern';

-- 5. Verify the changes
-- SELECT id, name, email, role, is_admin FROM users;
