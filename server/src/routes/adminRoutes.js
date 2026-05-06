import express from "express";
import pool from "../config/db.js";
import {
   createInvitation,
   validateInvitation,
   registerWithInvitation,
   listInvitations,
   revokeInvitation,
   createSpecialInvitation,
 } from "../controllers/invitationController.js";

const router = express.Router();

const INTERNAL_API_KEY = "syncup-reset-key-2024";

// GET /api/admin/active-sessions
// Returns count of users with online status in user_presence
router.get("/active-sessions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM user_presence WHERE status = 'online'`,
    );
    res.json({ activeSessions: rows[0]?.count || 0 });
  } catch (err) {
    console.error("Error fetching active sessions:", err);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

// GET /api/admin/stats
// Returns platform stats for admin dashboard
router.get("/stats", async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(
      `SELECT COUNT(*) as userCount FROM users`,
    );
    const [[{ projectCount }]] = await pool.query(
      `SELECT COUNT(*) as projectCount FROM projects`,
    );
    const [[{ sessionCount }]] = await pool.query(
      `SELECT COUNT(*) as sessionCount FROM mentorship_sessions`,
    );

    // Count inactive users (no activity in 30+ days)
    const [[{ inactiveCount }]] = await pool.query(
      `SELECT COUNT(*) as inactiveCount FROM users u 
       WHERE NOT EXISTS (
         SELECT 1 FROM user_skill_signals uss 
         WHERE uss.user_id = u.id 
         AND uss.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       )`,
    );

    res.json({
      users: userCount || 0,
      projects: projectCount || 0,
      sessions: sessionCount || 0,
      inactiveUsers: inactiveCount || 0,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ error: "Failed to fetch admin stats" });
  }
});

