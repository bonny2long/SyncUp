import pool from "../config/db.js";

const USER_SELECT_FIELDS = `
  id,
  name,
  email,
  role,
  join_date,
  bio,
  headline,
  github_url,
  linkedin_url,
  personal_site_url,
  featured_project_id,
  current_title,
  current_employer,
  profile_pic,
  is_active,
  has_commenced,
  cycle,
  intern_cycle_id,
  email_notifications,
  notify_join_requests,
  notify_mentions,
  notify_session_reminders,
  notify_project_updates,
  notify_weekly_summary,
  notify_channel_messages,
  notify_dm_messages,
  notify_opportunities,
  notify_events,
  notify_encouragements,
  digest_mode,
  profile_visibility,
  show_email,
  show_projects,
  show_skills,
  accept_mentorship,
  auto_accept_teammates
`;

async function getSystemSenderId(fallbackUserId) {
  const [admins] = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1",
  );
  return admins[0]?.id || fallbackUserId;
}

async function ensureIntroductionsChannel(senderId) {
  await pool.query(
    `INSERT IGNORE INTO channels
      (name, description, created_by, is_private, channel_type, allowed_roles)
     VALUES
      ('introductions', 'Welcome new ICAA community members', ?, FALSE, 'community', NULL)`,
    [senderId],
  );

  const [channels] = await pool.query(
    "SELECT id FROM channels WHERE name = 'introductions' LIMIT 1",
  );
  return channels[0]?.id;
}

async function postCommencementIntroduction(user) {
  const senderId = await getSystemSenderId(user.id);
  const channelId = await ensureIntroductionsChannel(senderId);
  if (!channelId) return;

  const cycleText = user.cycle ? ` Cycle ${user.cycle}.` : "";
  const content = `Please welcome ${user.name} to the ICAA community.${cycleText}`;

  await pool.query(
    `INSERT INTO messages (channel_id, sender_id, recipient_id, content)
     VALUES (?, ?, NULL, ?)`,
    [channelId, senderId, content],
  );

  await pool.query(
    "INSERT IGNORE INTO channel_members (channel_id, user_id) VALUES (?, ?)",
    [channelId, user.id],
  );
}

function normalizeProfileUrl(value, label) {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
    return trimmed;
  } catch {
    const error = new Error(`${label} must be a valid http(s) URL`);
    error.statusCode = 400;
    throw error;
  }
}

function publicProfileUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    join_date: user.join_date,
    bio: user.bio,
    headline: user.headline,
    github_url: user.github_url,
    linkedin_url: user.linkedin_url,
    personal_site_url: user.personal_site_url,
    featured_project_id: user.featured_project_id,
    current_title: user.current_title,
    current_employer: user.current_employer,
    profile_pic: user.profile_pic,
    has_commenced: user.has_commenced,
    cycle: user.cycle,
    intern_cycle_id: user.intern_cycle_id,
    show_projects: user.show_projects,
    show_skills: user.show_skills,
  };
}

// GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        ${USER_SELECT_FIELDS},
        (
          SELECT COUNT(*)
          FROM project_members pm
          WHERE pm.user_id = users.id
        ) AS profile_project_count,
        (
          SELECT COUNT(DISTINCT p.id)
          FROM projects p
          JOIN project_members pm ON pm.project_id = p.id
          WHERE pm.user_id = users.id
            AND (p.github_url IS NOT NULL OR p.live_url IS NOT NULL)
        ) AS profile_linked_project_count,
        (
          SELECT COUNT(DISTINCT p.id)
          FROM projects p
          JOIN project_members pm ON pm.project_id = p.id
          WHERE pm.user_id = users.id
            AND (
              p.case_study_problem IS NOT NULL
              OR p.case_study_solution IS NOT NULL
              OR p.case_study_tech_stack IS NOT NULL
              OR p.case_study_outcomes IS NOT NULL
            )
        ) AS profile_case_study_count
      FROM users
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/directory
// Public community fields for the logged-in member directory.
export const getMemberDirectory = async (req, res) => {
  const { role, cycle, search } = req.query;
  const allowedRoles = ["resident", "alumni", "mentor"];
  const where = [
    "u.role IN ('resident', 'alumni', 'mentor')",
    "(u.is_active IS NULL OR u.is_active != FALSE)",
  ];
  const params = [];

  if (role && role !== "all" && allowedRoles.includes(role)) {
    where.push("u.role = ?");
    params.push(role);
  }

  if (cycle) {
    where.push("u.cycle = ?");
    params.push(cycle);
  }

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    where.push(`(
      u.name LIKE ?
      OR u.headline LIKE ?
      OR u.current_title LIKE ?
      OR u.current_employer LIKE ?
    )`);
    params.push(term, term, term, term);
  }

  try {
    const [rows] = await pool.query(
      `
        SELECT
          u.id,
          u.name,
          u.role,
          u.cycle,
          u.headline,
          u.profile_pic,
          u.current_title,
          u.current_employer,
          u.github_url,
          u.linkedin_url,
          u.personal_site_url,
          u.join_date,
          (
            SELECT GROUP_CONCAT(
              gp.position
              ORDER BY FIELD(
                gp.position,
                'president',
                'vice_president',
                'treasurer',
                'secretary',
                'parliamentarian',
                'tech_lead',
                'tech_member'
              )
              SEPARATOR ','
            )
            FROM governance_positions gp
            WHERE gp.user_id = u.id AND gp.is_active = TRUE
          ) AS governance_positions,
          (
            SELECT COUNT(*)
            FROM project_members pm
            WHERE pm.user_id = u.id
          ) AS project_count,
          (
            SELECT COUNT(*)
            FROM mentorship_sessions ms
            WHERE ms.mentor_id = u.id
              AND ms.status = 'completed'
          ) AS completed_mentor_sessions
        FROM users u
        WHERE ${where.join(" AND ")}
        ORDER BY FIELD(u.role, 'alumni', 'resident', 'mentor'), u.cycle ASC, u.name ASC
      `,
      params,
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching member directory:", err);
    res.status(500).json({ error: "Failed to fetch member directory" });
  }
};

