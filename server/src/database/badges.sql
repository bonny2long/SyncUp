-- =============================================
-- Badges Schema and Seed Data
-- =============================================

-- Badge definitions table
CREATE TABLE IF NOT EXISTS badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    badge_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(50) NOT NULL,
    category ENUM('starter', 'progress', 'collaboration', 'elite') NOT NULL,
    criteria_type VARCHAR(50) NOT NULL,
    criteria_value INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned)
CREATE TABLE IF NOT EXISTS user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    badge_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_badge (user_id, badge_id)
);

-- Seed badge definitions
INSERT INTO badges (badge_key, name, description, icon, category, criteria_type, criteria_value) VALUES
-- Starter Badges
('first_steps', 'First Steps', 'Welcome to SyncUp!', 'Footprints', 'starter', 'account_created', 1),
('note_taker', 'Note Taker', 'Posted your first update', 'FileText', 'starter', 'update_count', 1),
('focused', 'Focused', 'Practiced your first skill', 'Target', 'starter', 'skill_signals', 1),
('builder', 'Builder', 'Joined your first project', 'Hammer', 'starter', 'projects_joined', 1),

-- Progress Badges
('specialist', 'Specialist', '10+ signals in one skill', 'Star', 'progress', 'skill_signals_single', 10),
('generalist', 'Generalist', 'Practiced 5 different skills', 'Palette', 'progress', 'unique_skills', 5),
('committed', 'Committed', '7-day activity streak', 'Flame', 'progress', 'streak_days', 7),
('learner', 'Learner', '20+ total skill signals', 'BookOpen', 'progress', 'total_signals', 20),

-- Collaboration Badges
('team_player', 'Team Player', 'Joined 3 projects', 'Users', 'collaboration', 'projects_joined', 3),
('mentor', 'Mentor', 'Completed 3 mentorship sessions', 'GraduationCap', 'collaboration', 'sessions_completed', 3),
('finisher', 'Finisher', 'Completed your first project', 'CheckCircle', 'collaboration', 'projects_completed', 1),
('graduate', 'Graduate', 'Completed 5 projects', 'Award', 'collaboration', 'projects_completed', 5),

-- Elite Badges
('expert', 'Expert', '50+ signals in one skill', 'Zap', 'elite', 'skill_signals_single', 50),
('master_builder', 'Master Builder', 'Completed 10 projects', 'Trophy', 'elite', 'projects_completed', 10),
('all_star', 'All-Star', 'Earned 10 badges', 'Crown', 'elite', 'badges_earned', 10),
('on_fire', 'On Fire', '30-day activity streak', 'Flame', 'elite', 'streak_days', 30);

-- Verify seed data
SELECT id, badge_key, name, icon, category FROM badges ORDER BY category, id;