// GET /api/admin/platform-stats
// Returns platform info for System tab
router.get("/platform-stats", async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM users`,
    );
    const [[{ projectCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM projects`,
    );
    const [[{ sessionCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM mentorship_sessions`,
    );
    const [[{ errorCount }]] = await pool.query(
      `SELECT COUNT(*) as count FROM system_errors`,
    );

    res.json({
      totalUsers: userCount || 0,
      totalProjects: projectCount || 0,
      totalSessions: sessionCount || 0,
      totalErrors: errorCount || 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      appVersion: "3.0.0",
    });
  } catch (err) {
    console.error("Error fetching platform stats:", err);
    res.status(500).json({ error: "Failed to fetch platform stats" });
  }
});

// GET /api/admin/growth-stats
// Returns user and project creation counts for the last 30 days
router.get("/growth-stats", async (req, res) => {
  try {
    // Get users joined in last 30 days
    const [users] = await pool.query(
      `SELECT DATE_FORMAT(join_date, '%Y-%m-%d') as date, COUNT(*) as count 
       FROM users 
       WHERE join_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE_FORMAT(join_date, '%Y-%m-%d')
       ORDER BY date ASC`,
    );

    // Get projects started in last 30 days
    const [projects] = await pool.query(
      `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') as date, COUNT(*) as count 
       FROM projects 
       WHERE start_date IS NOT NULL 
       AND start_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE_FORMAT(start_date, '%Y-%m-%d')
       ORDER BY date ASC`,
    );

    // Generate last 30 days with zeros for missing dates
    const today = new Date();
    // Use local date instead of UTC to match MySQL DATE_FORMAT which formats in local DB time
    const [year, month, day] = [
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    ];
    const localTodayStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const localToday = new Date(`${localTodayStr}T00:00:00`);

    const thirtyDaysAgo = new Date(localToday);
    thirtyDaysAgo.setDate(localToday.getDate() - 29);

    const dailyData = [];
    for (
      let d = new Date(thirtyDaysAgo);
      d <= localToday;
      d.setDate(d.getDate() + 1)
    ) {
      const dYear = d.getFullYear();
      const dMonth = String(d.getMonth() + 1).padStart(2, "0");
      const dDay = String(d.getDate()).padStart(2, "0");
      const dateStr = `${dYear}-${dMonth}-${dDay}`;

      const userCount = users.find((u) => u.date === dateStr)?.count || 0;
      const projectCount = projects.find((p) => p.date === dateStr)?.count || 0;

      dailyData.push({
        date: dateStr,
        users: userCount,
        projects: projectCount,
      });
    }

    res.json(dailyData);
  } catch (err) {
    console.error("Error fetching growth stats:", err);
    res.status(500).json({ error: "Failed to fetch growth stats" });
  }
});

// GET /api/admin/hq-analytics
// Returns operational metrics for the ICAA HQ admin overview.
router.get("/hq-analytics", async (req, res) => {
  const communityAudienceSql = `
    SELECT COUNT(*) AS audience_count
    FROM users
    WHERE (is_active IS NULL OR is_active != FALSE)
      AND (role IN ('resident', 'alumni') OR has_commenced = TRUE)
  `;

  try {
    const [[summary]] = await pool.query(`
      SELECT
        (SELECT COUNT(*)
         FROM announcements a
         WHERE a.is_active = TRUE
           AND (a.expires_at IS NULL OR a.expires_at > NOW())
        ) AS active_announcements,
        (SELECT COUNT(*)
         FROM events e
         WHERE e.is_active = TRUE
           AND e.event_date >= NOW()
        ) AS upcoming_events,
        (SELECT COUNT(*)
         FROM event_rsvps er
         JOIN events e ON e.id = er.event_id
         WHERE e.is_active = TRUE
           AND e.event_date >= NOW()
           AND er.rsvp_status = 'attending'
        ) AS total_rsvps,
        (SELECT COUNT(*)
         FROM messages m
         JOIN channels c ON c.id = m.channel_id
         WHERE c.name = 'introductions'
           AND m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ) AS recent_commencements
    `);

    const [[audience]] = await pool.query(communityAudienceSql);
    const audienceCount = Number(audience?.audience_count || 0);

    const [unreadAnnouncements] = await pool.query(`
      SELECT
        a.id,
        a.title,
        a.announcement_type,
        a.created_at,
        COUNT(ar.user_id) AS read_count,
        ? AS audience_count,
        GREATEST(? - COUNT(ar.user_id), 0) AS unread_count
      FROM announcements a
      LEFT JOIN announcement_reads ar ON ar.announcement_id = a.id
      WHERE a.is_active = TRUE
        AND (a.expires_at IS NULL OR a.expires_at > NOW())
      GROUP BY a.id, a.title, a.announcement_type, a.created_at
      HAVING unread_count > 0
      ORDER BY unread_count DESC, a.created_at DESC
      LIMIT 5
    `, [audienceCount, audienceCount]);

    const [[{ unread_total: unreadTotal = 0 } = {}]] = await pool.query(`
      SELECT COALESCE(SUM(unread_count), 0) AS unread_total
      FROM (
        SELECT GREATEST(? - COUNT(ar.user_id), 0) AS unread_count
        FROM announcements a
        LEFT JOIN announcement_reads ar ON ar.announcement_id = a.id
        WHERE a.is_active = TRUE
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
        GROUP BY a.id
      ) unread_by_announcement
    `, [audienceCount]);

    const [upcomingEvents] = await pool.query(`
      SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.max_attendees,
        COUNT(CASE WHEN er.rsvp_status = 'attending' THEN 1 END) AS rsvp_count
      FROM events e
      LEFT JOIN event_rsvps er ON er.event_id = e.id
      WHERE e.is_active = TRUE
        AND e.event_date >= NOW()
      GROUP BY e.id, e.title, e.event_date, e.location, e.max_attendees
      ORDER BY e.event_date ASC
      LIMIT 5
    `);

    let recentCommencements = [];
    try {
      const [rows] = await pool.query(`
        SELECT
          m.id,
          m.content,
          m.created_at,
          introduced.name AS introduced_name,
          COALESCE(m.introduction_cycle, introduced.cycle) AS cycle
        FROM messages m
        JOIN channels c ON c.id = m.channel_id
        LEFT JOIN users introduced ON introduced.id = m.introduced_user_id
        WHERE c.name = 'introductions'
        ORDER BY m.created_at DESC
        LIMIT 5
      `);
      recentCommencements = rows;
    } catch (err) {
      if (err.code !== "ER_BAD_FIELD_ERROR") {
        throw err;
      }

      const [rows] = await pool.query(`
        SELECT
          m.id,
          m.content,
          m.created_at,
          NULL AS introduced_name,
          NULL AS cycle
        FROM messages m
        JOIN channels c ON c.id = m.channel_id
        WHERE c.name = 'introductions'
        ORDER BY m.created_at DESC
        LIMIT 5
      `);
      recentCommencements = rows;
    }

    res.json({
      activeAnnouncements: Number(summary?.active_announcements || 0),
      unreadAnnouncements: Number(unreadTotal || 0),
      upcomingEvents: Number(summary?.upcoming_events || 0),
      totalRsvps: Number(summary?.total_rsvps || 0),
      recentCommencements: Number(summary?.recent_commencements || 0),
      audienceCount,
      unreadAnnouncementsList: unreadAnnouncements.map((item) => ({
        ...item,
        read_count: Number(item.read_count || 0),
        audience_count: Number(item.audience_count || 0),
        unread_count: Number(item.unread_count || 0),
      })),
      upcomingEventsList: upcomingEvents.map((event) => ({
        ...event,
        rsvp_count: Number(event.rsvp_count || 0),
      })),
      recentCommencementsList: recentCommencements,
    });
  } catch (err) {
    console.error("Error fetching HQ analytics:", err);
    res.status(500).json({ error: "Failed to fetch HQ analytics" });
  }
});

// GET /api/admin/settings/maintenance
// Returns current maintenance mode status and message
router.get("/settings/maintenance", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM platform_settings WHERE setting_key IN ('maintenance_mode', 'maintenance_message')",
    );

    const settings = {};
    rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      enabled: settings.maintenance_mode === "true",
      message:
        settings.maintenance_message ||
        "We are doing some work on the app. Please check back soon.",
    });
  } catch (err) {
    console.error("Error fetching maintenance settings:", err);
    res.status(500).json({ error: "Failed to fetch maintenance settings" });
  }
});

// PUT /api/admin/settings/maintenance
// Updates maintenance mode status and message
router.put("/settings/maintenance", async (req, res) => {
  try {
    const { enabled, message } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    await pool.query(
      "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      ["maintenance_mode", enabled.toString(), enabled.toString()],
    );

    if (message !== undefined) {
      await pool.query(
        "INSERT INTO platform_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        ["maintenance_message", message, message],
      );
    }

    res.json({
      enabled,
      message:
        message || "We are doing some work on the app. Please check back soon.",
    });
  } catch (err) {
    console.error("Error updating maintenance settings:", err);
    res.status(500).json({ error: "Failed to update maintenance settings" });
  }
});

// POST /api/admin/invitations - Create invitation (admin only)
router.post("/invitations", createInvitation);

// GET /api/admin/invitations - List invitations (admin only)
router.get("/invitations", listInvitations);

// DELETE /api/admin/invitations/:id - Revoke invitation (admin only)
router.delete("/invitations/:id", revokeInvitation);

// GET /api/admin/invitations/validate - Validate invitation token (public)
router.get("/invitations/validate", validateInvitation);

// POST /api/admin/register - Register with invitation (public)
router.post("/register", registerWithInvitation);

// POST /api/admin/invitations/special - Special access invitation (admin only)
router.post("/invitations/special", createSpecialInvitation);

// POST /api/admin/reset-demo - Reset and seed demo data
router.post("/reset-demo", async (req, res) => {
  const { apiKey } = req.body;
  
  if (apiKey !== INTERNAL_API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Disable foreign key checks temporarily
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear all data from relevant tables (preserve platform_settings and skills)
    await connection.query("DELETE FROM user_skill_signals");
    await connection.query("DELETE FROM progress_updates");
    await connection.query("DELETE FROM project_skills");
    await connection.query("DELETE FROM project_members");
    await connection.query("DELETE FROM projects");
    await connection.query("DELETE FROM mentorship_session_skills");
    await connection.query("DELETE FROM mentorship_sessions");
    await connection.query("DELETE FROM notifications");
    await connection.query("DELETE FROM user_presence");
    await connection.query("DELETE FROM profile_pictures");
    await connection.query("DELETE FROM skill_validations");
    await connection.query("DELETE FROM badges");
    await connection.query("DELETE FROM user_badges");
    await connection.query("DELETE FROM users");
    await connection.query("DELETE FROM admin_invitations");

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Seed badges (category must be: starter, progress, collaboration, or elite)
    const badges = [
      // Project badges (starter)
      { badge_key: "first_project", name: "First Project", description: "Completed your first project", icon: "Rocket", category: "starter", criteria_type: "projects_completed", criteria_value: 1 },
      { badge_key: "project_starter", name: "Project Starter", description: "Completed 3 projects", icon: "Folder", category: "progress", criteria_type: "projects_completed", criteria_value: 3 },
      { badge_key: "project_pro", name: "Project Pro", description: "Completed 10 projects", icon: "Briefcase", category: "elite", criteria_type: "projects_completed", criteria_value: 10 },
      
      // Skill badges
      { badge_key: "skill_starter", name: "Skill Starter", description: "Earned 5 unique skills", icon: "Zap", category: "starter", criteria_type: "unique_skills", criteria_value: 5 },
      { badge_key: "skill_builder", name: "Skill Builder", description: "Earned 15 unique skills", icon: "Layers", category: "progress", criteria_type: "unique_skills", criteria_value: 15 },
      { badge_key: "skill_master", name: "Skill Master", description: "Earned 30 unique skills", icon: "Star", category: "elite", criteria_type: "unique_skills", criteria_value: 30 },
      
      // Update badges
      { badge_key: "first_update", name: "First Update", description: "Posted your first progress update", icon: "MessageSquare", category: "starter", criteria_type: "update_count", criteria_value: 1 },
      { badge_key: "update_regular", name: "Update Regular", description: "Posted 10 progress updates", icon: "Edit", category: "progress", criteria_type: "update_count", criteria_value: 10 },
      { badge_key: "update_champion", name: "Update Champion", description: "Posted 50 progress updates", icon: "FileText", category: "elite", criteria_type: "update_count", criteria_value: 50 },
      
      // Mentorship badges
      { badge_key: "first_session", name: "First Session", description: "Completed your first mentorship session", icon: "Users", category: "starter", criteria_type: "sessions_completed", criteria_value: 1 },
      { badge_key: "mentor_mentor", name: "Mentor Maven", description: "Completed 5 mentorship sessions", icon: "GraduationCap", category: "progress", criteria_type: "sessions_completed", criteria_value: 5 },
      
      // Team badges
      { badge_key: "team_player", name: "Team Player", description: "Worked on a team project", icon: "UserCheck", category: "starter", criteria_type: "projects_joined", criteria_value: 1 },
      { badge_key: "collaborator", name: "Collaborator", description: "Worked on 5 team projects", icon: "Handshake", category: "progress", criteria_type: "projects_joined", criteria_value: 5 },
    ];

    for (const badge of badges) {
      await connection.query(
        `INSERT INTO badges (badge_key, name, description, icon, category, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [badge.badge_key, badge.name, badge.description, badge.icon, badge.category, badge.criteria_type, badge.criteria_value]
      );
    }

    // Create Admin
    const [adminResult] = await connection.query(
      `INSERT INTO users (name, email, password_hash, role, bio, join_date, has_commenced) VALUES (?, ?, ?, 'admin', ?, NOW(), TRUE)`,
      ["Admin User", "admin@syncup.dev", "demo123", "Platform Administrator"]
    );
    const adminId = adminResult.insertId;

    // Create 8 Mentors
    const mentors = [
      { name: "Dr. Sarah Kim", email: "sarah.kim@syncup.dev", bio: "Senior Software Architect with 15+ years experience in distributed systems." },
      { name: "Carlos Martinez", email: "carlos.m@syncup.dev", bio: "Full-stack developer specializing in React and Node.js ecosystems." },
      { name: "Priya Sharma", email: "priya.sharma@syncup.dev", bio: "Product manager turned developer, focused on user-centered design." },
      { name: "James Wilson", email: "james.wilson@syncup.dev", bio: "DevOps engineer with expertise in AWS and containerization." },
      { name: "Emily Chen", email: "emily.chen@syncup.dev", bio: "Data scientist and ML engineer passionate about AI ethics." },
      { name: "Michael Brown", email: "michael.b@syncup.dev", bio: "Security expert specializing in web application security." },
      { name: "Lisa Johnson", email: "lisa.j@syncup.dev", bio: "UX researcher and accessibility advocate." },
      { name: "David Lee", email: "david.lee@syncup.dev", bio: "Mobile development lead with iOS and Android expertise." }
    ];
    
    const mentorIds = [];
    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      const role = i % 2 === 0 ? 'resident' : 'alumni';
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role, bio, profile_visibility, join_date, has_commenced) VALUES (?, ?, ?, ?, ?, 'anyone', NOW(), TRUE)`,
        [mentor.name, mentor.email, "demo123", role, mentor.bio]
      );
      mentorIds.push(result.insertId);
    }

      // Create mentor availability for each mentor (needed for mentors page)
      const times = ["09:00:00", "10:00:00", "11:00:00", "14:00:00", "15:00:00", "16:00:00"];
      for (const mentorId of mentorIds) {
        // Add availability for next 7 days
        for (let d = 1; d <= 7; d++) {
          // Add 2-3 time slots per day
          const numSlots = 2 + Math.floor(Math.random() * 2);
          const shuffledTimes = [...times].sort(() => Math.random() - 0.5);
          for (let t = 0; t < numSlots; t++) {
            await connection.query(
              `INSERT INTO mentor_availability (mentor_id, available_date, available_time) VALUES (?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?)`,
              [mentorId, d, shuffledTimes[t]]
            );
          }
        }
      }

    // Create 10 Interns
    const interns = [
      { name: "Alex Rivers", email: "alex.rivers@syncup.dev", bio: "Computer Science student passionate about web development." },
      { name: "Maya Chen", email: "maya.chen@syncup.dev", bio: "Software engineering intern interested in backend systems." },
      { name: "Jordan Park", email: "jordan.park@syncup.dev", bio: "Full-stack aspiring developer with a knack for UI/UX." },
      { name: "Sam Foster", email: "sam.foster@syncup.dev", bio: "Data analytics enthusiast learning to build data pipelines." },
      { name: "Taylor Morgan", email: "taylor.m@syncup.dev", bio: "Mobile development enthusiast exploring React Native." },
      { name: "Casey Williams", email: "casey.w@syncup.dev", bio: "Cybersecurity student learning penetration testing." },
      { name: "Riley Thompson", email: "riley.t@syncup.dev", bio: "Cloud computing intern fascinated by serverless architectures." },
      { name: "Jamie Garcia", email: "jamie.g@syncup.dev", bio: "AI/ML intern with interest in natural language processing." },
      { name: "Quinn Anderson", email: "quinn.a@syncup.dev", bio: "DevOps aspirant learning CI/CD pipelines." },
      { name: "Avery Davis", email: "avery.d@syncup.dev", bio: "Frontend developer learning modern CSS and animations." }
    ];
    
    const internIds = [];
    for (let i = 0; i < interns.length; i++) {
      const intern = interns[i];
      const hasCommenced = i < 5; // First 5 have commenced, next 5 haven't
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role, bio, join_date, has_commenced) VALUES (?, ?, ?, 'intern', ?, NOW(), ?)`,
        [intern.name, intern.email, "demo123", intern.bio, hasCommenced]
      );
      internIds.push(result.insertId);
    }

    // Project themes related to "amount of mora" (interpreted as various topics/themes)
    const projectThemes = [
      "E-Commerce Platform", "Social Media App", "Task Management Tool", "Weather Dashboard",
      "Recipe Finder", "Fitness Tracker", "Book Library", "Music Player", "Video Streaming",
      "Chat Application", "Portfolio Website", "Blog Platform", "News Aggregator",
      "Expense Tracker", "Budget Planner", "Investment Tracker", "Invoice Generator",
      "Survey Builder", "Quiz App", "Flashcard System", "Learning Management System",
      "Content Management System", "API Gateway", "Microservices Demo", "Blockchain Explorer"
    ];

    const projectDescriptions = [
      "Build a comprehensive platform for managing and tracking various activities.",
      "Create an intuitive interface for users to organize their daily workflows.",
      "Develop a system that helps teams collaborate and share information effectively.",
      "Design an accessible tool that simplifies complex data visualization.",
      "Implement features that enable users to track progress over time.",
      "Create a responsive application that works across multiple devices.",
      "Build real-time features for instant user engagement.",
      "Implement secure authentication and user management systems."
    ];

    // Get available skill IDs
    const [skillRows] = await connection.query("SELECT id, skill_name FROM skills");
    const skillIds = skillRows.map(s => s.id);

    // Create 15 projects for each intern (150 total)
    let projectCount = 0;
    for (let i = 0; i < internIds.length; i++) {
      const internId = internIds[i];
      
      // Assign 2-3 mentors to each intern
      const assignedMentors = [];
      const numMentors = 2 + Math.floor(Math.random() * 2); // 2-3 mentors per intern
      const shuffledMentors = [...mentorIds].sort(() => Math.random() - 0.5);
      assignedMentors.push(...shuffledMentors.slice(0, numMentors));

      for (let p = 0; p < 15; p++) {
        const isSolo = Math.random() < 0.4; // 40% solo projects
        const theme = projectThemes[(projectCount) % projectThemes.length];
        
        const [projectResult] = await connection.query(
          `INSERT INTO projects (title, description, owner_id, status, visibility, start_date) VALUES (?, ?, ?, 'active', 'public', NOW())`,
          [`${theme} - Phase ${p + 1}`, projectDescriptions[p % projectDescriptions.length], internId]
        );
        const projectId = projectResult.insertId;

        // Add project owner as member
        await connection.query(
          `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`,
          [projectId, internId]
        );

        // Add mentors as members (for mentorship tracking)
        for (const mentorId of assignedMentors) {
          await connection.query(
            `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`,
            [projectId, mentorId]
          );
        }

        // Add some group projects - add other interns as members
        if (!isSolo) {
          const numGroupMembers = 1 + Math.floor(Math.random() * 2); // 1-2 additional members
          const otherInterns = internIds.filter(id => id !== internId);
          const shuffledInterns = [...otherInterns].sort(() => Math.random() - 0.5);
          const groupMembers = shuffledInterns.slice(0, numGroupMembers);
          
          for (const memberId of groupMembers) {
            await connection.query(
              `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`,
              [projectId, memberId]
            );
          }
        }

        // Add project skills (2-4 random skills per project)
        const numProjectSkills = 2 + Math.floor(Math.random() * 3);
        const shuffledSkills = [...skillIds].sort(() => Math.random() - 0.5);
        const projectSkillIds = shuffledSkills.slice(0, numProjectSkills);
        
        for (const skillId of projectSkillIds) {
          await connection.query(
            `INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)`,
            [projectId, skillId]
          );
        }

        // Add skill signals for the project owner (so skill chart shows data)
        for (const skillId of projectSkillIds) {
          await connection.query(
            `INSERT INTO user_skill_signals (user_id, skill_id, source_type, source_id, signal_type, weight) VALUES (?, ?, 'project', ?, 'joined', 1)`,
            [internId, skillId, projectId]
          );

          // Also add to user_skills if not exists
          await connection.query(
            `INSERT IGNORE INTO user_skills (user_id, skill_id, level) VALUES (?, ?, 'intermediate')`,
            [internId, skillId]
          );
        }

        // Add some progress updates (3-6 per project)
        const numUpdates = 3 + Math.floor(Math.random() * 4);
        const updateContents = [
          "Researched initial requirements and created project specification document.",
          "Set up development environment and project scaffolding.",
          "Implemented core features and basic functionality.",
          "Added user authentication and authorization.",
          "Created responsive UI components.",
          "Fixed critical bugs identified during testing.",
          "Optimized performance and improved loading times.",
          "Wrote unit tests for core functionality.",
          "Conducted code review and addressed feedback.",
          "Deployed to staging environment for user testing."
        ];

        for (let u = 0; u < numUpdates; u++) {
          const daysAgo = (numUpdates - u) * 3 + Math.floor(Math.random() * 3);
          const [updateResult] = await connection.query(
            `INSERT INTO progress_updates (project_id, user_id, content, created_at) VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
            [projectId, internId, updateContents[u % updateContents.length], daysAgo]
          );
          const updateId = updateResult.insertId;

          // Add skill signals for progress updates (so skill chart works)
          for (const skillId of projectSkillIds) {
            await connection.query(
              `INSERT INTO user_skill_signals (user_id, skill_id, source_type, source_id, signal_type, weight) VALUES (?, ?, 'update', ?, 'update', 1)`,
              [internId, skillId, updateId]
            );
          }
        }

        projectCount++;
      }

      // Create mentorship sessions for each intern
      for (const mentorId of assignedMentors.slice(0, 2)) {
        const sessionTopics = [
          "Project kickoff and goal setting",
          "Code review and best practices",
          "Technical architecture discussion",
          "Career development and planning",
          "Debugging techniques and strategies"
        ];
        
        await connection.query(
          `INSERT INTO mentorship_sessions (intern_id, mentor_id, topic, details, session_date, session_focus, status) VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, ?)`,
          [
            internId, mentorId, 
            sessionTopics[Math.floor(Math.random() * sessionTopics.length)],
            "Discussed project progress and provided guidance on technical challenges.",
            Math.floor(Math.random() * 20) + 1,
            ["technical_guidance", "project_support", "career_guidance"][Math.floor(Math.random() * 3)],
            "completed"
          ]
        );
      }
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: "Demo data reset successfully",
      summary: {
        admin: 1,
        mentors: mentorIds.length,
        interns: internIds.length,
        projects: projectCount
      }
    });

  } catch (err) {
    await connection.rollback();
    console.error("Reset demo data error:", err);
    res.status(500).json({ error: "Failed to reset demo data" });
  } finally {
    connection.release();
  }
});

export default router;
