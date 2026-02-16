-- server/src/database/add_performance_indexes.sql
-- Performance Indexes for SyncUp Database
-- Run this to add missing indexes for query optimization
-- Execute with: mysql -u root -p syncup < src/database/add_performance_indexes.sql

-- ============================================
-- USER_SKILL_SIGNALS INDEXES
-- ============================================

-- Composite index for user profile queries (user_id + skill aggregation)
CREATE INDEX IF NOT EXISTS idx_signals_user_skill 
ON user_skill_signals(user_id, skill_id);

-- Index for time-based queries (momentum, activity streaks)
CREATE INDEX IF NOT EXISTS idx_signals_user_created 
ON user_skill_signals(user_id, created_at DESC);

-- Index for skill-based lookups
CREATE INDEX IF NOT EXISTS idx_signals_skill 
ON user_skill_signals(skill_id);

-- Index for source_type + source_id queries (project signals)
CREATE INDEX IF NOT EXISTS idx_signals_source 
ON user_skill_signals(source_type, source_id);

-- ============================================
-- PROJECT_MEMBERS INDEXES
-- ============================================

-- Index for project membership lookups
CREATE INDEX IF NOT EXISTS idx_pm_project 
ON project_members(project_id);

-- Composite index for checking user-project relationship
CREATE INDEX IF NOT EXISTS idx_pm_user_project 
ON project_members(user_id, project_id);

-- ============================================
-- MENTORSHIP SESSIONS INDEXES
-- ============================================

-- Index for mentor availability queries
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_date 
ON mentorship_sessions(mentor_id, session_date);

-- Index for project-based session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_project 
ON mentorship_sessions(project_id, status);

-- Index for intern-based session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_intern 
ON mentorship_sessions(intern_id, status);

-- ============================================
-- PROGRESS UPDATES INDEXES
-- ============================================

-- Index for project timeline queries
CREATE INDEX IF NOT EXISTS idx_progress_project_date 
ON progress_updates(project_id, created_at DESC);

-- Index for user activity queries
CREATE INDEX IF NOT EXISTS idx_progress_user 
ON progress_updates(user_id, created_at DESC);

-- ============================================
-- SKILLS INDEXES
-- ============================================

-- Index for skill name lookups (case-insensitive search)
CREATE INDEX IF NOT EXISTS idx_skills_name 
ON skills(skill_name);

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_skills_category 
ON skills(category);

-- ============================================
-- PROJECT SKILLS INDEXES
-- ============================================

-- Index for project skill lookups
CREATE INDEX IF NOT EXISTS idx_ps_project 
ON project_skills(project_id);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

-- Index for user notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user 
ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- PROJECT JOIN REQUESTS INDEXES
-- ============================================

-- Index for pending request lookups
CREATE INDEX IF NOT EXISTS idx_pjr_project_status 
ON project_join_requests(project_id, status);

-- ============================================
-- SKILL VALIDATIONS INDEXES
-- ============================================

-- Index for validation lookups by signal
CREATE INDEX IF NOT EXISTS idx_sv_signal 
ON skill_validations(signal_id);

-- Index for user's given validations
CREATE INDEX IF NOT EXISTS idx_sv_validator 
ON skill_validations(validator_id);

-- ============================================
-- CONFIRMATION
-- ============================================

SELECT 'Indexes created successfully!' AS status;
