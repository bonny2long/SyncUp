import pool from "../config/db.js";

async function isAdminUser(userId) {
  if (!userId) return false;
  const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [
    userId,
  ]);
  return rows[0]?.role === "admin";
}

export const getAnnouncements = async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name AS author_name, u.role AS author_role
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      WHERE a.is_active = TRUE
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY
        CASE a.announcement_type
          WHEN 'pinned' THEN 0
          WHEN 'event_promo' THEN 1
          ELSE 2
        END,
        a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

export const createAnnouncement = async (req, res) => {
  const { title, content, announcement_type, expires_at } = req.body;
  const actingUserId = Number(req.query.user_id || req.user?.id);

  if (!title || !content || !actingUserId) {
    return res
      .status(400)
      .json({ error: "Title, content, and user_id are required" });
  }

  try {
    if (!(await isAdminUser(actingUserId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [result] = await pool.query(
      `INSERT INTO announcements (title, content, author_id, announcement_type, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        content,
        actingUserId,
        announcement_type || "news",
        expires_at || null,
      ],
    );

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS author_name, u.role AS author_role
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [result.insertId],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  const actingUserId = Number(req.query.user_id || req.user?.id);

  try {
    if (!(await isAdminUser(actingUserId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    await pool.query("UPDATE announcements SET is_active = FALSE WHERE id = ?", [
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};
