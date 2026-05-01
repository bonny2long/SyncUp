-- Foundation cleanup for the ICCA lifecycle model:
-- interns live in the lobby; commenced members are residents/alumni/mentors/admins.

UPDATE users
SET role = 'resident',
    has_commenced = TRUE
WHERE role = 'intern'
  AND has_commenced = TRUE;

UPDATE users
SET has_commenced = TRUE
WHERE role IN ('resident', 'alumni', 'mentor', 'admin');

INSERT IGNORE INTO channels
  (name, description, created_by, is_private, channel_type, allowed_roles)
SELECT
  'introductions',
  'Welcome new ICAA community members',
  admin_user.id,
  FALSE,
  'community',
  NULL
FROM (
  SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1
) AS admin_user;
