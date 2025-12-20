import pool from "../config/db.js";

const toMySQLDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Fetch all mentors
export const getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role = 'mentor'"
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
      [id]
    );
    if (basicRows.length === 0) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const [availability] = await pool.query(
      `
      SELECT available_date, available_time
      FROM mentor_availability
      WHERE mentor_id = ?
      ORDER BY available_date ASC, available_time ASC
      LIMIT 20
      `,
      [id]
    );

    const [sessions] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_sessions,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_sessions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_sessions,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted_sessions
      FROM mentorship_sessions
      WHERE mentor_id = ?
      `,
      [id]
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
      ORDER BY ma.available_date ASC, ma.available_time ASC
      `
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
      `
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
      hasFilter ? [mentorId] : []
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Server error fetching sessions" });
  }
};

// Create a new session
export const createSession = async (req, res) => {
  const { intern_id, mentor_id, topic, details, session_date } = req.body;

  if (!intern_id || !mentor_id || !topic || !session_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO mentorship_sessions 
      (intern_id, mentor_id, topic, details, session_date, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      `,
      [intern_id, mentor_id, topic, details, session_date]
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
  const { status, notes } = req.body;

  const allowedStatuses = [
    "pending",
    "accepted",
    "completed",
    "declined",
    "rescheduled",
  ];

  if (!status) {
    return res.status(400).json({ error: "Status field is required" });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE mentorship_sessions
      SET status = ?, notes = IFNULL(?, notes)
      WHERE id = ?
      `,
      [status, notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session status updated successfully" });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ error: "Server error updating session" });
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
      [topic, details || "", session_date, id]
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
      [mysqlDate, id]
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
      [id]
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
