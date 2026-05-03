import pool from "../config/db.js";
import { createSmartNotification } from "../services/notificationService.js";

const CAN_POST = ["resident", "alumni", "admin", "mentor"];

async function getUserById(userId) {
  if (!userId) return null;
  const [rows] = await pool.query(
    "SELECT id, name, role, cycle FROM users WHERE id = ?",
    [userId],
  );
  return rows[0] || null;
}

function requesterId(req) {
  return req.user?.id || req.query.requester_id || req.body.author_id;
}

async function notifyEncouragementAudience(encouragementId, author, targetCycle) {
  try {
    const params = [];
    let cycleFilter = "";

    if (targetCycle) {
      cycleFilter = "AND cycle = ?";
      params.push(targetCycle);
    }

    const [recipients] = await pool.query(
      `SELECT id
       FROM users
       WHERE role = 'intern'
         AND (is_active IS NULL OR is_active != FALSE)
         ${cycleFilter}`,
      params,
    );

    for (const recipient of recipients) {
      await createSmartNotification({
        userId: recipient.id,
        type: "encouragement",
        title: "New encouragement from the ICAA community",
        message: `${author.role}${author.cycle ? `, ${author.cycle}` : ""} shared a message with your cohort`,
        link: "/lobby",
        relatedId: encouragementId,
        relatedType: "encouragement",
        groupKey: targetCycle ? `encouragement:${targetCycle}` : "encouragement:all",
        preferenceKey: "encouragement",
      });
    }
  } catch (err) {
    console.error("Failed to send encouragement notifications:", err);
  }
}

export const getEncouragements = async (req, res) => {
  const { target_cycle } = req.query;

  try {
    const requester = await getUserById(requesterId(req));
    if (!requester) {
      return res.status(403).json({ error: "User access required" });
    }

    const isIntern = requester.role === "intern";
    const targetCycle = target_cycle || requester.cycle || null;

    const [rows] = await pool.query(
      `
        SELECT
          e.id,
          e.message,
          e.author_cycle,
          e.author_role,
          e.target_cycle,
          e.created_at,
          ${isIntern ? "NULL" : "u.id"} AS author_id,
          ${isIntern ? "NULL" : "u.name"} AS author_name
        FROM encouragements e
        JOIN users u ON u.id = e.author_id
        WHERE e.is_active = TRUE
          AND (e.target_cycle = ? OR e.target_cycle IS NULL)
        ORDER BY e.created_at DESC
        LIMIT 50
      `,
      [targetCycle],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching encouragements:", err);
    res.status(500).json({ error: "Failed to fetch encouragements" });
  }
};

export const createEncouragement = async (req, res) => {
  const { author_id, message, target_cycle } = req.body;

  try {
    const author = await getUserById(req.user?.id || author_id);
    if (!author || !CAN_POST.includes(author.role)) {
      return res.status(403).json({
        error: "Only community members can post encouragement",
      });
    }

    const cleanMessage = String(message || "").trim();
    if (!cleanMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const cleanTargetCycle = String(target_cycle || "").trim() || null;

    const [result] = await pool.query(
      `
        INSERT INTO encouragements
          (author_id, author_cycle, author_role, message, target_cycle)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        author.id,
        author.cycle || null,
        author.role,
        cleanMessage.slice(0, 1000),
        cleanTargetCycle,
      ],
    );

    await notifyEncouragementAudience(result.insertId, author, cleanTargetCycle);

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("Error creating encouragement:", err);
    res.status(500).json({ error: "Failed to create encouragement" });
  }
};

export const deleteEncouragement = async (req, res) => {
  const { id } = req.params;

  try {
    const requester = await getUserById(req.user?.id || req.query.user_id);
    if (!requester) {
      return res.status(403).json({ error: "User access required" });
    }

    const [rows] = await pool.query(
      "SELECT id, author_id FROM encouragements WHERE id = ? AND is_active = TRUE",
      [id],
    );
    const item = rows[0];
    if (!item) return res.status(404).json({ error: "Not found" });

    const canDelete =
      requester.role === "admin" || Number(item.author_id) === requester.id;
    if (!canDelete) return res.status(403).json({ error: "Not authorized" });

    await pool.query(
      "UPDATE encouragements SET is_active = FALSE WHERE id = ?",
      [id],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting encouragement:", err);
    res.status(500).json({ error: "Failed to delete encouragement" });
  }
};
