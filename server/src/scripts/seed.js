// ============================================================
// SyncUp API-Based Seeder
// Purpose: Populate database by calling actual API endpoints
// This tests the full stack and ensures signal emission works
// ============================================================

import axios from "axios";
import { faker } from "@faker-js/faker";

// Configuration
const API_BASE = process.env.API_BASE || "http://localhost:5000/api";
const DELAY_MS = 100; // Delay between requests to avoid overwhelming DB

// Helper: Delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: API caller with error handling
async function apiCall(method, endpoint, data = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await axios({ method, url, data });
    console.log(
      `${method.toUpperCase()} ${endpoint}`,
      response.data?.id || response.data?.message || "Success",
    );
    return response.data;
  } catch (error) {
    console.error(
      ` ${method.toUpperCase()} ${endpoint}`,
      error.response?.data || error.message,
    );
    return null;
  }
}

// ============================================================
// STEP 1: Create Skills (Direct DB insert required)
// ============================================================
const SKILLS = [
  // Technical Skills
  { skill_name: "React", category: "frontend" },
  { skill_name: "Node.js", category: "backend" },
  { skill_name: "SQL", category: "backend" },
  { skill_name: "JavaScript", category: "frontend" },
  { skill_name: "TypeScript", category: "frontend" },
  { skill_name: "Python", category: "backend" },
  { skill_name: "API Design", category: "backend" },
  { skill_name: "System Design", category: "backend" },
  { skill_name: "Debugging", category: "technical" },
  { skill_name: "Git", category: "technical" },
  { skill_name: "Docker", category: "technical" },
  { skill_name: "AWS", category: "technical" },
  { skill_name: "Testing", category: "technical" },
  { skill_name: "HTML/CSS", category: "frontend" },
  { skill_name: "Express", category: "backend" },
  { skill_name: "MongoDB", category: "backend" },
  { skill_name: "REST APIs", category: "backend" },
  { skill_name: "GraphQL", category: "backend" },

  // Soft Skills
  { skill_name: "Communication", category: "soft" },
  { skill_name: "Leadership", category: "soft" },
  { skill_name: "Collaboration", category: "soft" },
  { skill_name: "Problem Solving", category: "soft" },
  { skill_name: "Time Management", category: "soft" },
  { skill_name: "Critical Thinking", category: "soft" },
  { skill_name: "Presentation", category: "soft" },
  { skill_name: "Mentoring", category: "soft" },
  { skill_name: "Project Management", category: "soft" },
  { skill_name: "Adaptability", category: "soft" },
  { skill_name: "Code Review", category: "soft" },
  { skill_name: "Documentation", category: "soft" },
];

// ============================================================
// STEP 2: Create Users (Direct DB insert required)
// ============================================================
const USERS = [
  // Interns
  { name: "Alex Rivers", email: "alex.rivers@syncup.dev", role: "intern" },
  { name: "Maya Chen", email: "maya.chen@syncup.dev", role: "intern" },
  { name: "Jordan Park", email: "jordan.park@syncup.dev", role: "intern" },
  { name: "Sam Foster", email: "sam.foster@syncup.dev", role: "intern" },

  // Mentors
  { name: "Dr. Sarah Kim", email: "sarah.kim@syncup.dev", role: "mentor" },
  { name: "Carlos Martinez", email: "carlos.m@syncup.dev", role: "mentor" },
  { name: "Priya Sharma", email: "priya.sharma@syncup.dev", role: "mentor" },

  // Admin
  { name: "Admin User", email: "admin@syncup.dev", role: "admin" },
];

// ============================================================
// STEP 3: Project Definitions
// ============================================================
const PROJECTS = [
  {
    title: "Task Manager Pro",
    description:
      "Build a collaborative task management app with real-time updates and team analytics.",
    owner_id: 1, // Alex
    status: "active",
    skills: ["React", "Node.js", "SQL", "Git"],
    members: [1, 2, 5], // Alex, Maya, Dr. Sarah
  },
  {
    title: "API Gateway Service",
    description:
      "Design and implement a microservices API gateway with authentication and rate limiting.",
    owner_id: 2, // Maya
    status: "active",
    skills: ["Node.js", "API Design", "System Design", "Docker"],
    members: [2, 3, 6], // Maya, Jordan, Carlos
  },
  {
    title: "Student Portal Redesign",
    description:
      "Modernize university student portal with improved UX and mobile responsiveness.",
    owner_id: 3, // Jordan
    status: "active",
    skills: ["React", "TypeScript", "HTML/CSS", "Communication"],
    members: [3, 4, 7], // Jordan, Sam, Priya
  },
  {
    title: "Data Analytics Dashboard",
    description:
      "Create interactive dashboards for visualizing project metrics and team performance.",
    owner_id: 4, // Sam
    status: "active",
    skills: ["Python", "SQL", "REST APIs", "Testing"],
    members: [4, 1, 5], // Sam, Alex, Dr. Sarah
  },
];

