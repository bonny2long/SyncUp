import pool from "../config/db.js";
import { emitSkillSignals } from "../services/skillSignalService.js";
import {
  notifySessionAccepted,
  notifySessionDeclined,
  notifySessionCompleted,
} from "../services/notificationService.js";

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

// Fetch all mentors
export const getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role = 'mentor'",
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
      `SELECT id, name, email, role FROM users WHERE id = ? AND role = 'mentor'`,
      [id],
    );
    if (basicRows.length === 0) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const [availability] = await pool.query(
      `
      SELECT ma.available_date, ma.available_time
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
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_sessions
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
        ma.available_date,
        ma.available_time
      FROM mentor_availability ma
      JOIN users u ON u.id = ma.mentor_id
      WHERE u.role = 'mentor'
        AND NOT EXISTS (
          SELECT 1 FROM mentorship_sessions s
          WHERE s.mentor_id = ma.mentor_id
            AND s.session_date = CAST(CONCAT(DATE(ma.available_date), ' ', ma.available_time) AS DATETIME)
            AND s.status IN ('pending', 'accepted', 'completed')
        )
      ORDER BY ma.available_date ASC, ma.available_time ASC
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
        GROUP_CONCAT(DISTINCT p.title ORDER BY p.title SEPARATOR ', ') AS projects
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      JOIN projects p ON pm.project_id = p.id
      WHERE u.role = 'mentor'
      GROUP BY u.id, u.name, u.email, u.role
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
        formatDateForMySQL(session_date),
        session_focus,
        project_id || null,
      ],
    );

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

    // 1️ Get current session
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

    // 2️ Update status
    await connection.query(
      `
      UPDATE mentorship_sessions
      SET status = ?
      WHERE id = ?
      `,
      [status, id],
    );

    // 3️ Generate skill signals ONLY when transitioning to completed
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
    }

    await connection.commit();

    // 🔔 Send notifications based on status change
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

    res.json({ message: "Session updated successfully" });
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
      `SELECT ma.available_date, ma.available_time 
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
