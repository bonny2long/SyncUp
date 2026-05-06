import pool from "../config/db.js";
import { emitSkillSignals } from "../services/skillSignalService.js";
import {
  notifySessionAccepted,
  notifySessionDeclined,
  notifySessionCompleted,
  notifyNewSessionRequest,
} from "../services/notificationService.js";
import { checkBadges } from "../services/checkBadges.js";

const formatDateForMySQL = (dateStr) => {
  if (!dateStr) return null;
  // If it's an ISO string from frontend (YYYY-MM-DDTHH:mm), just replace T with space
  if (typeof dateStr === "string" && dateStr.includes("T")) {
    return dateStr.replace("T", " ").slice(0, 19);
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  // Fallback to local string parts to avoid timezone shift
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
};

const normalizeAvailabilityTime = (time) => {
  if (typeof time !== "string") return null;
  const trimmed = time.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return null;
};

const isValidAvailabilityDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const parsed = new Date(`${date}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};

const isMentorRole = (role) => ["mentor", "alumni", "resident"].includes(role);

export const checkAndAwardMentorBadge = async (mentorId, connection) => {
  try {
    const [countRows] = await connection.query(
      `SELECT COUNT(*) as total
       FROM mentorship_sessions
       WHERE mentor_id = ? AND status = 'completed'`,
      [mentorId],
    );

    const completedTotal = Number(countRows[0]?.total || 0);
    if (completedTotal < 3) return null;

    const [badgeRows] = await connection.query(
      "SELECT id FROM badges WHERE badge_key = 'mentor' LIMIT 1",
    );

    if (badgeRows.length === 0) return null;

    await connection.query(
      "INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)",
      [mentorId, badgeRows[0].id],
    );

    return badgeRows[0];
  } catch (err) {
    console.error("Mentor badge check failed:", err);
    return null;
  }
};

// Fetch all mentors
export const getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, cycle
       FROM users
       WHERE role IN ('mentor', 'alumni', 'resident')
       ORDER BY role, name`,
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching mentors:", err);
    res.status(500).json({ error: "Server error fetching mentors" });
  }
};

// Fetch mentor profile details: availability + session stats
export const getMentorDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [basicRows] = await pool.query(
      `SELECT id, name, email, role, cycle
       FROM users
       WHERE id = ?
         AND role IN ('mentor', 'alumni', 'resident')`,
      [id],
    );
    if (basicRows.length === 0) {
      return res.status(404).json({ error: "Community mentor not found" });
    }

    const [availability] = await pool.query(
      `
      SELECT ma.id, ma.available_date, ma.available_time
      FROM mentor_availability ma
      WHERE ma.mentor_id = ?
        AND NOT EXISTS (
          SELECT 1 FROM mentorship_sessions s
          WHERE s.mentor_id = ma.mentor_id
            AND s.session_date = CAST(CONCAT(DATE(ma.available_date), ' ', ma.available_time) AS DATETIME)
            AND s.status IN ('pending', 'accepted', 'completed')
        )
      ORDER BY ma.available_date ASC, ma.available_time ASC
      LIMIT 20
      `,
      [id],
    );

    const [sessions] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_sessions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_sessions,
        MAX(CASE WHEN status = 'completed' THEN session_date ELSE NULL END) as last_session_at
      FROM mentorship_sessions
      WHERE mentor_id = ?
      `,
      [id],
    );

    res.json({
      ...basicRows[0],
      availability,
      stats: sessions[0],
    });
  } catch (err) {
    console.error("Error fetching mentor details:", err);
    res.status(500).json({ error: "Server error fetching mentor details" });
  }
};

// Fetch mentors with availability slots
export const getAvailableMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.cycle,
        (
          SELECT COUNT(*)
          FROM mentorship_sessions ms
          WHERE ms.mentor_id = u.id AND ms.status = 'completed'
        ) as completed_sessions,
        (
          SELECT MAX(ms.session_date)
          FROM mentorship_sessions ms
          WHERE ms.mentor_id = u.id AND ms.status = 'completed'
        ) as last_session_at,
        ma.available_date,
        ma.available_time
      FROM mentor_availability ma
      JOIN users u ON u.id = ma.mentor_id
      WHERE u.role IN ('mentor', 'alumni', 'resident')
        AND NOT EXISTS (
          SELECT 1 FROM mentorship_sessions s
          WHERE s.mentor_id = ma.mentor_id
            AND s.session_date = CAST(CONCAT(DATE(ma.available_date), ' ', ma.available_time) AS DATETIME)
            AND s.status IN ('pending', 'accepted', 'completed')
        )
      ORDER BY completed_sessions DESC, u.name ASC, ma.available_date ASC, ma.available_time ASC
      `,
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching available mentors:", err);
    res.status(500).json({ error: "Server error fetching available mentors" });
  }
};

