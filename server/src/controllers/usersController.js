import pool from "../config/db.js";

const USER_SELECT_FIELDS = `
  id,
  name,
  email,
  role,
  join_date,
  bio,
  profile_pic,
  is_active,
  has_commenced,
  cycle,
  email_notifications,
  notify_join_requests,
  notify_mentions,
  notify_session_reminders,
  notify_project_updates,
  notify_weekly_summary,
  profile_visibility,
  show_email,
  show_projects,
  show_skills,
  accept_mentorship,
  auto_accept_teammates
`;

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ${USER_SELECT_FIELDS}
      FROM users
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:userId/profile
// Get comprehensive user profile with skills, projects, and stats
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Get basic user info
    const [users] = await pool.query(
      `SELECT ${USER_SELECT_FIELDS}
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user's skills with signal counts
    const [skills] = await pool.query(
      `
      SELECT 
        s.id,
        s.skill_name,
        s.category,
        COUNT(DISTINCT uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        MAX(uss.created_at) as last_practiced
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      ORDER BY total_weight DESC
      LIMIT 20
      `,
      [userId],
    );

    // Get user's projects (owned or joined)
    const [projects] = await pool.query(
      `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.status,
        p.start_date,
        p.end_date,
        COUNT(DISTINCT pm_all.user_id) as team_size,
        COUNT(DISTINCT ps.skill_id) as skill_count
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      LEFT JOIN project_members pm_all ON p.id = pm_all.project_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      GROUP BY p.id, p.title, p.description, p.status, p.start_date, p.end_date
      ORDER BY p.start_date DESC
      LIMIT 10
      `,
      [userId],
    );

    // Get activity stats
    let stats = {
      total_skills: 0,
      total_signals: 0,
      total_weight: 0,
      project_count: 0,
      update_count: 0,
      mentorship_count: 0,
      days_active: 0,
    };

    if (skills.length > 0 || projects.length > 0) {
      const [statsResult] = await pool.query(
        `
        SELECT 
          COUNT(DISTINCT uss.skill_id) as total_skills,
          COUNT(DISTINCT uss.id) as total_signals,
          COALESCE(SUM(uss.weight), 0) as total_weight,
          (SELECT COUNT(DISTINCT project_id) FROM project_members WHERE user_id = ?) as project_count,
          COUNT(DISTINCT CASE WHEN uss.source_type = 'update' THEN uss.source_id END) as update_count,
          COUNT(DISTINCT CASE WHEN uss.source_type = 'mentorship' THEN uss.source_id END) as mentorship_count,
          COALESCE(DATEDIFF(CURDATE(), MIN(DATE(uss.created_at))), 0) as days_active
        FROM user_skill_signals uss
        WHERE uss.user_id = ?
        `,
        [userId, userId],
      );
      stats = statsResult[0] || stats;
    }

    // Get activity streak (distinct days active in last 30 days)
    const [streakData] = await pool.query(
      `
      SELECT 
        COALESCE(COUNT(DISTINCT DATE(uss.created_at)), 0) as current_streak
      FROM user_skill_signals uss
      WHERE uss.user_id = ? AND uss.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `,
      [userId],
    );

    res.json({
      user,
      skills,
      projects,
      stats,
      activity_streak: streakData[0]?.current_streak || 0,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// GET /api/users/:userId/skill-inventory
// Get detailed skill inventory with breakdown
export const getUserSkillInventory = async (req, res) => {
  const { userId } = req.params;

  try {
    const [skills] = await pool.query(
      `
      SELECT 
        s.id,
        s.skill_name,
        s.category,
        COUNT(uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        MAX(uss.created_at) as last_practiced,
        SUM(CASE WHEN uss.source_type = 'mentorship' THEN uss.weight ELSE 0 END) as mentorship_weight,
        SUM(CASE WHEN uss.source_type = 'update' THEN uss.weight ELSE 0 END) as update_weight,
        SUM(CASE WHEN uss.source_type = 'project' THEN uss.weight ELSE 0 END) as project_weight,
        CASE 
          WHEN SUM(uss.weight) >= 10 THEN 'Advanced'
          WHEN SUM(uss.weight) >= 5 THEN 'Intermediate'
          ELSE 'Beginner'
        END as proficiency_level
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      ORDER BY total_weight DESC
      `,
      [userId],
    );

    // Group by category
    const skillsByCategory = {};
    skills.forEach((skill) => {
      const cat = skill.category || "uncategorized";
      if (!skillsByCategory[cat]) {
        skillsByCategory[cat] = [];
      }
      skillsByCategory[cat].push(skill);
    });

    res.json({
      total_skills: skills.length,
      total_weight: skills.reduce((sum, s) => sum + (s.total_weight || 0), 0),
      by_category: skillsByCategory,
      all_skills: skills,
    });
  } catch (err) {
    console.error("Error fetching skill inventory:", err);
    res.status(500).json({ error: "Failed to fetch skill inventory" });
  }
};

// GET /api/users/:userId/activity-timeline
// Get recent activity for user (updates, mentorship, projects)
export const getUserActivityTimeline = async (req, res) => {
  const { userId } = req.params;

  try {
    const [activity] = await pool.query(
      `
      SELECT 
        'update' as type,
        pu.id,
        pu.content as description,
        pu.created_at,
        p.title as project_title,
        NULL as mentor_name
      FROM progress_updates pu
      LEFT JOIN projects p ON pu.project_id = p.id
      WHERE pu.user_id = ? AND pu.is_deleted = 0
      
      UNION ALL
      
      SELECT 
        'mentorship' as type,
        ms.id,
        ms.topic as description,
        ms.session_date as created_at,
        NULL as project_title,
        u.name as mentor_name
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      WHERE (ms.intern_id = ? OR ms.mentor_id = ?) AND ms.status = 'completed'
      
      ORDER BY created_at DESC
      LIMIT 20
      `,
      [userId, userId, userId],
    );

    res.json(activity);
  } catch (err) {
    console.error("Error fetching activity timeline:", err);
    res.status(500).json({ error: "Failed to fetch activity timeline" });
  }
};

// PUT /api/users/:userId/profile
// Update user profile (name, email, bio), notification settings, and privacy settings
export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const body = req.body || {};

  try {
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;

    const resolvedBio =
      body.bio !== undefined ? body.bio
      : body.notes !== undefined ? body.notes
      : undefined;
    if (resolvedBio !== undefined) updates.bio = resolvedBio || null;

    if (body.role !== undefined) {
      updates.role = body.role;
      if (
        body.has_commenced === undefined &&
        ["mentor", "resident", "alumni", "admin"].includes(body.role)
      ) {
        updates.has_commenced = true;
      }
    }

    if (body.profile_pic !== undefined) updates.profile_pic = body.profile_pic;
    if (body.email_notifications !== undefined) {
      updates.email_notifications = body.email_notifications;
    }
    if (body.notify_join_requests !== undefined) {
      updates.notify_join_requests = body.notify_join_requests;
    }
    if (body.notify_mentions !== undefined) {
      updates.notify_mentions = body.notify_mentions;
    }
    if (body.notify_session_reminders !== undefined) {
      updates.notify_session_reminders = body.notify_session_reminders;
    }
    if (body.notify_project_updates !== undefined) {
      updates.notify_project_updates = body.notify_project_updates;
    }
    if (body.notify_weekly_summary !== undefined) {
      updates.notify_weekly_summary = body.notify_weekly_summary;
    }
    if (body.profile_visibility !== undefined) {
      updates.profile_visibility = body.profile_visibility;
    }
    if (body.show_email !== undefined) updates.show_email = body.show_email;
    if (body.show_projects !== undefined) {
      updates.show_projects = body.show_projects;
    }
    if (body.show_skills !== undefined) updates.show_skills = body.show_skills;
    if (body.accept_mentorship !== undefined) {
      updates.accept_mentorship = body.accept_mentorship;
    }
    if (body.auto_accept_teammates !== undefined) {
      updates.auto_accept_teammates = body.auto_accept_teammates;
    }
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.has_commenced !== undefined) {
      updates.has_commenced = body.has_commenced;
    }
    if (body.cycle !== undefined) updates.cycle = body.cycle || null;

    const updateEntries = Object.entries(updates);
    if (updateEntries.length === 0) {
      return res.status(400).json({ error: "No profile updates provided" });
    }

    const setClause = updateEntries.map(([key]) => `${key} = ?`).join(", ");

    await pool.query(
      `UPDATE users
       SET ${setClause}
       WHERE id = ?`,
      [...updateEntries.map(([, value]) => value), userId],
    );

    const [users] = await pool.query(
      `SELECT ${USER_SELECT_FIELDS}
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// PUT /api/users/:userId/password
// Change user password
export const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password are required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  try {
    // Get current password hash
    const [users] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // For demo purposes, compare directly (in production, use bcrypt)
    const storedHash = users[0].password_hash;

    // If no password set, allow setting one
    if (storedHash && storedHash !== currentPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newPassword,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// DELETE /api/users/:userId
// Delete user account
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete related data first (cascading should handle this, but being explicit)
    await pool.query("DELETE FROM user_skill_signals WHERE user_id = ?", [
      userId,
    ]);
    await pool.query("DELETE FROM project_members WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM skill_validations WHERE user_id = ?", [
      userId,
    ]);

    // Delete user
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
