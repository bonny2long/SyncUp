import pool from "../config/db.js";

// Get all errors with optional filtering
export const getAllErrors = async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT se.*, u.name as user_name, u.role as user_role 
    FROM system_errors se 
    LEFT JOIN users u ON se.user_id = u.id 
    WHERE 1=1`;
  const params = [];

  if (status && status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  if (type && type !== "all") {
    query += " AND error_type = ?";
    params.push(type);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  try {
    const [rows] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM system_errors WHERE 1=1";
    const countParams = [];
    if (status && status !== "all") {
      countQuery += " AND status = ?";
      countParams.push(status);
    }
    if (type && type !== "all") {
      countQuery += " AND error_type = ?";
      countParams.push(type);
    }
    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      errors: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (err) {
    console.error("Failed to fetch errors:", err.message);
    res.status(500).json({ error: "Failed to fetch errors" });
  }
};

// Get error statistics
export const getErrorStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'ignored' THEN 1 ELSE 0 END) as ignored,
        error_type,
        COUNT(error_type) as count
      FROM system_errors
      GROUP BY error_type
    `);

    const [totals] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open
      FROM system_errors
    `);

    res.json({
      total: totals[0].total,
      open: totals[0].open,
      byType: rows,
    });
  } catch (err) {
    console.error("Failed to fetch error stats:", err.message);
    res.status(500).json({ error: "Failed to fetch error stats" });
  }
};

// Report a new error
export const reportError = async (req, res) => {
  const { error_type, message, stack, user_id, page_url, user_agent } =
    req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO system_errors (error_type, message, stack, user_id, page_url, user_agent, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [
        error_type || "server",
        message,
        stack || null,
        user_id || null,
        page_url || null,
        user_agent || null,
      ],
    );

    res.json({ id: result.insertId, message: "Error reported successfully" });
  } catch (err) {
    console.error("Failed to report error:", err.message);
    res.status(500).json({ error: "Failed to report error" });
  }
};

// Update error status (resolve/ignore)
export const updateErrorStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolved_by } = req.body;

  if (!status || !["open", "resolved", "ignored"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Valid status required: open, resolved, ignored" });
  }

  try {
    const resolvedAt = status === "resolved" ? "NOW()" : "NULL";
    await pool.query(
      `UPDATE system_errors 
       SET status = ?, resolved_at = ${resolvedAt}, resolved_by = ? 
       WHERE id = ?`,
      [status, resolved_by || null, id],
    );
    res.json({ message: "Error status updated" });
  } catch (err) {
    console.error("Failed to update error:", err.message);
    res.status(500).json({ error: "Failed to update error" });
  }
};

// Delete an error
export const deleteError = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM system_errors WHERE id = ?", [id]);
    res.json({ message: "Error deleted successfully" });
  } catch (err) {
    console.error("Failed to delete error:", err.message);
    res.status(500).json({ error: "Failed to delete error" });
  }
};

// Get recent errors for overview
export const getRecentErrors = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT se.*, u.name as user_name 
      FROM system_errors se 
      LEFT JOIN users u ON se.user_id = u.id 
      WHERE se.status = 'open'
      ORDER BY se.created_at DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch recent errors:", err.message);
    res.status(500).json({ error: "Failed to fetch recent errors" });
  }
};