// Fetch mentors attached to projects (with project titles)
export const getProjectMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.cycle,
        (
          SELECT COUNT(*)
          FROM mentorship_sessions ms
          WHERE ms.mentor_id = u.id AND ms.status = 'completed'
        ) as completed_sessions,
        (
          SELECT MAX(ms.session_date)
          FROM mentorship_sessions ms
          WHERE ms.mentor_id = u.id AND ms.status = 'completed'
        ) as last_session_at,
        GROUP_CONCAT(DISTINCT p.title ORDER BY p.title SEPARATOR ', ') AS projects
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      JOIN projects p ON pm.project_id = p.id
      WHERE u.role IN ('mentor', 'alumni', 'resident')
      GROUP BY u.id, u.name, u.email, u.role, u.cycle
      ORDER BY completed_sessions DESC, u.name ASC
      `,
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching project mentors:", err);
    res.status(500).json({ error: "Server error fetching project mentors" });
  }
};

// Fetch all sessions (optionally filter by mentor)
export const getSessions = async (req, res) => {
  const { mentor_id: mentorId } = req.query;
  const hasFilter = mentorId !== undefined;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        s.id,
        s.topic,
        s.details,
        s.session_date,
        s.status,
        s.notes,
        s.session_focus,
        s.project_id,
        s.mentor_id,
        s.intern_id,
        m.name AS mentor,
        m.role AS mentor_role,
        i.name AS intern,
        i.role AS intern_role
      FROM mentorship_sessions s
      JOIN users m ON s.mentor_id = m.id
      JOIN users i ON s.intern_id = i.id
      ${hasFilter ? "WHERE s.mentor_id = ?" : ""}
      ORDER BY s.session_date DESC
    `,
      hasFilter ? [mentorId] : [],
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Server error fetching sessions" });
  }
};