// GET /api/users/:userId/profile
// Get comprehensive user profile with skills, projects, and stats
export const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const publicMode = req.query.public === "true";

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

    const [governancePositions] = await pool.query(
      `
        SELECT id, position, assigned_at
        FROM governance_positions
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY FIELD(
          position,
          'president',
          'vice_president',
          'treasurer',
          'secretary',
          'parliamentarian',
          'tech_lead',
          'tech_member'
        )
      `,
      [userId],
    );

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
        p.visibility,
        p.github_url,
        p.live_url,
        p.case_study_problem,
        p.case_study_solution,
        p.case_study_tech_stack,
        p.case_study_outcomes,
        p.case_study_artifact_url,
        p.start_date,
        p.end_date,
        MAX(pu.created_at) as last_update,
        COUNT(DISTINCT pm_all.user_id) as team_size,
        COUNT(DISTINCT ps.skill_id) as skill_count,
        COUNT(DISTINCT pu.id) as update_count
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      LEFT JOIN project_members pm_all ON p.id = pm_all.project_id
      LEFT JOIN project_skills ps ON p.id = ps.project_id
      LEFT JOIN progress_updates pu ON p.id = pu.project_id AND pu.is_deleted = 0
      GROUP BY p.id, p.title, p.description, p.status, p.visibility, p.github_url, p.live_url, p.case_study_problem, p.case_study_solution, p.case_study_tech_stack, p.case_study_outcomes, p.case_study_artifact_url, p.start_date, p.end_date
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

    const [mentorshipStats] = await pool.query(
      `
      SELECT
        COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) as sessions_completed,
        COUNT(DISTINCT CASE WHEN status = 'completed' AND mentor_id = ? THEN intern_id END) as interns_mentored,
        COUNT(DISTINCT CASE WHEN status = 'completed' AND intern_id = ? THEN mentor_id END) as mentors_worked_with,
        COUNT(DISTINCT CASE WHEN status = 'completed' AND mentor_id = ? AND project_id IS NOT NULL THEN project_id END) as projects_advised
      FROM mentorship_sessions
      WHERE mentor_id = ? OR intern_id = ?
      `,
      [userId, userId, userId, userId, userId],
    );
    stats = { ...stats, ...(mentorshipStats[0] || {}) };

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
      user: publicMode ? publicProfileUser(user) : user,
      skills: publicMode && user.show_skills === false ? [] : skills,
      projects: publicMode && user.show_projects === false ? [] : projects,
      stats,
      activity_streak: streakData[0]?.current_streak || 0,
      governance_positions: governancePositions,
      public: publicMode,
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
    const [existingUsers] = await pool.query(
      `SELECT ${USER_SELECT_FIELDS}
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUser = existingUsers[0];
    const updates = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;

    const resolvedBio =
      body.bio !== undefined ? body.bio
      : body.notes !== undefined ? body.notes
      : undefined;
    if (resolvedBio !== undefined) updates.bio = resolvedBio || null;

    if (body.headline !== undefined) {
      updates.headline = body.headline ? String(body.headline).trim() : null;
    }
    if (body.current_title !== undefined) {
      updates.current_title =
        body.current_title ? String(body.current_title).trim() : null;
    }
    if (body.current_employer !== undefined) {
      updates.current_employer =
        body.current_employer ? String(body.current_employer).trim() : null;
    }

    try {
      if (body.github_url !== undefined) {
        updates.github_url = normalizeProfileUrl(body.github_url, "GitHub URL");
      }
      if (body.linkedin_url !== undefined) {
        updates.linkedin_url = normalizeProfileUrl(
          body.linkedin_url,
          "LinkedIn URL",
        );
      }
    if (body.personal_site_url !== undefined) {
      updates.personal_site_url = normalizeProfileUrl(
        body.personal_site_url,
        "Personal site URL",
      );
      }
    } catch (err) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }

    if (body.featured_project_id !== undefined) {
      if (!body.featured_project_id) {
        updates.featured_project_id = null;
      } else {
        const featuredProjectId = Number(body.featured_project_id);
        if (!Number.isInteger(featuredProjectId) || featuredProjectId < 1) {
          return res
            .status(400)
            .json({ error: "featured_project_id must be a positive integer" });
        }

        const [featuredProjects] = await pool.query(
          `
          SELECT p.id
          FROM projects p
          LEFT JOIN project_members pm
            ON pm.project_id = p.id
            AND pm.user_id = ?
          WHERE p.id = ?
            AND (p.owner_id = ? OR pm.user_id IS NOT NULL)
          LIMIT 1
          `,
          [userId, featuredProjectId, userId],
        );

        if (featuredProjects.length === 0) {
          return res.status(400).json({
            error: "Featured project must belong to this user",
          });
        }

        updates.featured_project_id = featuredProjectId;
      }
    }

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
    if (body.notify_channel_messages !== undefined) {
      updates.notify_channel_messages = body.notify_channel_messages;
    }
    if (body.notify_dm_messages !== undefined) {
      updates.notify_dm_messages = body.notify_dm_messages;
    }
    if (body.notify_opportunities !== undefined) {
      updates.notify_opportunities = body.notify_opportunities;
    }
    if (body.notify_events !== undefined) {
      updates.notify_events = body.notify_events;
    }
    if (body.notify_encouragements !== undefined) {
      updates.notify_encouragements = body.notify_encouragements;
    }
    if (body.digest_mode !== undefined) {
      updates.digest_mode = body.digest_mode;
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
    if (body.intern_cycle_id !== undefined) {
      updates.intern_cycle_id = body.intern_cycle_id || null;
    }

    const requestedCommencement = body.has_commenced === true;
    const effectiveRole = updates.role ?? existingUser.role;
    const effectiveCommenced =
      updates.has_commenced ?? Boolean(existingUser.has_commenced);
    const effectiveCycle =
      updates.cycle !== undefined ? updates.cycle : existingUser.cycle;
    const promotesIntern =
      existingUser.role === "intern" &&
      ((requestedCommencement && effectiveRole === "intern") ||
        effectiveRole === "resident");

    if (promotesIntern && !effectiveCycle) {
      return res.status(400).json({
        error: "Cycle is required before commencing an intern",
      });
    }

    if (
      requestedCommencement &&
      existingUser.role === "intern" &&
      effectiveRole === "intern"
    ) {
      updates.role = "resident";
      updates.has_commenced = true;
    }

    if (
      updates.role !== undefined &&
      ["mentor", "resident", "alumni", "admin"].includes(updates.role) &&
      updates.has_commenced === undefined
    ) {
      updates.has_commenced = true;
    }

    if (updates.role === "intern" && effectiveCommenced) {
      updates.has_commenced = false;
    }

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

    const updatedUser = users[0];
    const wasUncommencedIntern =
      existingUser.role === "intern" && !existingUser.has_commenced;
    const isNewResident =
      updatedUser.role === "resident" && Boolean(updatedUser.has_commenced);

    if (wasUncommencedIntern && isNewResident) {
      await postCommencementIntroduction(updatedUser);
    }

    res.json(updatedUser);
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
    // Delete related data in correct order (respecting foreign keys)
    // Check which tables have user_id column
    const tablesToCheck = [
      'skill_validations', 'user_skills_signals', 'user_skills',
      'project_members', 'notifications', 'encouragement_votes',
      'poll_votes', 'progress_updates', 'project_discussions',
      'mentorship_sessions', 'user_badges', 'skill_logs'
    ];
    
    for (const table of tablesToCheck) {
      try {
        await pool.query(`DELETE FROM ${table} WHERE user_id = ?`, [userId]);
      } catch (e) {
        // Column might not exist, log and continue
        console.log(`Skip ${table}:`, e.message);
      }
    }

    // Delete user
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err.message);
    res.status(500).json({ error: "Failed to delete account: " + err.message });
  }
};
