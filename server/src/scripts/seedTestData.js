// ============================================================
// SyncUp Test Data Seeder
// Purpose: Clean and re-seed DB with proper roles and test data
// - Active cycle C-62 with proper dates
// - Interns assigned to C-62
// - Residents (commenced alumni)
// - Alumni (community members)
// - One alumni as admin
// - Some alumni/residents as mentors
// ============================================================

import pool from "../config/db.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const PASSWORD = "Test1234!";

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function seed() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    console.log("\n🧹 Cleaning existing test data...");

    // Clean tables in correct order (respecting foreign keys)
    await connection.query("DELETE FROM poll_votes");
    await connection.query("DELETE FROM poll_options");
    await connection.query("DELETE FROM polls");
    await connection.query("DELETE FROM skills");
    await connection.query("ALTER TABLE skills AUTO_INCREMENT = 1");
    await connection.query("DELETE FROM announcement_reads");
    await connection.query("DELETE FROM announcements");
    await connection.query("DELETE FROM event_rsvps");
    await connection.query("DELETE FROM events");
    await connection.query("DELETE FROM mentorship_session_skills");
    await connection.query("DELETE FROM mentorship_sessions");
    await connection.query("DELETE FROM mentorships");
    await connection.query("DELETE FROM mentor_availability");
    await connection.query("DELETE FROM user_badges");
    await connection.query("DELETE FROM user_skill_signals");
    await connection.query("DELETE FROM user_skills");
    await connection.query("DELETE FROM skill_logs");
    await connection.query("DELETE FROM skill_validations");
    await connection.query("DELETE FROM progress_updates");
    await connection.query("DELETE FROM project_discussions");
    await connection.query("DELETE FROM project_join_requests");
    await connection.query("DELETE FROM project_skills");
    await connection.query("DELETE FROM project_members");
    await connection.query("DELETE FROM projects");
    await connection.query("DELETE FROM tasks");
    await connection.query("DELETE FROM team_members");
    await connection.query("DELETE FROM teams");
    await connection.query("DELETE FROM messages");
    await connection.query("DELETE FROM channel_members");
    await connection.query("DELETE FROM channels");
    await connection.query("DELETE FROM notifications");
    await connection.query("DELETE FROM encouragements");
    await connection.query("DELETE FROM user_presence");
    await connection.query("DELETE FROM governance_positions");
    await connection.query("DELETE FROM opportunities");
    await connection.query("DELETE FROM admin_invitations");
    await connection.query("DELETE FROM system_errors");
    await connection.query("DELETE FROM password_resets");
    await connection.query("DELETE FROM email_verifications");
    await connection.query("DELETE FROM intern_cycles");
    await connection.query("ALTER TABLE intern_cycles AUTO_INCREMENT = 1");

    // Delete users but keep admin if exists, or clean all
    await connection.query("DELETE FROM users WHERE email LIKE '%@syncup.dev' OR email LIKE '%@icstars.org'");
    await connection.query("ALTER TABLE users AUTO_INCREMENT = 1");

    console.log("✅ Database cleaned\n");

    // ============================================================
    // STEP 1: Create Active Cycle C-62
    // ============================================================
    console.log("📅 Creating active cycle C-62...");

    const cycleStartDate = "2026-01-06";
    const cycleEndDate = "2026-06-15";

    const [cycleResult] = await connection.query(
      `INSERT INTO intern_cycles (cycle_name, start_date, end_date, status)
       VALUES (?, ?, ?, ?)`,
      ["C-62", cycleStartDate, cycleEndDate, "active"]
    );
    const cycleId = cycleResult.insertId;
    console.log(`✅ Created cycle C-62 (id: ${cycleId})\n`);

    // ============================================================
    // STEP 2: Create Users
    // ============================================================
    console.log("👥 Creating users...");

    const hashedPassword = await hashPassword(PASSWORD);

    // Admin user (alumni with is_admin = true)
    const adminUser = {
      name: "Admin User",
      email: "admin@syncup.dev",
      role: "alumni",
      is_admin: true,
      has_commenced: true,
      cycle: null,
      intern_cycle_id: null,
      bio: "Platform administrator and iCAA community leader.",
      headline: "iCAA Administrator",
      profile_pic: null,
    };

    // Interns (assigned to C-62)
    const interns = [
      { name: "Alex Rivers", email: "alex.rivers@icstars.org", bio: "Full-stack developer passionate about React and Node.js." },
      { name: "Maya Chen", email: "maya.chen@icstars.org", bio: "UI/UX enthusiast building accessible web apps." },
      { name: "Jordan Park", email: "jordan.park@icstars.org", bio: "Backend developer with strong Python and SQL skills." },
      { name: "Sam Foster", email: "sam.foster@icstars.org", bio: "Data-driven developer who loves analytics and visualization." },
      { name: "Taylor Kim", email: "taylor.kim@icstars.org", bio: "Mobile-first developer exploring React Native." },
      { name: "Casey Jones", email: "casey.jones@icstars.org", bio: "DevOps enthusiast learning cloud architecture." },
    ];

    // Residents (completed internship, now community members)
    const residents = [
      { name: "Dr. Sarah Kim", email: "sarah.kim@syncup.dev", bio: "Former intern now working at Google. Love mentoring new developers.", headline: "Software Engineer @ Google" },
      { name: "Carlos Martinez", email: "carlos.m@syncup.dev", bio: "Full-stack developer and open source contributor.", headline: "Senior Developer @ TechCorp" },
      { name: "Priya Sharma", email: "priya.sharma@syncup.dev", bio: "Data scientist passionate about ML and analytics.", headline: "Data Scientist @ DataCo" },
    ];

    // Alumni (long-time community members)
    const alumni = [
      { name: "James Wilson", email: "james.wilson@syncup.dev", bio: "Entrepreneur and iCAA founding member.", headline: "CTO @ StartupX" },
      { name: "Emily Chen", email: "emily.chen@syncup.dev", bio: "Product manager with engineering background.", headline: "Product Manager @ BigTech" },
      { name: "Michael Brown", email: "michael.b@syncup.dev", bio: "Cybersecurity specialist and mentor.", headline: "Security Engineer @ SecureCo" },
      { name: "Lisa Johnson", email: "lisa.j@syncup.dev", bio: "Frontend architect and conference speaker.", headline: "Frontend Lead @ WebCo" },
      { name: "David Lee", email: "david.lee@syncup.dev", bio: "Backend architect specializing in distributed systems.", headline: "Staff Engineer @ ScaleCo" },
    ];

    // Insert admin
    await connection.query(
      `INSERT INTO users (name, email, role, is_admin, has_commenced, cycle, intern_cycle_id, bio, headline, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminUser.name, adminUser.email, adminUser.role, adminUser.is_admin, adminUser.has_commenced, adminUser.cycle, adminUser.intern_cycle_id, adminUser.bio, adminUser.headline || null, hashedPassword]
    );
    console.log(`  ✅ Admin: ${adminUser.name}`);

    // Insert interns
    const internIds = [];
    for (const intern of interns) {
      const [result] = await connection.query(
        `INSERT INTO users (name, email, role, has_commenced, cycle, intern_cycle_id, bio, password_hash)
         VALUES (?, ?, 'intern', FALSE, 'C-62', ?, ?, ?)`,
        [intern.name, intern.email, cycleId, intern.bio, hashedPassword]
      );
      internIds.push(result.insertId);
      console.log(`  ✅ Intern: ${intern.name} (C-62)`);
    }

    // Insert residents (these will be mentors)
    const residentIds = [];
    for (const resident of residents) {
      const [result] = await connection.query(
        `INSERT INTO users (name, email, role, has_commenced, cycle, intern_cycle_id, bio, headline, password_hash)
         VALUES (?, ?, 'resident', TRUE, NULL, NULL, ?, ?, ?)`,
        [resident.name, resident.email, resident.bio, resident.headline || null, hashedPassword]
      );
      residentIds.push(result.insertId);
      console.log(`  ✅ Resident: ${resident.name}`);
    }

    // Insert alumni
    const alumniIds = [];
    for (const alum of alumni) {
      const [result] = await connection.query(
        `INSERT INTO users (name, email, role, has_commenced, cycle, intern_cycle_id, bio, headline, password_hash)
         VALUES (?, ?, 'alumni', TRUE, NULL, NULL, ?, ?, ?)`,
        [alum.name, alum.email, alum.bio, alum.headline || null, hashedPassword]
      );
      alumniIds.push(result.insertId);
      console.log(`  ✅ Alumni: ${alum.name}`);
    }

    console.log(`\n✅ Created ${1 + interns.length + residents.length + alumni.length} users\n`);

    // ============================================================
    // STEP 3: Create Mentor Profiles
    // ============================================================
    console.log("🎓 Setting up mentors (residents + alumni)...");

    // All residents and some alumni become mentors
    const mentorIds = [...residentIds, alumniIds[0], alumniIds[2], alumniIds[4]]; // Dr. Sarah, Carlos, Priya, James, Michael, David

    for (const mentorId of mentorIds) {
      // Add mentor availability for next 30 days
      for (let i = 1; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const hours = [9, 10, 11, 14, 15, 16][Math.floor(Math.random() * 6)];
        await connection.query(
          `INSERT INTO mentor_availability (mentor_id, available_date, available_time)
           VALUES (?, ?, ?)`,
          [mentorId, date.toISOString().split('T')[0], `${hours}:00:00`]
        );
      }

      // Create mentorship relationships with each intern
      for (const internId of internIds) {
        await connection.query(
          `INSERT INTO mentorships (mentor_id, mentee_id, status)
           VALUES (?, ?, 'active')`,
          [mentorId, internId]
        );
      }
    }

    console.log(`✅ Set up ${mentorIds.length} mentors with availability and mentees\n`);

    // ============================================================
    // STEP 4: Create Skills
    // ============================================================
    console.log("🛠️ Creating skills...");

    const skills = [
      { name: "React", category: "frontend" },
      { name: "Node.js", category: "backend" },
      { name: "SQL", category: "backend" },
      { name: "JavaScript", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Python", category: "backend" },
      { name: "API Design", category: "backend" },
      { name: "System Design", category: "backend" },
      { name: "Debugging", category: "technical" },
      { name: "Git", category: "technical" },
      { name: "Docker", category: "technical" },
      { name: "AWS", category: "technical" },
      { name: "Testing", category: "technical" },
      { name: "HTML/CSS", category: "frontend" },
      { name: "Express", category: "backend" },
      { name: "Communication", category: "soft" },
      { name: "Leadership", category: "soft" },
      { name: "Collaboration", category: "soft" },
      { name: "Problem Solving", category: "soft" },
      { name: "Mentoring", category: "soft" },
    ];

    const skillIdMap = {};
    for (const skill of skills) {
      const [result] = await connection.query(
        `INSERT INTO skills (skill_name, category) VALUES (?, ?)`,
        [skill.name, skill.category]
      );
      skillIdMap[skill.name] = result.insertId;
    }

    console.log(`✅ Created ${skills.length} skills\n`);

    // ============================================================
    // STEP 5: Create Projects
    // ============================================================
    console.log("📁 Creating projects...");

    const projects = [
      {
        title: "Task Manager Pro",
        description: "Build a collaborative task management app with real-time updates.",
        owner_id: internIds[0], // Alex
        status: "active",
        skills: ["React", "Node.js", "SQL", "Git"],
        members: [internIds[0], internIds[1], residentIds[0]], // Alex, Maya, Dr. Sarah
      },
      {
        title: "API Gateway Service",
        description: "Design and implement a microservices API gateway.",
        owner_id: internIds[1], // Maya
        status: "active",
        skills: ["Node.js", "API Design", "System Design", "Docker"],
        members: [internIds[1], internIds[2], residentIds[1]], // Maya, Jordan, Carlos
      },
      {
        title: "Data Analytics Dashboard",
        description: "Create interactive dashboards for project metrics.",
        owner_id: internIds[3], // Sam
        status: "active",
        skills: ["Python", "SQL", "React", "Testing"],
        members: [internIds[3], internIds[4], residentIds[2]], // Sam, Taylor, Priya
      },
    ];

    const projectIds = {};
    for (const project of projects) {
      const [result] = await connection.query(
        `INSERT INTO projects (title, description, owner_id, status, github_url, live_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [project.title, project.description, project.owner_id, project.status, `https://github.com/syncup/${project.title.toLowerCase().replace(/ /g, '-')}`, `https://${project.title.toLowerCase().replace(/ /g, '-')}.syncup.dev`]
      );
      projectIds[project.title] = result.insertId;

      // Add project skills
      for (const skillName of project.skills) {
        const skillId = skillIdMap[skillName];
        if (skillId) {
          await connection.query(
            `INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)`,
            [result.insertId, skillId]
          );
        }
      }

      // Add project members
      for (const userId of project.members) {
        if (userId !== project.owner_id) {
          await connection.query(
            `INSERT INTO project_members (project_id, user_id) VALUES (?, ?)`,
            [result.insertId, userId]
          );
        }
      }

      console.log(`  ✅ Project: ${project.title}`);
    }

    console.log(`\n✅ Created ${projects.length} projects\n`);

    // ============================================================
    // STEP 6: Create Mentorship Sessions
    // ============================================================
    console.log("📅 Creating mentorship sessions...");

    const sessionTopics = [
      { topic: "React State Management", focus: "technical_guidance" },
      { topic: "API Security Best Practices", focus: "technical_guidance" },
      { topic: "Career Transition Strategies", focus: "career_guidance" },
      { topic: "Building Your Personal Brand", focus: "life_leadership" },
      { topic: "SQL Query Optimization", focus: "technical_guidance" },
      { topic: "System Design Fundamentals", focus: "technical_guidance" },
      { topic: "Resume Review & Interview Prep", focus: "career_guidance" },
      { topic: "Leadership in Tech", focus: "life_leadership" },
    ];

    let sessionCount = 0;
    for (const mentorId of mentorIds) {
      // Get mentees for this mentor
      const [mentees] = await connection.query(
        `SELECT mentee_id FROM mentorships WHERE mentor_id = ?`,
        [mentorId]
      );

      for (const menteeRow of mentees) {
        const topic = sessionTopics[sessionCount % sessionTopics.length];
        const daysAgo = Math.floor(Math.random() * 30);
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - daysAgo);

        const [sessionResult] = await connection.query(
          `INSERT INTO mentorship_sessions (intern_id, mentor_id, topic, details, session_date, session_focus, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [menteeRow.mentee_id, mentorId, topic.topic, `Discussion about ${topic.topic.toLowerCase()}`, sessionDate.toISOString().split('T')[0], topic.focus, "completed"]
        );

        // Add skills to session
        const sessionSkills = projects[0].skills.slice(0, 2);
        for (const skillName of sessionSkills) {
          const skillId = skillIdMap[skillName];
          if (skillId) {
            await connection.query(
              `INSERT INTO mentorship_session_skills (session_id, skill_id) VALUES (?, ?)`,
              [sessionResult.insertId, skillId]
            );
          }
        }

        sessionCount++;
      }
    }

    console.log(`✅ Created ${sessionCount} mentorship sessions\n`);

    // ============================================================
    // STEP 7: Create Progress Updates
    // ============================================================
    console.log("📝 Creating progress updates...");

    const updateTemplates = [
      "Set up project structure and initialized the repository.",
      "Implemented core features and added unit tests.",
      "Fixed critical bugs and improved error handling.",
      "Added documentation and improved code readability.",
      "Integrated third-party APIs and optimized performance.",
    ];

    let updateCount = 0;
    for (const project of projects) {
      for (const userId of project.members.filter(m => m <= Math.max(...internIds))) {
        // Only interns post updates
        for (let week = 0; week < 3; week++) {
          const content = updateTemplates[(updateCount + week) % updateTemplates.length];
          const updateDate = new Date();
          updateDate.setDate(updateDate.getDate() - (week * 7));

          await connection.query(
            `INSERT INTO progress_updates (project_id, user_id, content, created_at)
             VALUES (?, ?, ?, ?)`,
            [projectIds[project.title], userId, content, updateDate.toISOString().split('T')[0]]
          );
          updateCount++;
        }
      }
    }

    console.log(`✅ Created ${updateCount} progress updates\n`);

    // ============================================================
    // STEP 8: Create Channels and Messages
    // ============================================================
    console.log("💬 Creating channels and messages...");

    const [generalChannel] = await connection.query(
      `INSERT INTO channels (name, description, channel_type, is_private, created_by) VALUES ('general', 'General discussion', 'general', 0, 1)`
    );

    // Add all users to general channel
    const allUserIds = [1, ...internIds, ...residentIds, ...alumniIds]; // 1 is admin
    for (const userId of allUserIds) {
      await connection.query(
        `INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)`,
        [generalChannel.insertId, userId]
      );
    }

    // Add some messages
    const messages = [
      "Welcome to SyncUp! Excited to collaborate with everyone.",
      "Just pushed a new feature to the repo. Check it out!",
      "Has anyone worked with WebSocket connections in React?",
      "Great session today on system design. Learned a lot!",
      "Reminder: Please update your project progress by Friday.",
    ];

    for (const msg of messages) {
      const randomUser = allUserIds[Math.floor(Math.random() * allUserIds.length)];
      await connection.query(
        `INSERT INTO messages (channel_id, sender_id, content) VALUES (?, ?, ?)`,
        [generalChannel.insertId, randomUser, msg]
      );
    }

    console.log(`✅ Created channels and messages\n`);

    // ============================================================
    // Summary
    // ============================================================
    await connection.commit();

    console.log("\n🎉 Seeding complete!\n");
    console.log("Summary:");
    console.log(`  - Cycle: C-62 (active)`);
    console.log(`  - Users: ${1 + interns.length + residents.length + alumni.length}`);
    console.log(`    • 1 Admin (alumni)`);
    console.log(`    • ${interns.length} Interns (C-62)`);
    console.log(`    • ${residents.length} Residents (mentors)`);
    console.log(`    • ${alumni.length} Alumni (some mentors)`);
    console.log(`  - ${mentorIds.length} Mentors with availability`);
    console.log(`  - ${projects.length} Active projects`);
    console.log(`  - ${sessionCount} Mentorship sessions`);
    console.log(`  - ${updateCount} Progress updates`);
    console.log(`\nTest accounts (password: ${PASSWORD}):`);
    console.log(`  Admin:    admin@syncup.dev`);
    console.log(`  Intern:   alex.rivers@icstars.org`);
    console.log(`  Resident: sarah.kim@syncup.dev`);
    console.log(`  Alumni:   james.wilson@syncup.dev\n`);

  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Seeding failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
