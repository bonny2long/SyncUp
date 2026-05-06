import pool from "../config/db.js";
import { createSmartNotification } from "../services/notificationService.js";

async function isAdminUser(userId) {
  if (!userId) return false;
  const [rows] = await pool.query("SELECT is_admin FROM users WHERE id = ?", [
    userId,
  ]);
  return rows[0]?.is_admin === true || rows[0]?.is_admin === 1;
}

async function notifyEventAudience(eventId, title, authorId) {
  try {
    const [recipients] = await pool.query(
      `SELECT id
       FROM users
       WHERE id != ?
         AND (is_active IS NULL OR is_active != FALSE)
         AND (
           role IN ('resident', 'alumni')
           OR has_commenced = TRUE
         ) `,
      [authorId],
    );

    for (const recipient of recipients) {
      await createSmartNotification({
        userId: recipient.id,
        type: "event",
        title: "New ICAA event",
        message: title,
        link: "/chat",
        relatedId: eventId,
        relatedType: "event",
        groupKey: `event:${eventId}`,
        preferenceKey: "event",
      });
    }
  } catch (err) {
    console.error("Failed to send event notifications:", err);
  }
}

export const getEvents = async (req, res) => {
  const { user_id } = req.query;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.description,
        e.author_id,
        e.event_date,
        e.location,
        e.requires_rsvp,
        e.max_attendees,
        e.is_active,
        e.created_at,
        u.name AS author_name,
        COUNT(DISTINCT r.user_id) AS rsvp_count,
        MAX(CASE WHEN r.user_id = ? THEN r.rsvp_status END) AS user_rsvp,
        GROUP_CONCAT(
          DISTINCT CASE
            WHEN r.rsvp_status = 'attending' THEN CONCAT(ru.name, '::', ru.role, '::', COALESCE(ru.cycle, ''))
          END
          ORDER BY ru.name
          SEPARATOR '||'
        ) AS rsvp_attendees
      FROM events e
      JOIN users u ON e.author_id = u.id
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      LEFT JOIN users ru ON r.user_id = ru.id
      WHERE e.is_active = TRUE
        AND e.event_date >= NOW()
      GROUP BY
        e.id,
        e.title,
        e.description,
        e.author_id,
        e.event_date,
        e.location,
        e.requires_rsvp,
        e.max_attendees,
        e.is_active,
        e.created_at,
        u.name
      ORDER BY e.event_date ASC
    `,
      [user_id || 0],
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

export const createEvent = async (req, res) => {
  const {
    title,
    description,
    event_date,
    location,
    requires_rsvp,
    max_attendees,
  } = req.body;
  const actingUserId = Number(req.query.user_id || req.user?.id);

  if (!title || !event_date || !actingUserId) {
    return res
      .status(400)
      .json({ error: "Title, event_date, and user_id are required" });
  }

  try {
    if (!(await isAdminUser(actingUserId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [result] = await pool.query(
      `INSERT INTO events (title, description, author_id, event_date, location, requires_rsvp, max_attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        actingUserId,
        event_date,
        location || null,
        requires_rsvp || false,
        max_attendees || null,
      ],
    );

    await notifyEventAudience(result.insertId, title, actingUserId);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    event_date,
    location,
    requires_rsvp,
    max_attendees,
  } = req.body;
  const actingUserId = Number(req.query.user_id || req.user?.id);

  if (!title || !event_date || !actingUserId) {
    return res
      .status(400)
      .json({ error: "Title, event_date, and user_id are required" });
  }

  try {
    if (!(await isAdminUser(actingUserId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [result] = await pool.query(
      `UPDATE events
       SET title = ?, description = ?, event_date = ?, location = ?, requires_rsvp = ?, max_attendees = ?
       WHERE id = ? AND is_active = TRUE`,
      [
        title,
        description || null,
        event_date,
        location || null,
        requires_rsvp || false,
        max_attendees || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

export const rsvpEvent = async (req, res) => {
  const { id } = req.params;
  const { user_id, status } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, rsvp_status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rsvp_status = ?`,
      [id, user_id, status || "attending", status || "attending"],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error RSVPing to event:", err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const actingUserId = Number(req.query.user_id || req.user?.id);

  try {
    if (!(await isAdminUser(actingUserId))) {
      return res.status(403).json({ error: "Admin access required" });
    }

    await pool.query("UPDATE events SET is_active = FALSE WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
