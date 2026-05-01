import pool from "../config/db.js";

async function isAdminUser(userId) {
  if (!userId) return false;
  const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [
    userId,
  ]);
  return rows[0]?.role === "admin";
}

export const getAnnouncements = async (req, res) => {
  const userId = Number(req.query.user_id || 0);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.*,
        u.name AS author_name,
        u.role AS author_role,
        ar.read_at,
        CASE WHEN ar.read_at IS NULL THEN FALSE ELSE TRUE END AS is_read,
        (
          SELECT COUNT(*)
          FROM announcement_reads ar_count
          WHERE ar_count.announcement_id = a.id
        ) AS read_count,
        (
          SELECT COUNT(*)
          FROM users audience
          WHERE audience.role IN ('admin', 'mentor', 'resident', 'alumni')
             OR audience.has_commenced = TRUE
        ) AS audience_count,
        (
          SELECT GROUP_CONCAT(
            CONCAT(
              reader.name,
              '::',
              reader.role,
              '::',
              COALESCE(reader.cycle, ''),
              '::',
              receipt.read_at
            )
            ORDER BY receipt.read_at DESC
            SEPARATOR '||'
          )
          FROM announcement_reads receipt
          JOIN users reader ON reader.id = receipt.user_id
          WHERE receipt.announcement_id = a.id
        ) AS read_receipts
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      LEFT JOIN announcement_reads ar
        ON ar.announcement_id = a.id
       AND ar.user_id = ?
      WHERE a.is_active = TRUE
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      ORDER BY
        CASE a.announcement_type
          WHEN 'pinned' THEN 0
          WHEN 'event_promo' THEN 1
          ELSE 2
        END,
        a.created_at DESC
    `,
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

export const markAnnouncementRead = async (req, res) => {
  const { id } = req.params;
  const userId = Number(req.body.user_id || req.query.user_id || req.user?.id);

  if (!userId) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const [announcements] = await pool.query(
      `SELECT id
       FROM announcements
       WHERE id = ?
         AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > NOW())`,
      [id],
    );

    if (announcements.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await pool.query(
      `INSERT INTO announcement_reads (announcement_id, user_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
      [id, userId],
    );

    res.json({ success: true, announcement_id: Number(id), user_id: userId });
  } catch (err) {
    console.error("Error marking announcement read:", err);
    res.status(500).json({ error: "Failed to mark announcement as read" });
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

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
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
      `UPDATE announcements
       SET title = ?, content = ?, announcement_type = ?, expires_at = ?
       WHERE id = ? AND is_active = TRUE`,
      [
        title,
        content,
        announcement_type || "news",
        expires_at || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const [rows] = await pool.query(
      `SELECT a.*, u.name AS author_name, u.role AS author_role
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [id],
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating announcement:", err);
    res.status(500).json({ error: "Failed to update announcement" });
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