// ============================================================
// STEP 4: Progress Update Templates
// ============================================================
const UPDATE_TEMPLATES = {
  "Task Manager Pro": [
    {
      content:
        "Set up React project structure with Vite. Created basic routing and component architecture.",
      skills: ["React", "Git"],
    },
    {
      content:
        "Built authentication flow with JWT tokens. Implemented login and signup forms.",
      skills: ["React", "Node.js"],
    },
    {
      content:
        "Integrated real-time updates using WebSockets. Tasks now sync across all clients instantly.",
      skills: ["Node.js", "SQL"],
    },
    {
      content:
        "Added user profile management. Users can update bio, avatar, and notification preferences.",
      skills: ["React", "SQL"],
    },
    {
      content:
        "Fixed critical bug in task assignment logic. Prevented duplicate assignments.",
      skills: ["Debugging", "SQL"],
    },
    {
      content:
        "Implemented team analytics dashboard. Shows completion rates and burndown charts.",
      skills: ["React", "SQL"],
    },
    {
      content:
        "Wrote unit tests for task CRUD operations. Achieved 85% code coverage.",
      skills: ["Testing", "Node.js"],
    },
    {
      content:
        "Improved accessibility. Added ARIA labels and keyboard navigation throughout app.",
      skills: ["React", "HTML/CSS"],
    },
    {
      content:
        "Refactored state management to use Redux Toolkit. Simplified complex component logic.",
      skills: ["React", "JavaScript"],
    },
    {
      content:
        "Investigated and resolved memory leak in WebSocket connection handler.",
      skills: ["Node.js", "Debugging"],
    },
  ],
  "API Gateway Service": [
    {
      content:
        "Designed API gateway architecture. Created initial Express server with middleware setup.",
      skills: ["Node.js", "API Design"],
    },
    {
      content:
        "Implemented rate limiting logic using Redis. Added request throttling for high-traffic endpoints.",
      skills: ["Node.js", "System Design"],
    },
    {
      content:
        "Implemented OAuth2 authentication flow. Added support for Google and GitHub login.",
      skills: ["API Design", "Node.js"],
    },
    {
      content:
        "Wrote comprehensive API documentation using Swagger. All endpoints now have examples.",
      skills: ["Documentation", "REST APIs"],
    },
    {
      content:
        "Added request caching layer. API response time improved by 40%.",
      skills: ["System Design", "Node.js"],
    },
    {
      content:
        "Deployed gateway to AWS using Docker. Set up CI/CD pipeline with GitHub Actions.",
      skills: ["Docker", "AWS"],
    },
    {
      content:
        "Implemented health check endpoints. Gateway now reports service status.",
      skills: ["Node.js", "API Design"],
    },
    {
      content:
        "Optimized Docker image size from 850MB to 210MB using multi-stage builds.",
      skills: ["Docker", "System Design"],
    },
    {
      content:
        "Set up monitoring with Prometheus and Grafana. Now tracking request latency and error rates.",
      skills: ["System Design", "AWS"],
    },
    {
      content:
        "Presented API gateway architecture to team. Received approval to proceed with deployment.",
      skills: ["Presentation", "Communication"],
    },
  ],
  "Student Portal Redesign": [
    {
      content:
        "Wireframed new student portal UI in Figma. Gathered feedback from 5 students.",
      skills: ["Communication", "HTML/CSS"],
    },
    {
      content:
        "Started converting designs to React components. Built responsive navigation bar.",
      skills: ["React", "HTML/CSS"],
    },
    {
      content:
        "Built course enrollment component. Students can browse and register for classes.",
      skills: ["React", "TypeScript"],
    },
    {
      content:
        "Optimized mobile layout. Portal now works smoothly on tablets and phones.",
      skills: ["HTML/CSS", "React"],
    },
    {
      content:
        "Integrated TypeScript for better type safety. Refactored 15 components.",
      skills: ["TypeScript", "React"],
    },
    {
      content:
        "Conducted user testing session with 10 students. Gathered 23 actionable feedback items.",
      skills: ["Communication", "Problem Solving"],
    },
    {
      content:
        "Finalized grade viewing component. Students can see current and historical grades.",
      skills: ["React", "TypeScript"],
    },
    {
      content:
        "Fixed responsive layout bug on iPhone Safari. Portal now works on all devices.",
      skills: ["Debugging", "HTML/CSS"],
    },
    {
      content:
        "Migrated legacy jQuery code to modern React hooks. Reduced bundle size by 120KB.",
      skills: ["React", "JavaScript"],
    },
    {
      content:
        "Collaborated with design team on final UI polish. Implemented feedback from stakeholders.",
      skills: ["Collaboration", "Communication"],
    },
  ],
  "Data Analytics Dashboard": [
    {
      content:
        "Set up Python Flask backend. Connected to MySQL database for analytics queries.",
      skills: ["Python", "SQL"],
    },
    {
      content:
        "Created data aggregation scripts. Built SQL views for performance metrics.",
      skills: ["SQL", "Python"],
    },
    {
      content:
        "Created interactive charts using Plotly. Users can filter by date range and team.",
      skills: ["Python", "REST APIs"],
    },
    {
      content:
        "Debugged complex SQL query performance issue. Reduced load time from 8s to 0.3s.",
      skills: ["SQL", "Debugging"],
    },
    {
      content:
        "Built export functionality. Users can download reports as CSV or PDF.",
      skills: ["Python", "REST APIs"],
    },
    {
      content:
        "Added real-time data refresh. Dashboard updates every 30 seconds automatically.",
      skills: ["Python", "REST APIs"],
    },
    {
      content:
        "Added custom date range selector. Users can analyze any time period.",
      skills: ["Python", "JavaScript"],
    },
    {
      content:
        "Optimized database indexes. Query performance improved across all dashboards.",
      skills: ["SQL", "System Design"],
    },
    {
      content:
        "Wrote technical documentation for data pipeline. New team members can now onboard faster.",
      skills: ["Documentation", "Communication"],
    },
    {
      content:
        "Integrated third-party API for weather data visualization in analytics dashboard.",
      skills: ["REST APIs", "Python"],
    },
  ],
};

