// server/src/controllers/progressController.js
import pool from "../config/db.js";

// Cache check for optional soft-delete column
let hasSoftDeleteColumn;

async function ensureSoftDeleteSupport() {
  if (hasSoftDeleteColumn !== undefined) return hasSoftDeleteColumn;
  try {
    const [rows] = await pool.query(
      `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'progress_updates'
        AND COLUMN_NAME = 'is_deleted'
      LIMIT 1;
      `
    );
    hasSoftDeleteColumn = rows.length > 0;
  } catch (err) {
    hasSoftDeleteColumn = false;
  }
  return hasSoftDeleteColumn;
}

// GET /api/progress_updates
export const getProgressUpdates = async (req, res) => {
  const { project_id: projectId } = req.query;
  try {
    const softDelete = await ensureSoftDeleteSupport();
    const conditions = [];
    const params = [];

    if (softDelete) {
      conditions.push("(p.is_deleted IS NULL OR p.is_deleted = 0)");
    }
    if (projectId) {
      conditions.push("p.project_id = ?");
      params.push(projectId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.project_id,
        p.user_id,
        u.name AS user_name, 
        u.role AS user_role,
        pr.title AS project_title, 
        p.created_at
      FROM progress_updates p
      JOIN users u ON p.user_id = u.id
      JOIN projects pr ON p.project_id = pr.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT 50
    `,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ error: "Server error while fetching updates" });
  }
};

// POST /api/progress_updates
export const createProgressUpdate = async (req, res) => {
  const { project_id, user_id, content } = req.body;

  if (!project_id || !user_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const softDelete = await ensureSoftDeleteSupport();
    const [result] = await pool.query(
      `
      INSERT INTO progress_updates (project_id, user_id, content, created_at${
        softDelete ? ", is_deleted" : ""
      })
      VALUES (?, ?, ?, NOW()${softDelete ? ", 0" : ""})
      `,
      [project_id, user_id, content]
    );

    // return full row so frontend can prepend
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.project_id,
        p.user_id,
        u.name AS user_name, 
        u.role AS user_role,
        pr.title AS project_title, 
        p.created_at
      FROM progress_updates p
      JOIN users u ON p.user_id = u.id
      JOIN projects pr ON p.project_id = pr.id
      WHERE p.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error inserting update:", err);
    res.status(500).json({ error: "Server error while adding update" });
  }
};

// PUT /api/progress_updates/:id  (edit content)
export const updateProgressUpdate = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE progress_updates
      SET content = ?
      WHERE id = ?
      `,
      [content, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Update not found" });
    }

    // return updated row
    const [rows] = await pool.query(
      `
      SELECT 
        p.id, 
        p.content, 
        p.project_id,
        p.user_id,
        u.name AS user_name, 
        u.role AS user_role,
        pr.title AS project_title, 
        p.created_at
      FROM progress_updates p
      JOIN users u ON p.user_id = u.id
      JOIN projects pr ON p.project_id = pr.id
      WHERE p.id = ?
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating progress update:", err);
    res.status(500).json({ error: "Server error while updating progress" });
  }
};

// DELETE /api/progress_updates/:id
export const deleteProgressUpdate = async (req, res) => {
  const { id } = req.params;

  try {
    const softDelete = await ensureSoftDeleteSupport();
    if (softDelete) {
      const [result] = await pool.query(
        `UPDATE progress_updates SET is_deleted = 1 WHERE id = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Update not found" });
      }
      return res.json({ message: "Update deleted successfully (soft)" });
    } else {
      const [result] = await pool.query(
        `DELETE FROM progress_updates WHERE id = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Update not found" });
      }
      return res.json({ message: "Update deleted successfully" });
    }
  } catch (err) {
    console.error("Error deleting progress update:", err);
    res.status(500).json({ error: "Server error while deleting progress" });
  }
};

// GET /api/progress_updates/project/:projectId
export const getUpdatesByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.id, 
        p.content,
        p.created_at,
        u.name AS user_name,
        u.role AS user_role
      FROM progress_updates p
      JOIN users u ON u.id = p.user_id
      WHERE p.project_id = ?
      ORDER BY p.created_at DESC
      LIMIT 20`,
      [projectId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading project updates:", err);
    res.status(500).json({ error: "Failed to load updates" });
  }
};
