import pool from "../config/db.js";

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:userId/profile
// Get comprehensive user profile with skills, projects, and stats
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get basic user info
    const [users] = await pool.query(
      "SELECT id, name, email, role, join_date FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user's skills with signal counts
    const [skills] = await pool.query(
      `
      SELECT 
        s.id,
        s.skill_name,
        s.category,
        COUNT(DISTINCT uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        MAX(uss.created_at) as last_practiced
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      ORDER BY total_weight DESC
      LIMIT 20
      `,
      [userId],
    );

    // Get user's projects
    const [projects] = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        COUNT(DISTINCT pm.user_id) as team_size,
        COUNT(DISTINCT ps.skill_id) as skill_count
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      WHERE p.owner_id = ?
      GROUP BY p.id, p.title, p.description, p.status, p.start_date, p.end_date
      ORDER BY p.start_date DESC
      LIMIT 5
      `,
      [userId],
    );

    // Get activity stats - only from projects they own or are member of
    let stats = {
      total_skills: 0,
      total_signals: 0,
      total_weight: 0,
      project_count: 0,
      update_count: 0,
      mentorship_count: 0,
      days_active: 0,
    };

    if (skills.length > 0 || projects.length > 0) {
      const [statsResult] = await pool.query(
        `
        SELECT 
          COUNT(DISTINCT uss.skill_id) as total_skills,
          COUNT(DISTINCT uss.id) as total_signals,
          COALESCE(SUM(uss.weight), 0) as total_weight,
          COUNT(DISTINCT CASE WHEN uss.source_type = 'project' AND p.owner_id = ? THEN uss.id END) as project_count,
          COUNT(DISTINCT CASE WHEN uss.source_type = 'update' AND pu.user_id = ? THEN uss.id END) as update_count,
          COUNT(DISTINCT CASE WHEN uss.source_type = 'mentorship' AND (ms.intern_id = ? OR ms.mentor_id = ?) THEN uss.id END) as mentorship_count,
          COALESCE(DATEDIFF(CURDATE(), MIN(DATE(uss.created_at))), 0) as days_active
        FROM user_skill_signals uss
        LEFT JOIN projects p ON uss.source_type = 'project' AND uss.source_id = p.id
        LEFT JOIN progress_updates pu ON uss.source_type = 'update' AND uss.source_id = pu.id
        LEFT JOIN mentorship_sessions ms ON uss.source_type = 'mentorship' AND uss.source_id = ms.id
        WHERE uss.user_id = ?
        `,
        [userId, userId, userId, userId, userId],
      );
      stats = statsResult[0] || stats;
    }

    // Get activity streak (distinct days active in last 30 days)
    const [streakData] = await pool.query(
      `
      SELECT 
        COALESCE(COUNT(DISTINCT DATE(uss.created_at)), 0) as current_streak
      FROM user_skill_signals uss
      WHERE uss.user_id = ? AND uss.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `,
      [userId],
    );

    res.json({
      user,
      skills,
      projects,
      stats,
      activity_streak: streakData[0]?.current_streak || 0,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// GET /api/users/:userId/skill-inventory
// Get detailed skill inventory with breakdown
export const getUserSkillInventory = async (req, res) => {
  const { userId } = req.params;

  try {
    const [skills] = await pool.query(
      `
      SELECT 
        s.id,
        s.skill_name,
        s.category,
        COUNT(uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        MAX(uss.created_at) as last_practiced,
        SUM(CASE WHEN uss.source_type = 'mentorship' THEN uss.weight ELSE 0 END) as mentorship_weight,
        SUM(CASE WHEN uss.source_type = 'update' THEN uss.weight ELSE 0 END) as update_weight,
        SUM(CASE WHEN uss.source_type = 'project' THEN uss.weight ELSE 0 END) as project_weight,
        CASE 
          WHEN SUM(uss.weight) >= 10 THEN 'Advanced'
          WHEN SUM(uss.weight) >= 5 THEN 'Intermediate'
          ELSE 'Beginner'
        END as proficiency_level
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      ORDER BY total_weight DESC
      `,
      [userId],
    );

    // Group by category
    const skillsByCategory = {};
    skills.forEach((skill) => {
      const cat = skill.category || "uncategorized";
      if (!skillsByCategory[cat]) {
        skillsByCategory[cat] = [];
      }
      skillsByCategory[cat].push(skill);
    });

    res.json({
      total_skills: skills.length,
      total_weight: skills.reduce((sum, s) => sum + (s.total_weight || 0), 0),
      by_category: skillsByCategory,
      all_skills: skills,
    });
  } catch (err) {
    console.error("Error fetching skill inventory:", err);
    res.status(500).json({ error: "Failed to fetch skill inventory" });
  }
};

// GET /api/users/:userId/activity-timeline
// Get recent activity for user (updates, mentorship, projects)
export const getUserActivityTimeline = async (req, res) => {
  const { userId } = req.params;

  try {
    const [activity] = await pool.query(
      `
      SELECT 
        'update' as type,
        pu.id,
        pu.content as description,
        pu.created_at,
        p.title as project_title,
        NULL as mentor_name
      FROM progress_updates pu
      LEFT JOIN projects p ON pu.project_id = p.id
      WHERE pu.user_id = ? AND pu.is_deleted = 0
      
      UNION ALL
      
      SELECT 
        'mentorship' as type,
        ms.id,
        ms.topic as description,
        ms.session_date as created_at,
        NULL as project_title,
        u.name as mentor_name
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      WHERE (ms.intern_id = ? OR ms.mentor_id = ?) AND ms.status = 'completed'
      
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [userId, userId, userId],
    );

    res.json(activity);
  } catch (err) {
    console.error("Error fetching activity timeline:", err);
    res.status(500).json({ error: "Failed to fetch activity timeline" });
  }
};
