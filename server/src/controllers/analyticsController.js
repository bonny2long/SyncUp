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
      LEFT JOIN mentorship_sessions ms ON ms.mentor_id = u.id
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
