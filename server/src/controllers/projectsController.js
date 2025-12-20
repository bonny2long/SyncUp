import pool from "../config/db.js";

export const getProjects = async (req, res) => {
  const { user_id: userId } = req.query;
  const params = [];

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        ${
          userId
            ? "EXISTS(SELECT 1 FROM project_members pm2 WHERE pm2.project_id = p.id AND pm2.user_id = ?) AS is_member,"
            : "0 AS is_member,"
        }
        -- how many members are on this project
        COUNT(DISTINCT pm.user_id) AS team_count,
        -- how many updates exist
        COUNT(DISTINCT u.id) AS update_count,
        -- most recent update timestamp
        MAX(u.created_at) AS last_update,
        -- comma-separated member names for UI
        GROUP_CONCAT(DISTINCT usr.name ORDER BY usr.name SEPARATOR ', ') AS team_members,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', usr.id,
            'name', usr.name,
            'email', usr.email,
            'role', usr.role,
            'join_date', usr.join_date
          )
        ) AS team_member_details
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN users usr ON pm.user_id = usr.id
      LEFT JOIN progress_updates u ON u.project_id = p.id
      GROUP BY p.id, p.title, p.description, p.status
      ORDER BY p.id ASC;
    `,
      userId ? [userId] : params
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error fetching projects" });
  }
};

// Add a user to a project (join)
export const addProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    // prevent duplicate membership
    const [existing] = await pool.query(
      `SELECT id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, user_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "User already on project" });
    }

    await pool.query(
      `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`,
      [projectId, user_id]
    );

    res.status(201).json({ message: "Member added" });
  } catch (err) {
    console.error("Error adding project member:", err);
    res.status(500).json({ error: "Server error adding member" });
  }
};

// Remove a user from a project (leave)
export const removeProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const [result] = await pool.query(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }

    res.json({ message: "Member removed" });
  } catch (err) {
    console.error("Error removing project member:", err);
    res.status(500).json({ error: "Server error removing member" });
  }
};

// Update project status
export const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["planned", "active", "completed", "archived"];

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE projects SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Error updating project status:", err);
    res.status(500).json({ error: "Server error updating status" });
  }
};