// Create a new session
export const createSession = async (req, res) => {
  const {
    intern_id,
    mentor_id,
    topic,
    details,
    session_date,
    session_focus,
    project_id,
  } = req.body;

  if (!intern_id || !mentor_id || !topic || !session_date || !session_focus) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // SECURITY: Double-check that this slot actually exists for this mentor in mentor_availability
    const formattedDate = formatDateForMySQL(session_date);
    const [datePart, timePart] = formattedDate.split(" ");

    const [validSlot] = await pool.query(
      `SELECT 1 FROM mentor_availability 
       WHERE mentor_id = ? 
       AND DATE(available_date) = ? 
       AND available_time = ?`,
      [mentor_id, datePart, timePart],
    );

    if (validSlot.length === 0) {
      console.warn(
        `[Mentorship] Blocked invalid booking: Mentor ${mentor_id}, Date ${datePart}, Time ${timePart}`,
      );
      return res.status(400).json({
        error: "The selected time slot is no longer available for this mentor.",
      });
    }

    const [bookedSlot] = await pool.query(
      `SELECT 1
       FROM mentorship_sessions
       WHERE mentor_id = ?
         AND session_date = ?
         AND status IN ('pending', 'accepted', 'completed')
       LIMIT 1`,
      [mentor_id, formattedDate],
    );

    if (bookedSlot.length > 0) {
      return res.status(409).json({
        error: "The selected time slot has already been requested.",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO mentorship_sessions 
      (intern_id, mentor_id, topic, details, session_date, status, session_focus, project_id)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `,
      [
        intern_id,
        mentor_id,
        topic,
        details,
        formattedDate,
        session_focus,
        project_id || null,
      ],
    );

    // Notify mentor
    try {
      const [internRows] = await pool.query("SELECT name FROM users WHERE id = ?", [intern_id]);
      if (internRows.length > 0) {
        await notifyNewSessionRequest(
          mentor_id,
          internRows[0].name,
          topic,
          result.insertId
        );
      }
    } catch (notifErr) {
      console.error("Failed to notify mentor:", notifErr);
    }

    res.status(201).json({
      id: result.insertId,
      message: "Session created successfully",
    });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ error: "Server error creating session" });
  }
};

// Update session status (accept, complete, decline, cancel)
export const updateSessionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, skill_ids = [] } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get current session
    const [sessions] = await connection.query(
      `
      SELECT id, intern_id, mentor_id, status, session_focus, project_id
      FROM mentorship_sessions
      WHERE id = ?
      `,
      [id],
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessions[0];

    // 2. Update status
    await connection.query(
      `
      UPDATE mentorship_sessions
      SET status = ?
      WHERE id = ?
      `,
      [status, id],
    );

    // 3. Generate skill signals ONLY when transitioning to completed
    if (session.status !== "completed" && status === "completed") {
      await emitSkillSignals({
        userId: session.intern_id,
        sourceType: "mentorship",
        sourceId: session.id,
        signalType: "completed",
        context: {
          session_focus: session.session_focus,
          project_id: session.project_id,
        },
        skillIds: Array.isArray(skill_ids) ? skill_ids : [],
        weight: 3, // mentorship carries higher intent
        connection,
      });

      await checkAndAwardMentorBadge(session.mentor_id, connection);
    }

    await connection.commit();

    // Send notifications based on status change
    try {
      // Get mentor name for notifications
      const [mentorDetails] = await pool.query(
        `SELECT name FROM users WHERE id = ?`,
        [session.mentor_id],
      );

      const mentorName = mentorDetails[0]?.name || "Mentor";

      // Get topic
      const [sessionDetails] = await pool.query(
        `SELECT topic FROM mentorship_sessions WHERE id = ?`,
        [id],
      );

      const topic = sessionDetails[0]?.topic || "Session";

      if (session.status !== status) {
        // Status changed
        if (status === "accepted") {
          await notifySessionAccepted(
            session.intern_id,
            mentorName,
            topic,
            session.id,
          );
        } else if (status === "declined") {
          await notifySessionDeclined(
            session.intern_id,
            mentorName,
            topic,
            session.id,
          );
        } else if (status === "completed") {
          await notifySessionCompleted(
            session.intern_id,
            mentorName,
            topic,
            session.id,
          );
        }
      }
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
    }

    // Check for new badges (for intern when session completed)
    const newBadges = await checkBadges(session.intern_id);

    res.json({ message: "Session updated successfully", newBadges });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating mentorship session:", err);
    res.status(500).json({ error: "Failed to update session" });
  } finally {
    connection.release();
  }
};

// Update session details (topic/details/date)
export const updateSessionDetails = async (req, res) => {
  const { id } = req.params;
  const { topic, details, session_date } = req.body;

  if (!topic || !session_date) {
    return res
      .status(400)
      .json({ error: "Topic and session_date are required" });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE mentorship_sessions
      SET topic = ?, details = ?, session_date = ?
      WHERE id = ?
      `,
      [topic, details || "", formatDateForMySQL(session_date), id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session updated successfully" });
  } catch (err) {
    console.error("Error updating session details:", err);
    res.status(500).json({ error: "Server error updating session" });
  }
};

// Reschedule session: update date/time and set status to rescheduled
export const rescheduleSession = async (req, res) => {
  const { id } = req.params;
  const { session_date } = req.body;

  if (!session_date) {
    return res.status(400).json({ error: "session_date is required" });
  }

  const mysqlDate = toMySQLDateTime(session_date);
  if (!mysqlDate) {
    return res.status(400).json({ error: "Invalid session_date" });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE mentorship_sessions
      SET session_date = ?, status = 'rescheduled'
      WHERE id = ?
      `,
      [mysqlDate, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session rescheduled" });
  } catch (err) {
    console.error("Error rescheduling session:", err);
    res.status(500).json({ error: "Server error rescheduling session" });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM mentorship_sessions WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ error: "Server error deleting session" });
  }
};

// GET /api/mentorship/sessions/:id/skills
// Fetch all skills that were practiced in a completed mentorship session
export const getSessionSkills = async (req, res) => {
  const { id: sessionId } = req.params;

  try {
    const [skills] = await pool.query(
      `
      SELECT DISTINCT
        s.id,
        s.skill_name,
        s.category
      FROM user_skill_signals uss
      JOIN skills s ON s.id = uss.skill_id
      WHERE uss.source_type = 'mentorship'
        AND uss.source_id = ?
      ORDER BY s.skill_name ASC
      `,
      [sessionId],
    );

    res.json(skills);
  } catch (err) {
    console.error("Error fetching session skills:", err);
    res.status(500).json({ error: "Failed to fetch session skills" });
  }
};

// GET /api/mentorship/sessions/intern/:internId
export const getInternSessions = async (req, res) => {
  const { internId } = req.params;
  const { status } = req.query;

  try {
    let whereClause = "WHERE s.intern_id = ?";
    const params = [internId];

    if (status && status !== "all") {
      whereClause += " AND s.status = ?";
      params.push(status);
    }

    const [sessions] = await pool.query(
      `SELECT 
        s.*,
        m.id AS mentor_id,
        m.name AS mentor_name,
        m.email AS mentor_email
      FROM mentorship_sessions s
      JOIN users m ON s.mentor_id = m.id
      ${whereClause}
      ORDER BY 
        CASE WHEN s.status = 'pending' THEN 1
             WHEN s.status = 'accepted' THEN 2
             ELSE 3 END,
        s.session_date DESC`,
      params,
    );

    res.json(sessions);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// GET /api/mentorship/sessions/mentor/:mentorId
export const getMentorSessions = async (req, res) => {
  const { mentorId } = req.params;
  const { status } = req.query;

  try {
    let whereClause = "WHERE s.mentor_id = ?";
    const params = [mentorId];

    if (status && status !== "all") {
      whereClause += " AND s.status = ?";
      params.push(status);
    }

    const [sessions] = await pool.query(
      `SELECT 
        s.*,
        i.id AS intern_id,
        i.name AS intern_name,
        i.email AS intern_email
      FROM mentorship_sessions s
      JOIN users i ON s.intern_id = i.id
      ${whereClause}
      ORDER BY 
        CASE WHEN s.status = 'pending' THEN 1
             WHEN s.status = 'accepted' THEN 2
             ELSE 3 END,
        s.session_date DESC`,
      params,
    );

    res.json(sessions);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// GET /api/mentorship/mentors/:id/availability
export const getMentorAvailability = async (req, res) => {
  const { id } = req.params;

  try {
    const [slots] = await pool.query(
      `SELECT ma.id, ma.available_date, ma.available_time
       FROM mentor_availability ma
       WHERE ma.mentor_id = ? 
         AND NOT EXISTS (
           SELECT 1 FROM mentorship_sessions s
           WHERE s.mentor_id = ma.mentor_id
             AND s.session_date = CAST(CONCAT(DATE(ma.available_date), ' ', ma.available_time) AS DATETIME)
             AND s.status IN ('pending', 'accepted', 'completed')
         )
       ORDER BY ma.available_date ASC, ma.available_time ASC`,
      [id],
    );

    res.json(slots);
  } catch (err) {
    console.error("Error fetching mentor availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};

// POST /api/mentorship/mentors/:id/availability
export const createMentorAvailability = async (req, res) => {
  const { id } = req.params;
  const { available_date, available_time } = req.body;
  const mentorId = Number(id);
  const normalizedTime = normalizeAvailabilityTime(available_time);

  if (!Number.isInteger(mentorId) || mentorId <= 0) {
    return res.status(400).json({ error: "Invalid mentor ID" });
  }

  if (!isValidAvailabilityDate(available_date) || !normalizedTime) {
    return res.status(400).json({ error: "Valid date and time are required" });
  }

  try {
    const [mentorRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [mentorId],
    );

    if (mentorRows.length === 0 || !isMentorRole(mentorRows[0].role)) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const [duplicateRows] = await pool.query(
      `SELECT id
       FROM mentor_availability
       WHERE mentor_id = ?
         AND DATE(available_date) = ?
         AND available_time = ?
       LIMIT 1`,
      [mentorId, available_date, normalizedTime],
    );

    if (duplicateRows.length > 0) {
      return res.status(409).json({
        error: "This availability slot already exists",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO mentor_availability
       (mentor_id, available_date, available_time)
       VALUES (?, ?, ?)`,
      [mentorId, available_date, normalizedTime],
    );

    const [createdRows] = await pool.query(
      `SELECT id, available_date, available_time
       FROM mentor_availability
       WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json(createdRows[0]);
  } catch (err) {
    console.error("Error creating mentor availability:", err);
    res.status(500).json({ error: "Failed to create availability slot" });
  }
};

// DELETE /api/mentorship/availability/:slotId
export const deleteMentorAvailability = async (req, res) => {
  const { slotId } = req.params;
  const id = Number(slotId);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid availability slot ID" });
  }

  try {
    const [slotRows] = await pool.query(
      `SELECT id, mentor_id, available_date, available_time
       FROM mentor_availability
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (slotRows.length === 0) {
      return res.status(404).json({ error: "Availability slot not found" });
    }

    const slot = slotRows[0];
    const [bookedRows] = await pool.query(
      `SELECT id
       FROM mentorship_sessions
       WHERE mentor_id = ?
         AND session_date = CAST(CONCAT(DATE(?), ' ', ?) AS DATETIME)
         AND status IN ('pending', 'accepted', 'completed')
       LIMIT 1`,
      [slot.mentor_id, slot.available_date, slot.available_time],
    );

    if (bookedRows.length > 0) {
      return res.status(409).json({
        error: "This slot has already been requested and cannot be removed",
      });
    }

    await pool.query("DELETE FROM mentor_availability WHERE id = ?", [id]);

    res.json({ message: "Availability slot removed" });
  } catch (err) {
    console.error("Error deleting mentor availability:", err);
    res.status(500).json({ error: "Failed to remove availability slot" });
  }
};
