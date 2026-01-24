-- ============================================================
-- SyncUp Prerequisites (Users & Skills Only)
-- Run this BEFORE the Node.js seeder
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_skill_signals;
TRUNCATE TABLE progress_updates;
TRUNCATE TABLE mentorship_sessions;
TRUNCATE TABLE mentor_availability;
TRUNCATE TABLE project_members;
TRUNCATE TABLE project_skills;
TRUNCATE TABLE projects;
TRUNCATE TABLE skills;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- SKILLS (30 skills - lowercase for API matching)
INSERT INTO skills (skill_name, category) VALUES
('react', 'frontend'),
('node.js', 'backend'),
('sql', 'backend'),
('javascript', 'frontend'),
('typescript', 'frontend'),
('python', 'backend'),
('api design', 'backend'),
('system design', 'backend'),
('debugging', 'technical'),
('git', 'technical'),
('docker', 'technical'),
('aws', 'technical'),
('testing', 'technical'),
('html/css', 'frontend'),
('express', 'backend'),
('mongodb', 'backend'),
('rest apis', 'backend'),
('graphql', 'backend'),
('communication', 'soft'),
('leadership', 'soft'),
('collaboration', 'soft'),
('problem solving', 'soft'),
('time management', 'soft'),
('critical thinking', 'soft'),
('presentation', 'soft'),
('mentoring', 'soft'),
('project management', 'soft'),
('adaptability', 'soft'),
('code review', 'soft'),
('documentation', 'soft');

-- USERS (8 users: 4 interns, 3 mentors, 1 admin)
INSERT INTO users (name, email, role, join_date) VALUES
('Alex Rivers', 'alex.rivers@syncup.dev', 'intern', DATE_SUB(NOW(), INTERVAL 45 DAY)),
('Maya Chen', 'maya.chen@syncup.dev', 'intern', DATE_SUB(NOW(), INTERVAL 38 DAY)),
('Jordan Park', 'jordan.park@syncup.dev', 'intern', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('Sam Foster', 'sam.foster@syncup.dev', 'intern', DATE_SUB(NOW(), INTERVAL 22 DAY)),
('Dr. Sarah Kim', 'sarah.kim@syncup.dev', 'mentor', DATE_SUB(NOW(), INTERVAL 180 DAY)),
('Carlos Martinez', 'carlos.m@syncup.dev', 'mentor', DATE_SUB(NOW(), INTERVAL 150 DAY)),
('Priya Sharma', 'priya.sharma@syncup.dev', 'mentor', DATE_SUB(NOW(), INTERVAL 120 DAY)),
('Admin User', 'admin@syncup.dev', 'admin', DATE_SUB(NOW(), INTERVAL 365 DAY));

-- MENTOR AVAILABILITY (10 slots)
INSERT INTO mentor_availability (mentor_id, available_date, available_time) VALUES
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'),
(5, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00'),
(5, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '11:00:00'),
(6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00'),
(6, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:00:00'),
(6, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '13:00:00'),
(7, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00'),
(7, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00'),
(7, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00'),
(7, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '11:00:00');

SELECT 'Prerequisites loaded!' AS Status;
SELECT COUNT(*) AS skills FROM skills;
SELECT COUNT(*) AS users FROM users;