import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/admin/active-sessions
// Returns count of users with online status in user_presence
router.get("/active-sessions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM user_presence WHERE status = 'online'`,
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
    const [[{ userCount }]] = await pool.query(
      `SELECT COUNT(*) as userCount FROM users`,
    );
    const [[{ projectCount }]] = await pool.query(
      `SELECT COUNT(*) as projectCount FROM projects`,
    );
    const [[{ sessionCount }]] = await pool.query(
      `SELECT COUNT(*) as sessionCount FROM mentorship_sessions`,
    );

    // Count inactive users (no activity in 30+ days)
    const [[{ inactiveCount }]] = await pool.query(
      `SELECT COUNT(*) as inactiveCount FROM users u 
       WHERE NOT EXISTS (
         SELECT 1 FROM user_skill_signals uss 
         WHERE uss.user_id = u.id 
         AND uss.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       )`,
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
    const [[{ userCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM users`,
    );
    const [[{ projectCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM projects`,
    );
    const [[{ sessionCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM mentorship_sessions`,
    );
    const [[{ errorCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM system_errors`,
    );

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
    // Get users joined in last 30 days
    const [users] = await pool.query(
      `SELECT DATE_FORMAT(join_date, '%Y-%m-%d') as date, COUNT(*) as count 
       FROM users 
       WHERE join_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE_FORMAT(join_date, '%Y-%m-%d')
       ORDER BY date ASC`,
    );

    // Get projects started in last 30 days
    const [projects] = await pool.query(
      `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') as date, COUNT(*) as count 
       FROM projects 
       WHERE start_date IS NOT NULL 
       AND start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE_FORMAT(start_date, '%Y-%m-%d')
       ORDER BY date ASC`,
    );

    // Generate last 30 days with zeros for missing dates
    const today = new Date();
    // Use local date instead of UTC to match MySQL DATE_FORMAT which formats in local DB time
    const [year, month, day] = [
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    ];
    const localTodayStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const localToday = new Date(`${localTodayStr}T00:00:00`);

    const thirtyDaysAgo = new Date(localToday);
    thirtyDaysAgo.setDate(localToday.getDate() - 29);

    const dailyData = [];
    for (
      let d = new Date(thirtyDaysAgo);
      d <= localToday;
      d.setDate(d.getDate() + 1)
    ) {
      const dYear = d.getFullYear();
      const dMonth = String(d.getMonth() + 1).padStart(2, "0");
      const dDay = String(d.getDate()).padStart(2, "0");
      const dateStr = `${dYear}-${dMonth}-${dDay}`;

      const userCount = users.find((u) => u.date === dateStr)?.count || 0;
      const projectCount = projects.find((p) => p.date === dateStr)?.count || 0;

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

// GET /api/admin/settings/maintenance
// Returns current maintenance mode status and message
router.get("/settings/maintenance", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('maintenance_mode', 'maintenance_message')",
    );

    const settings = {};
    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      enabled: settings.maintenance_mode === "true",
      message:
        settings.maintenance_message ||
        "We are doing some work on the app. Please check back soon.",
    });
  } catch (err) {
    console.error("Error fetching maintenance settings:", err);
    res.status(500).json({ error: "Failed to fetch maintenance settings" });
  }
});

// PUT /api/admin/settings/maintenance
// Updates maintenance mode status and message
router.put("/settings/maintenance", async (req, res) => {
  try {
    const { enabled, message } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    await pool.query(
      "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      ["maintenance_mode", enabled.toString(), enabled.toString()],
    );

    if (message !== undefined) {
      await pool.query(
        "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        ["maintenance_message", message, message],
      );
    }

    res.json({
      enabled,
      message:
        message || "We are doing some work on the app. Please check back soon.",
    });
  } catch (err) {
    console.error("Error updating maintenance settings:", err);
    res.status(500).json({ error: "Failed to update maintenance settings" });
  }
});

export default router;
