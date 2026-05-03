-- Ensure the mentor credibility badge exists.

INSERT IGNORE INTO badges
  (badge_key, name, description, icon, category, criteria_type, criteria_value)
VALUES
  (
    'mentor',
    'Mentor',
    'Completed 3 mentorship sessions',
    'GraduationCap',
    'collaboration',
    'sessions_completed',
    3
  );
