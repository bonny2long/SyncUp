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
          userId ?
            "EXISTS(SELECT 1 FROM project_members pm2 WHERE pm2.project_id = p.id AND pm2.user_id = ?) AS is_member,"
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
      userId ? [userId] : params,
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error fetching projects" });
  }
};

// POST /api/projects
// Updated version with visibility support
export const createProject = async (req, res) => {
  const {
    title,
    description,
    owner_id,
    skills = [],
    visibility = "seeking",
  } = req.body;
  const ownerId = owner_id;
  const metadata = {
    created_at: new Date().toISOString(),
  };

  if (!title || !ownerId) {
    return res.status(400).json({ error: "title and owner_id are required" });
  }

  if (!visibility || !["public", "seeking"].includes(visibility)) {
    return res
      .status(400)
      .json({ error: "visibility must be 'public' or 'seeking'" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Create Project with visibility
    const [result] = await connection.query(
      `
      INSERT INTO projects (title, description, owner_id, visibility, metadata)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        description || "",
        ownerId,
        visibility,
        JSON.stringify(metadata),
      ],
    );

    const projectId = result.insertId;

    // 2. Add Owner as Member
    await connection.query(
      `
      INSERT INTO project_members (project_id, user_id)
      VALUES (?, ?)
      `,
      [projectId, ownerId],
    );

    // 3. Process Skills (Find or Create)
    if (Array.isArray(skills) && skills.length > 0) {
      const skillIds = [];

      for (const skillName of skills) {
        const normalizedName = skillName.trim().toLowerCase();
        if (!normalizedName) continue;

        // Check if exists
        const [existing] = await connection.query(
          "SELECT id FROM skills WHERE skill_name = ?",
          [normalizedName],
        );

        if (existing.length > 0) {
          skillIds.push(existing[0].id);
        } else {
          // Create new
          const [created] = await connection.query(
            "INSERT INTO skills (skill_name, category) VALUES (?, 'uncategorized')",
            [normalizedName],
          );
          skillIds.push(created.insertId);
        }
      }

      // Link to project
      if (skillIds.length > 0) {
        const skillValues = skillIds.map((sid) => [projectId, sid]);
        await connection.query(
          `
          INSERT INTO project_skills (project_id, skill_id)
          VALUES ?
          `,
          [skillValues],
        );

        // 4. Emit Signals for Owner
        const signalValues = skillIds.map((sid) => [
          ownerId,
          sid,
          "project",
          projectId,
          "joined",
          1, // Weight for creating a project
        ]);

        await connection.query(
          `
          INSERT INTO user_skill_signals
            (user_id, skill_id, source_type, source_id, signal_type, weight)
          VALUES ?
          `,
          [signalValues],
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      id: projectId,
      title,
      status: "planned",
      visibility,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Failed to create project" });
  } finally {
    connection.release();
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
      [values],
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
      [projectId, user_id],
    );

    // Fetch skills tied to this project
    const [skills] = await connection.query(
      `
      SELECT skill_id
      FROM project_skills
      WHERE project_id = ?
      `,
      [projectId],
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
        [signalValues],
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
      [projectId, user_id],
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
      [status, id],
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

// GET /api/projects/:id/skills
export const getProjectSkills = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT s.id, s.skill_name, s.category
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = ?
      ORDER BY s.skill_name ASC
      `,
      [id],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching project skills:", err);
    res.status(500).json({ error: "Failed to fetch project skills" });
  }
};

// GET /api/projects/user/:userId
// Fetch all projects for a user (as owner or member) with metrics
export const getUserProjects = async (req, res) => {
  const { userId } = req.params;

  try {
    const [projects] = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.owner_id,
        p.start_date,
        p.end_date,
        p.status,
        p.metadata,
        u.name as owner_name,
        COUNT(DISTINCT pm_all.user_id) as team_size,
        COUNT(DISTINCT ps.skill_id) as skill_count,
        COUNT(DISTINCT pu.id) as update_count,
        COUNT(DISTINCT ms.id) as mentorship_count
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_members pm_all ON p.id = pm_all.project_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN progress_updates pu ON p.id = pu.project_id AND pu.is_deleted = 0
      LEFT JOIN mentorship_sessions ms ON p.id = ms.project_id AND ms.status = 'completed'
      GROUP BY p.id, p.title, p.description, p.owner_id, p.start_date, p.end_date, p.status, p.metadata, u.name
      ORDER BY p.start_date DESC
      `,
      [userId],
    );

    res.json(projects);
  } catch (err) {
    console.error("Error fetching user projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// GET /api/projects/:projectId/portfolio-details
// Fetch detailed portfolio information for a project
export const getProjectPortfolioDetails = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Get basic project info
    const [projects] = await pool.query(`SELECT * FROM projects WHERE id = ?`, [
      projectId,
    ]);

    if (projects.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = projects[0];

    // Get team members
    const [team] = await pool.query(
      `
      SELECT u.id, u.name, u.role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      `,
      [projectId],
    );

    // Get skills
    const [skills] = await pool.query(
      `
      SELECT s.id, s.skill_name, s.category
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = ?
      ORDER BY s.skill_name ASC
      `,
      [projectId],
    );

    // Get signal metrics per skill
    const [skillMetrics] = await pool.query(
      `
      SELECT 
        s.skill_name,
        s.id as skill_id,
        COUNT(uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        uss.source_type,
        COUNT(CASE WHEN uss.source_type = 'mentorship' THEN 1 END) as mentorship_count
      FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      LEFT JOIN user_skill_signals uss ON s.id = uss.skill_id AND uss.source_type IN ('project', 'update', 'mentorship')
      WHERE ps.project_id = ?
      GROUP BY s.skill_name, s.id, uss.source_type
      ORDER BY s.skill_name ASC
      `,
      [projectId],
    );

    // Get recent updates
    const [updates] = await pool.query(
      `
      SELECT id, content, created_at, user_id
      FROM progress_updates
      WHERE project_id = ? AND is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [projectId],
    );

    // Get mentorship sessions
    const [sessions] = await pool.query(
      `
      SELECT id, topic, session_date, status, mentor_id, intern_id
      FROM mentorship_sessions
      WHERE project_id = ? AND status = 'completed'
      ORDER BY session_date DESC
      LIMIT 5
      `,
      [projectId],
    );

    res.json({
      project,
      team,
      skills,
      skillMetrics,
      updates,
      sessions,
    });
  } catch (err) {
    console.error("Error fetching project details:", err);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
};

// ============================================================
// PROJECT METRICS
// ============================================================

// GET /api/projects/:projectId/metrics
// Get aggregated metrics for a project
export const getProjectMetrics = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [metrics] = await pool.query(
      `
      SELECT 
        COUNT(DISTINCT pm.user_id) as team_size,
        COUNT(DISTINCT ps.skill_id) as skill_count,
        COUNT(DISTINCT pu.id) as update_count,
        COUNT(DISTINCT ms.id) as completed_sessions,
        SUM(CASE WHEN uss.source_type = 'mentorship' THEN uss.weight ELSE 0 END) as mentorship_weight,
        SUM(CASE WHEN uss.source_type = 'update' THEN uss.weight ELSE 0 END) as update_weight,
        SUM(CASE WHEN uss.source_type = 'project' THEN uss.weight ELSE 0 END) as project_weight
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN progress_updates pu ON p.id = pu.project_id AND pu.is_deleted = 0
      LEFT JOIN mentorship_sessions ms ON p.id = ms.project_id AND ms.status = 'completed'
      LEFT JOIN user_skill_signals uss ON p.id = uss.source_id AND uss.source_type IN ('project', 'update', 'mentorship')
      WHERE p.id = ?
      `,
      [projectId],
    );

    res.json(metrics[0] || {});
  } catch (err) {
    console.error("Error fetching project metrics:", err);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

// ============================================================
// PROJECT JOIN REQUESTS
// ============================================================

// POST /api/projects/:projectId/join-request
// User submits a request to join a project
export const createJoinRequest = async (req, res) => {
  const { projectId } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    // Check if user is already a member
    const [memberCheck] = await pool.query(
      `SELECT id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [projectId, user_id],
    );

    if (memberCheck.length > 0) {
      return res.status(400).json({ error: "User is already a member" });
    }

    // Check if request already exists (pending)
    const [existingRequest] = await pool.query(
      `SELECT id FROM project_join_requests WHERE project_id = ? AND user_id = ? AND status = 'pending'`,
      [projectId, user_id],
    );

    if (existingRequest.length > 0) {
      return res.status(400).json({ error: "Request already exists" });
    }

    // Create new request
    const [result] = await pool.query(
      `INSERT INTO project_join_requests (project_id, user_id, status)
       VALUES (?, ?, 'pending')`,
      [projectId, user_id],
    );

    res.status(201).json({
      id: result.insertId,
      project_id: projectId,
      user_id,
      status: "pending",
      message: "Join request submitted",
    });
  } catch (err) {
    console.error("Error creating join request:", err);
    res.status(500).json({ error: "Failed to create join request" });
  }
};

// GET /api/projects/:projectId/requests
// Get all pending requests for a project (owner only)
export const getProjectRequests = async (req, res) => {
  const { projectId } = req.params;

  try {
    const [requests] = await pool.query(
      `SELECT 
        pjr.id,
        pjr.project_id,
        pjr.user_id,
        pjr.status,
        pjr.created_at,
        u.name,
        u.email,
        u.role
       FROM project_join_requests pjr
       JOIN users u ON pjr.user_id = u.id
       WHERE pjr.project_id = ? AND pjr.status = 'pending'
       ORDER BY pjr.created_at DESC`,
      [projectId],
    );

    res.json(requests);
  } catch (err) {
    console.error("Error fetching join requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// GET /api/projects/requests/user/:userId
// Get all pending requests for a user (across all projects they own)
export const getUserProjectRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const [requests] = await pool.query(
      `SELECT 
        pjr.id,
        pjr.project_id,
        pjr.user_id,
        pjr.status,
        pjr.created_at,
        p.title as project_title,
        u.name,
        u.email,
        u.role
       FROM project_join_requests pjr
       JOIN projects p ON pjr.project_id = p.id
       JOIN users u ON pjr.user_id = u.id
       WHERE p.owner_id = ? AND pjr.status = 'pending'
       ORDER BY pjr.created_at DESC`,
      [userId],
    );

    res.json(requests);
  } catch (err) {
    console.error("Error fetching user requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// PUT /api/projects/:projectId/requests/:requestId/approve
// Owner approves a join request
export const approveJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get the request details
    const [requests] = await connection.query(
      `SELECT user_id FROM project_join_requests WHERE id = ? AND project_id = ?`,
      [requestId, projectId],
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Request not found" });
    }

    const userId = requests[0].user_id;

    // Add user as project member
    await connection.query(
      `INSERT IGNORE INTO project_members (project_id, user_id)
       VALUES (?, ?)`,
      [projectId, userId],
    );

    // Fetch project skills
    const [skills] = await connection.query(
      `SELECT skill_id FROM project_skills WHERE project_id = ?`,
      [projectId],
    );

    // Insert skill signals for the newly approved member
    if (skills.length > 0) {
      const signalValues = skills.map(({ skill_id }) => [
        userId,
        skill_id,
        "project",
        projectId,
        "joined",
        1,
      ]);

      await connection.query(
        `INSERT INTO user_skill_signals
          (user_id, skill_id, source_type, source_id, signal_type, weight)
         VALUES ?`,
        [signalValues],
      );
    }

    // Update request status
    await connection.query(
      `UPDATE project_join_requests SET status = 'approved' WHERE id = ?`,
      [requestId],
    );

    await connection.commit();

    res.json({
      id: requestId,
      status: "approved",
      message: "Join request approved",
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error approving join request:", err);
    res.status(500).json({ error: "Failed to approve request" });
  } finally {
    connection.release();
  }
};

// PUT /api/projects/:projectId/requests/:requestId/reject
// Owner rejects a join request
export const rejectJoinRequest = async (req, res) => {
  const { projectId, requestId } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE project_join_requests SET status = 'rejected' WHERE id = ? AND project_id = ?`,
      [requestId, projectId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      id: requestId,
      status: "rejected",
      message: "Join request rejected",
    });
  } catch (err) {
    console.error("Error rejecting join request:", err);
    res.status(500).json({ error: "Failed to reject request" });
  }
};

// GET /api/projects/:projectId/join-request/status/:userId
// Check if user has pending request for a project
export const checkJoinRequestStatus = async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const [requests] = await pool.query(
      `SELECT id, status FROM project_join_requests WHERE project_id = ? AND user_id = ?`,
      [projectId, userId],
    );

    if (requests.length === 0) {
      return res.json({ status: "none" });
    }

    res.json({
      status: requests[0].status,
      requestId: requests[0].id,
    });
  } catch (err) {
    console.error("Error checking request status:", err);
    res.status(500).json({ error: "Failed to check request status" });
  }
};
