import pool from "../config/db.js";
import { createSmartNotification } from "../services/notificationService.js";

async function isAdminUser(userId) {
  if (!userId) return false;
  const [rows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [
    userId,
  ]);
  return rows[0]?.is_admin === true || rows[0]?.is_admin === 1;
}

const VOTING_ROLES = ["resident", "alumni"];
const POLL_TYPES = ["yes_no", "multiple_choice"];

async function createPollForAnnouncement(connection, announcementId, poll) {
  if (!poll?.question) return null;

  const pollType = POLL_TYPES.includes(poll.poll_type) ? poll.poll_type : "yes_no";
  const rawOptions =
    pollType === "yes_no" ?
      ["Yes", "No"]
    : Array.isArray(poll.options) ?
      poll.options
    : [];
  const options = rawOptions
    .map((option) => String(option || "").trim())
    .filter(Boolean)
    .slice(0, 5);

  if (options.length < 2) {
    const error = new Error("Polls require at least two options");
    error.statusCode = 400;
    throw error;
  }

  const [result] = await connection.query(
    `INSERT INTO polls (announcement_id, question, poll_type, closes_at)
     VALUES (?, ?, ?, ?)`,
    [
      announcementId,
      String(poll.question).trim().slice(0, 300),
      pollType,
      poll.closes_at || null,
    ],
  );

  for (const [index, optionText] of options.entries()) {
    await connection.query(
      `INSERT INTO poll_options (poll_id, option_text, display_order)
       VALUES (?, ?, ?)`,
      [result.insertId, optionText.slice(0, 200), index],
    );
  }

  return result.insertId;
}

async function notifyAnnouncementAudience(announcement, authorId) {
  try {
    const [recipients] = await pool.query(
      `SELECT id
       FROM users
       WHERE id != ?
         AND (is_active IS NULL OR is_active != FALSE)
         AND (
           role IN ('resident', 'alumni')
           OR has_commenced = TRUE
         )`,
      [authorId],
    );

    for (const recipient of recipients) {
      await createSmartNotification({
        userId: recipient.id,
        type: "announcement",
        title: "New ICAA announcement",
        message: announcement.title,
        link: "/chat",
        relatedId: announcement.id,
        relatedType: "announcement",
        groupKey: `announcement:${announcement.id}`,
        critical: true,
      });
    }
  } catch (err) {
    console.error("Failed to send announcement notifications:", err);
  }
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
        EXISTS(
          SELECT 1
          FROM polls p
          WHERE p.announcement_id = a.id
            AND p.is_active = TRUE
        ) AS has_poll,
        (
          SELECT COUNT(*)
          FROM announcement_reads ar_count
          WHERE ar_count.announcement_id = a.id
        ) AS read_count,
        (
          SELECT COUNT(*)
          FROM users audience
          WHERE audience.role IN ('resident', 'alumni')
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
        ) AS read_receipts,
        (
          SELECT GROUP_CONCAT(
            CONCAT(
              unread_user.name,
              '::',
              unread_user.role,
              '::',
              COALESCE(unread_user.cycle, '')
            )
            ORDER BY unread_user.name
            SEPARATOR '||'
          )
          FROM users unread_user
          LEFT JOIN announcement_reads unread_receipt
            ON unread_receipt.user_id = unread_user.id
           AND unread_receipt.announcement_id = a.id
          WHERE unread_receipt.user_id IS NULL
            AND (unread_user.is_active IS NULL OR unread_user.is_active != FALSE)
            AND (
              unread_user.role IN ('resident', 'alumni')
              OR unread_user.has_commenced = TRUE
            )
        ) AS unread_roster
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
  const { title, content, announcement_type, expires_at, poll } = req.body;
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

    const connection = await pool.getConnection();
    let insertId;

    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
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
      insertId = result.insertId;

      if (poll?.enabled) {
        await createPollForAnnouncement(connection, insertId, poll);
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    const [rows] = await pool.query(
      `SELECT
         a.*,
         u.name AS author_name,
         u.role AS author_role,
         EXISTS(
           SELECT 1 FROM polls p
           WHERE p.announcement_id = a.id AND p.is_active = TRUE
         ) AS has_poll
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = ?`,
      [insertId],
    );
    const announcement = rows[0];
    await notifyAnnouncementAudience(announcement, actingUserId);
    res.status(201).json(announcement);
  } catch (err) {
    console.error("Error creating announcement:", err);
    res
      .status(err.statusCode || 500)
      .json({ error: err.message || "Failed to create announcement" });
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

export const getPollForAnnouncement = async (req, res) => {
  const { announcementId } = req.params;
  const userId = Number(req.query.user_id || req.user?.id || 0);

  try {
    const [pollRows] = await pool.query(
      `SELECT *
       FROM polls
       WHERE announcement_id = ?
         AND is_active = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [announcementId],
    );

    if (pollRows.length === 0) return res.json(null);

    const poll = pollRows[0];
    const [optionRows] = await pool.query(
      `SELECT
         po.id,
         po.option_text,
         po.display_order,
         COUNT(pv.id) AS vote_count
       FROM poll_options po
       LEFT JOIN poll_votes pv ON pv.poll_option_id = po.id
       WHERE po.poll_id = ?
       GROUP BY po.id, po.option_text, po.display_order
       ORDER BY po.display_order ASC`,
      [poll.id],
    );

    let userVotedOptionId = null;
    if (userId) {
      const [voteRows] = await pool.query(
        `SELECT poll_option_id
         FROM poll_votes
         WHERE poll_id = ? AND user_id = ?
         LIMIT 1`,
        [poll.id, userId],
      );
      userVotedOptionId = voteRows[0]?.poll_option_id || null;
    }

    const totalVotes = optionRows.reduce(
      (sum, option) => sum + Number(option.vote_count || 0),
      0,
    );

    res.json({
      ...poll,
      options: optionRows,
      user_voted_option_id: userVotedOptionId,
      total_votes: totalVotes,
    });
  } catch (err) {
    console.error("Error fetching poll:", err);
    res.status(500).json({ error: "Failed to fetch poll" });
  }
};

export const submitPollVote = async (req, res) => {
  const { pollId } = req.params;
  const userId = Number(req.body.user_id || req.user?.id);
  const optionId = Number(req.body.option_id);

  if (!userId || !optionId) {
    return res.status(400).json({ error: "user_id and option_id are required" });
  }

  try {
    const [users] = await pool.query("SELECT role FROM users WHERE id = ?", [
      userId,
    ]);
    const role = users[0]?.role;
    if (!VOTING_ROLES.includes(role)) {
      return res
        .status(403)
        .json({ error: "Only residents and alumni can vote" });
    }

    const [pollRows] = await pool.query(
      `SELECT *
       FROM polls
       WHERE id = ?
         AND is_active = TRUE
         AND (closes_at IS NULL OR closes_at > NOW())`,
      [pollId],
    );
    if (pollRows.length === 0) {
      return res.status(400).json({ error: "Poll is closed or unavailable" });
    }

    const [optionRows] = await pool.query(
      "SELECT id FROM poll_options WHERE id = ? AND poll_id = ?",
      [optionId, pollId],
    );
    if (optionRows.length === 0) {
      return res.status(400).json({ error: "Invalid poll option" });
    }

    await pool.query(
      `INSERT INTO poll_votes (poll_id, poll_option_id, user_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         poll_option_id = VALUES(poll_option_id),
         voted_at = CURRENT_TIMESTAMP`,
      [pollId, optionId, userId],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error submitting poll vote:", err);
    res.status(500).json({ error: "Failed to submit poll vote" });
  }
};
