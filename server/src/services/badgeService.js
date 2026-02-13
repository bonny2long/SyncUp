import pool from "../config/db.js";

export const getAllBadges = async () => {
  const [rows] = await pool.query("SELECT * FROM badges ORDER BY category, id");
  return rows;
};

export const getUserBadges = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ub.*, b.badge_key, b.name, b.description, b.icon, b.category 
     FROM user_badges ub 
     JOIN badges b ON ub.badge_id = b.id 
     WHERE ub.user_id = ? 
     ORDER BY ub.earned_at DESC`,
    [userId]
  );
  return rows;
};

export const awardBadge = async (userId, badgeId) => {
  const [result] = await pool.query(
    "INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)",
    [userId, badgeId]
  );
  return result;
};

export const getUserStats = async (userId) => {
  const stats = {};

  const [updateCount] = await pool.query(
    "SELECT COUNT(*) as count FROM progress_updates WHERE user_id = ?",
    [userId]
  );
  stats.update_count = updateCount[0].count;

  const [skillSignals] = await pool.query(
    "SELECT COUNT(*) as count FROM user_skill_signals WHERE user_id = ?",
    [userId]
  );
  stats.total_signals = skillSignals[0].count;

  const [uniqueSkills] = await pool.query(
    "SELECT COUNT(DISTINCT skill_id) as count FROM user_skill_signals WHERE user_id = ?",
    [userId]
  );
  stats.unique_skills = uniqueSkills[0].count;

  const [maxSkillSignal] = await pool.query(
    `SELECT skill_id, COUNT(*) as count 
     FROM user_skill_signals 
     WHERE user_id = ? 
     GROUP BY skill_id 
     ORDER BY count DESC 
     LIMIT 1`,
    [userId]
  );
  stats.max_signals_single = maxSkillSignal.length > 0 ? maxSkillSignal[0].count : 0;

  const [projectsJoined] = await pool.query(
    "SELECT COUNT(*) as count FROM project_members WHERE user_id = ?",
    [userId]
  );
  stats.projects_joined = projectsJoined[0].count;

  const [projectsCompleted] = await pool.query(
    `SELECT COUNT(*) as count 
     FROM project_members pm
     JOIN projects p ON pm.project_id = p.id
     WHERE pm.user_id = ? AND p.status = 'completed'`,
    [userId]
  );
  stats.projects_completed = projectsCompleted[0].count;

  const [sessionsCompleted] = await pool.query(
    `SELECT COUNT(*) as count 
     FROM mentorship_sessions 
     WHERE (mentor_id = ? OR intern_id = ?) AND status = 'completed'`,
    [userId, userId]
  );
  stats.sessions_completed = sessionsCompleted[0].count;

  const [badgeCount] = await pool.query(
    "SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?",
    [userId]
  );
  stats.badges_earned = badgeCount[0].count;

  const [streakData] = await pool.query(
    `SELECT DATEDIFF(NOW(), MAX(DATE(created_at))) as days_since_active,
            COUNT(DISTINCT DATE(created_at)) as active_days
     FROM progress_updates 
     WHERE user_id = ? 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [userId]
  );
  stats.current_streak = streakData[0].active_days || 0;

  return stats;
};

export const checkAndAwardBadges = async (userId) => {
  const [userRows] = await pool.query("SELECT role FROM users WHERE id = ?", [userId]);
  if (userRows.length === 0 || userRows[0].role !== "intern") {
    return [];
  }

  const allBadges = await getAllBadges();
  const [existing] = await pool.query(
    "SELECT badge_id FROM user_badges WHERE user_id = ?",
    [userId]
  );
  const earnedIds = new Set(existing.map((e) => e.badge_id));

  const stats = await getUserStats(userId);
  const newBadges = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let earned = false;

    switch (badge.criteria_type) {
      case "account_created":
        earned = true;
        break;
      case "update_count":
        earned = stats.update_count >= badge.criteria_value;
        break;
      case "skill_signals":
      case "total_signals":
        earned = stats.total_signals >= badge.criteria_value;
        break;
      case "skill_signals_single":
        earned = stats.max_signals_single >= badge.criteria_value;
        break;
      case "unique_skills":
        earned = stats.unique_skills >= badge.criteria_value;
        break;
      case "projects_joined":
        earned = stats.projects_joined >= badge.criteria_value;
        break;
      case "projects_completed":
        earned = stats.projects_completed >= badge.criteria_value;
        break;
      case "sessions_completed":
        earned = stats.sessions_completed >= badge.criteria_value;
        break;
      case "badges_earned":
        earned = stats.badges_earned >= badge.criteria_value;
        break;
      case "streak_days":
        earned = stats.current_streak >= badge.criteria_value;
        break;
    }

    if (earned) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
      earnedIds.add(badge.id);
      stats.badges_earned++;
    }
  }

  return newBadges;
};
