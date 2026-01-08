import pool from "../config/db.js";

// GET /api/projects
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
        MAX(p.metadata) AS metadata,
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
      GROUP BY p.id, p.title, p.description, p.status, p.metadata
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

// POST /api/projects
export const createProject = async (req, res) => {
  const { title, description, owner_id, skill_ideas = [] } = req.body;
  const ownerId = owner_id;
  const metadata = {
    skill_ideas: Array.isArray(skill_ideas) ? skill_ideas : [],
    created_at: new Date().toISOString(),
  };

  if (!title || !ownerId) {
    return res.status(400).json({ error: "title and owner_id are required" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO projects (title, description, owner_id, metadata)
      VALUES (?, ?, ?, ?)
      `,
      [title.trim(), description || "", ownerId, JSON.stringify(metadata)]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      status: "planned",
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// POST /api/projects/:id/skills
export const attachProjectSkills = async (req, res) => {
  const { id: projectId } = req.params;
  const { skill_ids } = req.body;

  if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "skill_ids must be a non-empty array" });
  }

  try {
    const values = skill_ids.map((skillId) => [projectId, skillId]);

    await pool.query(
      `
      INSERT IGNORE INTO project_skills (project_id, skill_id)
      VALUES ?
      `,
      [values]
    );

    res.status(201).json({ message: "Skills attached to project" });
  } catch (err) {
    console.error("Error attaching project skills:", err);
    res.status(500).json({ error: "Failed to attach skills" });
  }
};

// Add a user to a project (join)
export const addProjectMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Add project membership (existing behavior)
    await connection.query(
      `
      INSERT IGNORE INTO project_members (project_id, user_id)
      VALUES (?, ?)
      `,
      [projectId, user_id]
    );

    // Fetch skills tied to this project
    const [skills] = await connection.query(
      `
      SELECT skill_id
      FROM project_skills
      WHERE project_id = ?
      `,
      [projectId]
    );

    // Insert skill signals (append-only)
    if (skills.length > 0) {
      const signalValues = skills.map(({ skill_id }) => [
        user_id,
        skill_id,
        "project",
        projectId,
        "joined",
        1,
      ]);

      await connection.query(
        `
        INSERT INTO user_skill_signals
          (user_id, skill_id, source_type, source_id, signal_type, weight)
        VALUES ?
        `,
        [signalValues]
      );
    }

    await connection.commit();

    res.status(201).json({ message: "User added to project" });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding project member:", err);
    res.status(500).json({ error: "Failed to add project member" });
  } finally {
    connection.release();
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
