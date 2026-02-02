// server/src/controllers/progressController.js
import pool from "../config/db.js";
import { emitSkillSignals } from "../services/skillSignalService.js";
import { notifyProjectUpdate } from "../services/notificationService.js";

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
      `,
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
        p.created_at,
        (
          SELECT JSON_ARRAYAGG(s.skill_name)
          FROM user_skill_signals uss
          JOIN skills s ON uss.skill_id = s.id
          WHERE uss.source_type = 'update' 
            AND uss.source_id = p.id
        ) AS tagged_skills
      FROM progress_updates p
      JOIN users u ON p.user_id = u.id
      JOIN projects pr ON p.project_id = pr.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT 50
    `,
      params,
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️ Insert progress update (existing behavior)
    const softDelete = await ensureSoftDeleteSupport();

    const [result] = await connection.query(
      `
      INSERT INTO progress_updates (project_id, user_id, content, created_at${
        softDelete ? ", is_deleted" : ""
      })
      VALUES (?, ?, ?, NOW()${softDelete ? ", 0" : ""})
      `,
      [project_id, user_id, content],
    );

    const updateId = result.insertId;

    // 2. Process Skills (Find or Create)
    // We accept explicit skills from the request body now
    const { skills: inputSkills = [] } = req.body;
    let skillIdsToSignal = [];

    if (Array.isArray(inputSkills) && inputSkills.length > 0) {
      for (const skillName of inputSkills) {
        const normalizedName = skillName.trim().toLowerCase();
        if (!normalizedName) continue;

        // Check if exists
        const [existing] = await connection.query(
          "SELECT id FROM skills WHERE skill_name = ?",
          [normalizedName],
        );

        if (existing.length > 0) {
          skillIdsToSignal.push(existing[0].id);
        } else {
          // Create new
          const [created] = await connection.query(
            "INSERT INTO skills (skill_name, category) VALUES (?, 'uncategorized')",
            [normalizedName],
          );
          skillIdsToSignal.push(created.insertId);
        }
      }
    } else {
      // Fallback: If no explicit skills, use project skills (Legacy behavior)
      const [projectSkills] = await connection.query(
        `SELECT skill_id FROM project_skills WHERE project_id = ?`,
        [project_id],
      );
      skillIdsToSignal = projectSkills.map((s) => s.skill_id);
    }

    // 3. Emit Signals
    if (skillIdsToSignal.length > 0) {
      await emitSkillSignals({
        userId: user_id,
        sourceType: "update",
        sourceId: updateId,
        signalType: "update",
        skillIds: skillIdsToSignal,
        weight: 1, // lowered to 1 for "Building Trust" phase
        connection,
      });
    }

    // 4️ Return full update row (existing behavior)
    const [rows] = await connection.query(
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
      [updateId],
    );

    await connection.commit();

    // 🔔 Notify team members
    try {
      // Get all team members excluding the author
      const [members] = await pool.query(
        `SELECT user_id FROM project_members WHERE project_id = ? AND user_id != ?`,
        [project_id, user_id],
      );

      const recipientIds = members.map((m) => m.user_id);

      if (recipientIds.length > 0 && rows.length > 0) {
        const { project_title, user_name } = rows[0];
        await notifyProjectUpdate(
          recipientIds,
          project_title,
          user_name,
          project_id,
        );
      }
    } catch (notifErr) {
      console.error("Failed to send update notifications:", notifErr);
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    await connection.rollback();
    console.error("Error inserting update:", err);
    res.status(500).json({ error: "Server error while adding update" });
  } finally {
    connection.release();
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
      [content, id],
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
      [id],
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
        [id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Update not found" });
      }
      return res.json({ message: "Update deleted successfully (soft)" });
    } else {
      const [result] = await pool.query(
        `DELETE FROM progress_updates WHERE id = ?`,
        [id],
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
      [projectId],
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading project updates:", err);
    res.status(500).json({ error: "Failed to load updates" });
  }
};