// ============================================================
// STEP 5: Mentorship Session Templates
// ============================================================
const MENTORSHIP_SESSIONS = [
  {
    intern_id: 1,
    mentor_id: 5, // Alex + Dr. Sarah
    topic: "React State Management Best Practices",
    details:
      "Deep dive into useState vs useReducer, when to use Context, and Redux patterns.",
    session_focus: "technical_guidance",
    project_id: 1,
    skills: ["React", "Communication"],
    status: "completed",
    daysAgo: 25,
  },
  {
    intern_id: 2,
    mentor_id: 6, // Maya + Carlos
    topic: "API Security & Authentication",
    details:
      "Discussed JWT vs session tokens, OAuth2 flows, and common security vulnerabilities.",
    session_focus: "technical_guidance",
    project_id: 2,
    skills: ["API Design", "Node.js"],
    status: "completed",
    daysAgo: 18,
  },
  {
    intern_id: 3,
    mentor_id: 7, // Jordan + Priya
    topic: "TypeScript Migration Strategy",
    details:
      "How to incrementally adopt TypeScript in an existing React codebase.",
    session_focus: "project_support",
    project_id: 3,
    skills: ["TypeScript", "React"],
    status: "completed",
    daysAgo: 10,
  },
  {
    intern_id: 4,
    mentor_id: 5, // Sam + Dr. Sarah
    topic: "SQL Query Optimization",
    details:
      "Analyzed slow queries, explained indexing strategies, and database performance tuning.",
    session_focus: "technical_guidance",
    project_id: 4,
    skills: ["SQL", "Debugging"],
    status: "completed",
    daysAgo: 7,
  },
  {
    intern_id: 1,
    mentor_id: 6, // Alex + Carlos (Career)
    topic: "Transitioning from Intern to Full-Time",
    details:
      "Discussed resume building, interview prep, and negotiation strategies.",
    session_focus: "career_guidance",
    project_id: null,
    skills: [], // No skills for career guidance
    status: "completed",
    daysAgo: 15,
  },
  {
    intern_id: 2,
    mentor_id: 7, // Maya + Priya (Life)
    topic: "Building Your Personal Brand",
    details:
      "Strategies for LinkedIn, GitHub presence, and technical blogging.",
    session_focus: "life_leadership",
    project_id: null,
    skills: [], // No skills for life/leadership
    status: "completed",
    daysAgo: 12,
  },
  {
    intern_id: 3,
    mentor_id: 5, // Jordan + Dr. Sarah (Upcoming)
    topic: "System Design Fundamentals",
    details:
      "Learn how to approach system design interviews and architectural thinking.",
    session_focus: "technical_guidance",
    project_id: null,
    skills: ["System Design"],
    status: "accepted",
    daysAgo: -2, // Future
  },
  {
    intern_id: 4,
    mentor_id: 6, // Sam + Carlos (Upcoming)
    topic: "Advanced Python Patterns",
    details:
      "Decorators, context managers, and functional programming in Python.",
    session_focus: "technical_guidance",
    project_id: 4,
    skills: ["Python"],
    status: "accepted",
    daysAgo: -4, // Future
  },
];

