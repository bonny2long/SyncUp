import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/admin/active-sessions
// Returns count of users with online status in user_presence
router.get("/active-sessions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM user_presence WHERE status = 'online'`
    );
    res.json({ activeSessions: rows[0]?.count || 0 });
  } catch (err) {
    console.error("Error fetching active sessions:", err);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

// GET /api/admin/stats
// Returns platform stats for admin dashboard
router.get("/stats", async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(`SELECT COUNT(*) as userCount FROM users`);
    const [[{ projectCount }]] = await pool.query(`SELECT COUNT(*) as projectCount FROM projects`);
    const [[{ sessionCount }]] = await pool.query(`SELECT COUNT(*) as sessionCount FROM mentorship_sessions`);
    
    // Count inactive users (no activity in 30+ days)
    const [[{ inactiveCount }]] = await pool.query(
      `SELECT COUNT(*) as inactiveCount FROM users u 
       WHERE NOT EXISTS (
         SELECT 1 FROM user_skill_signals uss 
         WHERE uss.user_id = u.id 
         AND uss.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       )`
    );

    res.json({
      users: userCount || 0,
      projects: projectCount || 0,
      sessions: sessionCount || 0,
      inactiveUsers: inactiveCount || 0,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/platform-stats
// Returns platform info for System tab
router.get("/platform-stats", async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(`SELECT COUNT(*) as count FROM users`);
    const [[{ projectCount }]] = await pool.query(`SELECT COUNT(*) as count FROM projects`);
    const [[{ sessionCount }]] = await pool.query(`SELECT COUNT(*) as count FROM mentorship_sessions`);
    const [[{ errorCount }]] = await pool.query(`SELECT COUNT(*) as count FROM system_errors`);

    res.json({
      totalUsers: userCount || 0,
      totalProjects: projectCount || 0,
      totalSessions: sessionCount || 0,
      totalErrors: errorCount || 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      appVersion: "1.0.0",
    });
  } catch (err) {
    console.error("Error fetching platform stats:", err);
    res.status(500).json({ error: "Failed to fetch platform stats" });
  }
});

// GET /api/admin/growth-stats
// Returns user and project creation counts for the last 30 days
router.get("/growth-stats", async (req, res) => {
  try {
    // Get users joined in last 30 days (using join_date)
    const [users] = await pool.query(
      `SELECT DATE(join_date) as date, COUNT(*) as count 
       FROM users 
       WHERE join_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(join_date)
       ORDER BY date ASC`
    );

    // Get projects created in last 30 days (using start_date as proxy for created)
    const [projects] = await pool.query(
      `SELECT DATE(start_date) as date, COUNT(*) as count 
       FROM projects 
       WHERE start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(start_date)
       ORDER BY date ASC`
    );

    // Generate last 30 days with zeros for missing dates
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    const dailyData = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const userCount = users.find(u => u.date === dateStr)?.count || 0;
      const projectCount = projects.find(p => p.date === dateStr)?.count || 0;
      
      dailyData.push({
        date: dateStr,
        users: userCount,
        projects: projectCount,
      });
    }

    res.json(dailyData);
  } catch (err) {
    console.error("Error fetching growth stats:", err);
    res.status(500).json({ error: "Failed to fetch growth stats" });
  }
});

export default router;
