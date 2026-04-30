-- Add ICCA commencement fields to users
ALTER TABLE users
ADD COLUMN has_commenced BOOLEAN DEFAULT FALSE,
ADD COLUMN cycle VARCHAR(10) DEFAULT NULL;

-- Expand the role enum to support ICCA community roles
ALTER TABLE users
MODIFY COLUMN role ENUM('intern', 'mentor', 'resident', 'alumni', 'admin') DEFAULT 'intern';

-- Existing mentors and admins are already community members
UPDATE users
SET has_commenced = TRUE
WHERE role IN ('mentor', 'admin');
