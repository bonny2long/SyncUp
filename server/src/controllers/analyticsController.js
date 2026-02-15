import pool from "../config/db.js";

// Utility to detect soft-delete column on progress_updates
let hasProgressSoftDelete;
async function ensureProgressSoftDelete() {
  if (hasProgressSoftDelete !== undefined) return hasProgressSoftDelete;
  try {
    const [rows] = await pool.query(
      `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'progress_updates'
        AND COLUMN_NAME = 'is_deleted'
      LIMIT 1;
      `
    );
    hasProgressSoftDelete = rows.length > 0;
  } catch (err) {
    hasProgressSoftDelete = false;
  }
  return hasProgressSoftDelete;
}

// GET /api/analytics/projects/active
export const getActiveProjects = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS active_projects FROM projects WHERE status = 'active'`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching active projects analytics:", err);
    res.status(500).json({ error: "Server error fetching active projects" });
  }
};

// GET /api/analytics/updates/weekly
export const getWeeklyUpdates = async (_req, res) => {
  try {
    const softDelete = await ensureProgressSoftDelete();
    const conditions = [];
    if (softDelete) {
      conditions.push("(is_deleted IS NULL OR is_deleted = 0)");
    }
    conditions.push("created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)");
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM progress_updates
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching weekly updates analytics:", err);
    res.status(500).json({ error: "Server error fetching updates analytics" });
  }
};

// GET /api/analytics/mentors/engagement
export const getMentorEngagement = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COUNT(ms.id) AS total_sessions,
        SUM(CASE WHEN ms.status = 'completed' THEN 1 ELSE 0 END) AS completed_sessions,
        SUM(CASE WHEN ms.status = 'accepted' THEN 1 ELSE 0 END) AS accepted_sessions,
        SUM(CASE WHEN ms.status = 'pending' THEN 1 ELSE 0 END) AS pending_sessions
      FROM users u
      LEFT JOIN mentorship_sessions ms ON ms.mentor_id = u.id AND ms.status IS NOT NULL
      WHERE u.role = 'mentor'
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY total_sessions DESC;
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching mentor engagement analytics:", err);
    res
      .status(500)
      .json({ error: "Server error fetching mentor engagement analytics" });
  }
};

// GET /api/analytics/correlation/mentorship-growth - Teams with mentorship grow faster
export const getMentorshipGrowthCorrelation = async (_req, res) => {
  try {
    // Get interns with mentorship sessions
    const [withMentorship] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(DISTINCT ms.id) as session_count,
        COUNT(DISTINCT uss.skill_id) as unique_skills,
        SUM(uss.weight) as total_skill_weight
      FROM users u
      LEFT JOIN mentorship_sessions ms ON ms.intern_id = u.id AND ms.status = 'completed'
      LEFT JOIN user_skill_signals uss ON uss.user_id = u.id
      WHERE u.role = 'intern' AND ms.id IS NOT NULL
      GROUP BY u.id, u.name
    `);

    // Get interns without mentorship
    const [withoutMentorship] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(DISTINCT uss.skill_id) as unique_skills,
        SUM(uss.weight) as total_skill_weight
      FROM users u
      LEFT JOIN user_skill_signals uss ON uss.user_id = u.id
      WHERE u.role = 'intern'
      AND u.id NOT IN (SELECT DISTINCT intern_id FROM mentorship_sessions WHERE status = 'completed')
      GROUP BY u.id, u.name
    `);

    const withAvgSkills = withMentorship.length > 0 
      ? withMentorship.reduce((sum, i) => sum + (i.unique_skills || 0), 0) / withMentorship.length 
      : 0;
    const withoutAvgSkills = withoutMentorship.length > 0 
      ? withoutMentorship.reduce((sum, i) => sum + (i.unique_skills || 0), 0) / withoutMentorship.length 
      : 0;

    const growthPercentage = withoutAvgSkills > 0 
      ? Math.round(((withAvgSkills - withoutAvgSkills) / withoutAvgSkills) * 100) 
      : 0;

    res.json({
      interns_with_mentorship: withMentorship.length,
      interns_without_mentorship: withoutMentorship.length,
      avg_skills_with_mentorship: Math.round(withAvgSkills * 10) / 10,
      avg_skills_without_mentorship: Math.round(withoutAvgSkills * 10) / 10,
      growth_percentage: growthPercentage,
      message: growthPercentage > 0 
        ? `Teams with mentorship grow ${growthPercentage}% faster`
        : "No significant correlation found"
    });
  } catch (err) {
    console.error("Error fetching mentorship growth correlation:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/analytics/correlation/effective-pairings - Skill combinations
export const getEffectivePairings = async (_req, res) => {
  try {
    // Find skills that often appear together in projects
    const [pairings] = await pool.query(`
      SELECT 
        ps1.skill_id as skill_1_id,
        s1.skill_name as skill_1_name,
        ps2.skill_id as skill_2_id,
        s2.skill_name as skill_2_name,
        COUNT(*) as project_count
      FROM project_skills ps1
      JOIN project_skills ps2 ON ps1.project_id = ps2.project_id AND ps1.skill_id < ps2.skill_id
      JOIN skills s1 ON s1.id = ps1.skill_id
      JOIN skills s2 ON s2.id = ps2.skill_id
      GROUP BY ps1.skill_id, ps2.skill_id, s1.skill_name, s2.skill_name
      ORDER BY project_count DESC
      LIMIT 10
    `);

    // Find mentorship skills paired with project skills
    const [mentorshipProjectSkills] = await pool.query(`
      SELECT 
        s.skill_name,
        COUNT(*) as frequency,
        GROUP_CONCAT(DISTINCT p.title SEPARATOR ', ') as projects
      FROM mentorship_sessions ms
      JOIN mentorship_session_skills mss ON mss.session_id = ms.id
      JOIN skills s ON s.id = mss.skill_id
      LEFT JOIN projects p ON p.id = ms.project_id
      WHERE ms.status = 'completed' AND ms.project_id IS NOT NULL
      GROUP BY s.skill_name
      ORDER BY frequency DESC
      LIMIT 10
    `);

    res.json({
      skill_pairings: pairings,
      mentorship_skills_on_projects: mentorshipProjectSkills
    });
  } catch (err) {
    console.error("Error fetching effective pairings:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/analytics/correlation/engagement-loops - Mentorship → Project → Skill growth
export const getEngagementLoops = async (_req, res) => {
  try {
    // Find interns who went from mentorship to projects with related skills
    const [loops] = await pool.query(`
      SELECT 
        u.id as intern_id,
        u.name as intern_name,
        mss.skill_name as mentorship_skill,
        p.title as project_name,
        s.skill_name as project_skill,
        CASE WHEN mss.skill_id = ps.skill_id THEN 'direct' ELSE 'related' END as skill_match
      FROM users u
      JOIN mentorship_sessions ms ON ms.intern_id = u.id AND ms.status = 'completed' AND ms.project_id IS NOT NULL
      JOIN (
        SELECT ms2.intern_id, s.skill_name, s.id as skill_id
        FROM mentorship_sessions ms2
        JOIN mentorship_session_skills mss2 ON mss2.session_id = ms2.id
        JOIN skills s ON s.id = mss2.skill_id
        WHERE ms2.status = 'completed'
      ) mss ON mss.intern_id = u.id
      JOIN projects p ON p.id = ms.project_id
      JOIN project_skills ps ON ps.project_id = p.id
      JOIN skills s ON s.id = ps.skill_id
      ORDER BY u.id, p.id
      LIMIT 20
    `);

    // Calculate engagement loop metrics
    const internsWithLoops = new Set(loops.map(l => l.intern_id)).size;
    const totalInterns = loops.length > 0 
      ? (await pool.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'intern'"))[0][0].cnt 
      : 0;

    const loopRate = totalInterns > 0 ? Math.round((internsWithLoops / totalInterns) * 100) : 0;

    res.json({
      engagement_loops: loops,
      summary: {
        interns_with_loops: internsWithLoops,
        total_interns: totalInterns,
        loop_rate: loopRate,
        message: loopRate > 0 
          ? `${loopRate}% of interns apply mentorship skills to projects`
          : "Build more mentorship-project connections"
      }
    });
  } catch (err) {
    console.error("Error fetching engagement loops:", err);
    res.status(500).json({ error: "Server error" });
  }
};