// ============================================================
// MAIN SEEDER FUNCTION
// ============================================================
async function seed() {
  console.log("\n Starting SyncUp Seeder...\n");

  console.log(
    "  NOTE: Skills and Users must be inserted directly into DB first!",
  );
  console.log(
    "Run the SQL script for users and skills, then run this seeder.\n",
  );

  try {
    // ──────────────────────────────────────────────────────
    // 1. Fetch all skills to get IDs
    // ──────────────────────────────────────────────────────
    console.log("Fetching skills...");
    const skillsResponse = await apiCall("get", "/skills");
    if (!skillsResponse) {
      console.error(
        " Failed to fetch skills. Make sure skills are in the database.",
      );
      return;
    }

    const skillMap = {};
    skillsResponse.forEach((skill) => {
      skillMap[skill.skill_name.toLowerCase()] = skill.id;
    });
    console.log(` Loaded ${Object.keys(skillMap).length} skills\n`);

    // ──────────────────────────────────────────────────────
    // 2. Fetch all users to get IDs
    // ──────────────────────────────────────────────────────
    console.log("Fetching users...");
    const usersResponse = await apiCall("get", "/users");
    if (!usersResponse) {
      console.error(
        " Failed to fetch users. Make sure users are in the database.",
      );
      return;
    }

    const userMap = {};
    usersResponse.forEach((user) => {
      userMap[user.name.toLowerCase()] = user.id;
    });
    console.log(` Loaded ${Object.keys(userMap).length} users\n`);

    // ──────────────────────────────────────────────────────
    // 3. Create Projects
    // ──────────────────────────────────────────────────────
    console.log(" Creating projects...");
    const projectIds = {};

    for (const project of PROJECTS) {
      // Find owner ID from userMap
      const ownerName = USERS[project.owner_id - 1].name.toLowerCase();
      const ownerId = userMap[ownerName];

      if (!ownerId) {
        console.error(`  Owner not found for project: ${project.title}`);
        continue;
      }

      const projectData = {
        title: project.title,
        description: project.description,
        owner_id: ownerId,
        skills: project.skills, // Backend handles find-or-create for skills
      };

      const createdProject = await apiCall("post", "/projects", projectData);
      if (createdProject && createdProject.id) {
        projectIds[project.title] = createdProject.id;
      } else {
        console.error(`  Failed to create project: ${project.title}`);
      }
      await delay(DELAY_MS);
    }
    console.log("");

    // ──────────────────────────────────────────────────────
    // 4. Add Project Members
    // ──────────────────────────────────────────────────────
    console.log("👥 Adding project members...");
    for (const project of PROJECTS) {
      const projectId = projectIds[project.title];
      if (!projectId) continue;

      for (const memberIndex of project.members) {
        const memberName = USERS[memberIndex - 1].name.toLowerCase();
        const memberId = userMap[memberName];

        if (!memberId) {
          console.error(`  Member not found: ${memberName}`);
          continue;
        }

        // Skip if member is owner (already added by createProject)
        const ownerName = USERS[project.owner_id - 1].name.toLowerCase();
        if (memberId === userMap[ownerName]) continue;

        await apiCall("post", `/projects/${projectId}/members`, {
          user_id: memberId,
        });
        await delay(DELAY_MS);
      }
    }
    console.log("");

    // ──────────────────────────────────────────────────────
    // 5. Create Progress Updates with Skills
    // ──────────────────────────────────────────────────────
    console.log("Creating progress updates (this will take a while)...");
    let updateCount = 0;

    for (const project of PROJECTS) {
      const projectId = projectIds[project.title];
      if (!projectId) continue;

      const templates = UPDATE_TEMPLATES[project.title];
      const members = project.members.filter((id) => id <= 4); // Only interns post updates

      // Distribute updates over 4 weeks
      for (let week = 0; week < 4; week++) {
        for (let i = 0; i < 2; i++) {
          // 2-3 updates per project per week
          const template = templates[week * 2 + i];
          if (!template) continue;

          const memberIndex = members[i % members.length];
          const memberName = USERS[memberIndex - 1].name.toLowerCase();
          const userId = userMap[memberName];

          if (!userId) continue;

          // Convert skill names to lowercase for matching
          const skillNames = template.skills.map((s) => s.toLowerCase());

          const updateData = {
            project_id: projectId,
            user_id: userId,
            content: template.content,
            skills: skillNames, // Backend will create skills if they don't exist
          };

          await apiCall("post", "/progress_updates", updateData);
          updateCount++;
          await delay(DELAY_MS);
        }
      }
    }
    console.log(`Created ${updateCount} progress updates\n`);

    // ──────────────────────────────────────────────────────
    // 6. Create Mentorship Sessions
    // ──────────────────────────────────────────────────────
    console.log("Creating mentorship sessions...");

    for (const session of MENTORSHIP_SESSIONS) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - session.daysAgo);

      const internName = USERS[session.intern_id - 1].name.toLowerCase();
      const mentorName = USERS[session.mentor_id - 1].name.toLowerCase();

      const internId = userMap[internName];
      const mentorId = userMap[mentorName];

      if (!internId || !mentorId) {
        console.error(
          `  Intern or Mentor not found for session: ${session.topic}`,
        );
        continue;
      }

      const projectId =
        session.project_id ?
          projectIds[PROJECTS[session.project_id - 1].title]
        : null;

      const sessionData = {
        intern_id: internId,
        mentor_id: mentorId,
        topic: session.topic,
        details: session.details,
        session_date: sessionDate.toISOString(),
        session_focus: session.session_focus,
        project_id: projectId,
      };

      const created = await apiCall(
        "post",
        "/mentorship/sessions",
        sessionData,
      );
      await delay(DELAY_MS);

      // If completed, update status and add skills
      if (session.status === "completed" && created?.id) {
        const skillIds = session.skills
          .map((name) => skillMap[name.toLowerCase()])
          .filter(Boolean);

        await apiCall("put", `/mentorship/sessions/${created.id}`, {
          status: "completed",
          skill_ids: skillIds,
        });
        await delay(DELAY_MS);
      }

      if (session.status === "accepted" && created?.id) {
        await apiCall("put", `/mentorship/sessions/${created.id}`, {
          status: "accepted",
        });
        await delay(DELAY_MS);
      }
    }
    console.log("");

    // ──────────────────────────────────────────────────────
    // 7. Summary
    // ──────────────────────────────────────────────────────
    console.log("\n Seeding complete!\n");
    console.log("Summary:");
    console.log(`  - ${Object.keys(skillMap).length} skills`);
    console.log(`  - ${USERS.length} users`);
    console.log(`  - ${PROJECTS.length} projects`);
    console.log(`  - ${updateCount} progress updates`);
    console.log(`  - ${MENTORSHIP_SESSIONS.length} mentorship sessions`);
    console.log("\n Next steps:");
    console.log("  1. Login as alex.rivers@syncup.dev");
    console.log("  2. Navigate to Skill Tracker");
    console.log("  3. See your charts populate! 📊\n");
  } catch (error) {
    console.error("\n Seeder failed:", error.message);
    process.exit(1);
  }
}

// ============================================================
// RUN SEEDER
// ============================================================
seed();
