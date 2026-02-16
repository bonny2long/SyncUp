// server/src/scripts/query_performance_test.js
// Database Query Performance Test Suite
// Run with: node src/scripts/query_performance_test.js

import pool from "../config/db.js";

const results = [];

function log(name, duration, status, details = "") {
  const result = { name, duration: `${duration}ms`, status, details };
  results.push(result);
  const icon = status === "PASS" ? "✅" : status === "WARN" ? "⚠️" : "❌";
  console.log(`${icon} ${name}: ${duration}ms${details ? ` - ${details}` : ""}`);
}

async function testQuery(name, query, params = []) {
  const start = performance.now();
  try {
    await pool.query(query, params);
    const duration = Math.round(performance.now() - start);
    log(name, duration, duration < 100 ? "PASS" : duration < 500 ? "WARN" : "FAIL");
    return duration;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    log(name, duration, "FAIL", err.message);
    return -1;
  }
}

async function checkIndexes() {
  console.log("\n🔍 CHECKING INDEXES...\n");
  
  const requiredIndexes = [
    { table: "user_skill_signals", columns: ["user_id", "created_at"], name: "idx_signals_user_created" },
    { table: "user_skill_signals", columns: ["user_id", "skill_id"], name: "idx_signals_user_skill" },
    { table: "project_members", columns: ["project_id"], name: "idx_pm_project" },
    { table: "mentorship_sessions", columns: ["mentor_id", "session_date"], name: "idx_sessions_mentor_date" },
    { table: "progress_updates", columns: ["project_id", "created_at"], name: "idx_progress_project_date" },
    { table: "skills", columns: ["skill_name"], name: "idx_skills_name" },
  ];

  for (const idx of requiredIndexes) {
    const [rows] = await pool.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [idx.table, idx.name]
    );
    
    if (rows.length > 0) {
      console.log(`  ✅ ${idx.name} exists`);
    } else {
      console.log(`  ❌ ${idx.name} MISSING - should be: CREATE INDEX ${idx.name} ON ${idx.table}(${idx.columns.join(", ")});`);
    }
  }
}

async function checkSchemaCaching() {
  console.log("\n🔍 CHECKING SCHEMA CACHING...\n");
  
  // Test if soft delete check is cached
  const [softDeleteCol] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'progress_updates' AND COLUMN_NAME = 'is_deleted'`
  );
  console.log(`  progress_updates.is_deleted column: ${softDeleteCol.length > 0 ? "✅ exists" : "❌ missing"}`);
  
  // Test if progress_update_skills table exists
  const [skillTable] = await pool.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'progress_update_skills'`
  );
  console.log(`  progress_update_skills table: ${skillTable.length > 0 ? "✅ exists" : "❌ missing"}`);
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("📊 DATABASE QUERY PERFORMANCE TEST SUITE");
  console.log("=".repeat(60));

  try {
    // Get a test user ID
    const [users] = await pool.query("SELECT id FROM users LIMIT 1");
    const testUserId = users[0]?.id || 1;
    
    const [projects] = await pool.query("SELECT id FROM projects LIMIT 1");
    const testProjectId = projects[0]?.id || 1;

    console.log(`\nTest User ID: ${testUserId}, Project ID: ${testProjectId}\n`);
    console.log("-".repeat(60));

    // ============================================
    // CRITICAL PATH TESTS (should be < 100ms)
    // ============================================
    console.log("\n⚡ CRITICAL PATH QUERIES (should be < 100ms)\n");

    // 1. User profile (multiple queries - main concern)
    await testQuery(
      "1. User Profile - Basic Info",
      `SELECT id, name, email, role FROM users WHERE id = ?`,
      [testUserId]
    );

    await testQuery(
      "2. User Profile - Skills with aggregation",
      `
      SELECT s.id, s.skill_name, s.category,
        COUNT(DISTINCT uss.id) as signal_count,
        SUM(uss.weight) as total_weight
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      LIMIT 20
      `,
      [testUserId]
    );

    await testQuery(
      "3. User Profile - Projects",
      `
      SELECT p.id, p.title, p.status,
        COUNT(DISTINCT pm_all.user_id) as team_size
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      LEFT JOIN project_members pm_all ON p.id = pm_all.project_id
      GROUP BY p.id, p.title, p.status
      LIMIT 10
      `,
      [testUserId]
    );

    await testQuery(
      "4. User Profile - Stats Query",
      `
      SELECT 
        COUNT(DISTINCT uss.skill_id) as total_skills,
        COUNT(DISTINCT uss.id) as total_signals,
        COALESCE(SUM(uss.weight), 0) as total_weight
      FROM user_skill_signals uss
      WHERE uss.user_id = ?
      `,
      [testUserId]
    );

    // ============================================
    // SKILLS ENDPOINT TESTS
    // ============================================
    console.log("\n🎯 SKILLS ENDPOINT QUERIES\n");

    // This is the problematic query with correlated subqueries
    await testQuery(
      "5. Skill Signals with Validation Counts (CORRELATED SUBQUERY ISSUE)",
      `
      SELECT 
        uss.id as signal_id,
        uss.skill_id,
        s.skill_name,
        (
          SELECT COUNT(*) FROM skill_validations sv 
          WHERE sv.signal_id = uss.id AND sv.validation_type = 'upvote'
        ) as upvote_count,
        (
          SELECT COUNT(*) FROM skill_validations sv 
          WHERE sv.signal_id = uss.id AND sv.validation_type = 'mentor_endorsement'
        ) as endorsement_count
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      ORDER BY uss.created_at DESC
      LIMIT 20
      `,
      [testUserId]
    );

    await testQuery(
      "6. Skill Summary with Time Windows",
      `
      SELECT s.id, s.skill_name,
        COUNT(uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        SUM(CASE WHEN uss.created_at >= NOW() - INTERVAL 7 DAY THEN uss.weight ELSE 0 END) as current_weight,
        SUM(CASE WHEN uss.created_at < NOW() - INTERVAL 7 DAY AND uss.created_at >= NOW() - INTERVAL 14 DAY THEN uss.weight ELSE 0 END) as previous_weight
      FROM user_skill_signals uss
      JOIN skills s ON uss.skill_id = s.id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name
      ORDER BY total_weight DESC
      `,
      [testUserId]
    );

    // ============================================
    // PROGRESS UPDATES TESTS
    // ============================================
    console.log("\n📝 PROGRESS UPDATES QUERIES\n");

    await testQuery(
      "7. Progress Updates with Tagged Skills (CORRELATED SUBQUERY)",
      `
      SELECT p.id, p.content, p.created_at, u.name as user_name,
        (SELECT JSON_ARRAYAGG(s.skill_name) FROM user_skill_signals uss JOIN skills s ON uss.skill_id = s.id WHERE uss.source_type = 'update' AND uss.source_id = p.id) AS tagged_skills
      FROM progress_updates p
      JOIN users u ON p.user_id = u.id
      WHERE p.project_id = ?
      ORDER BY p.created_at DESC
      LIMIT 20
      `,
      [testProjectId]
    );

    // ============================================
    // PROJECT TEAM MOMENTUM (MOST COMPLEX)
    // ============================================
    console.log("\n🚀 PROJECT TEAM MOMENTUM QUERIES (most complex)\n");

    // This query has repeated subqueries - a major inefficiency
    await testQuery(
      "8. Team Momentum - Overview (REPEATED SUBQUERIES)",
      `
      SELECT 
        (SELECT COUNT(*) FROM project_members WHERE project_id = ?) as team_size,
        (SELECT COUNT(*) FROM project_skills WHERE project_id = ?) as skills_tracked,
        (SELECT COUNT(*) FROM user_skill_signals 
         WHERE (source_type = 'project' AND source_id = ?)
            OR (source_type = 'update' AND source_id IN (SELECT id FROM progress_updates WHERE project_id = ?))
            OR (source_type = 'mentorship' AND source_id IN (SELECT id FROM mentorship_sessions WHERE project_id = ?))
        ) as total_signals
      `,
      [testProjectId, testProjectId, testProjectId, testProjectId, testProjectId]
    );

    await testQuery(
      "9. Team Momentum - Skill Distribution",
      `
      SELECT u.name, uss.user_id, s.skill_name, 
        COUNT(uss.id) as signal_count, SUM(uss.weight) as total_weight
      FROM user_skill_signals uss
      JOIN users u ON uss.user_id = u.id
      JOIN skills s ON uss.skill_id = s.id
      WHERE (uss.source_type = 'project' AND uss.source_id = ?)
         OR (uss.source_type = 'update' AND uss.source_id IN (SELECT id FROM progress_updates WHERE project_id = ?))
         OR (uss.source_type = 'mentorship' AND uss.source_id IN (SELECT id FROM mentorship_sessions WHERE project_id = ?))
      GROUP BY uss.user_id, uss.skill_id, u.name, s.skill_name
      ORDER BY total_weight DESC
      `,
      [testProjectId, testProjectId, testProjectId]
    );

    // ============================================
    // BASIC LIST QUERIES
    // ============================================
    console.log("\n📋 BASIC LIST QUERIES\n");

    await testQuery("10. Get All Users", "SELECT id, name, email, role FROM users");
    
    await testQuery("11. Get All Skills", "SELECT id, skill_name, category FROM skills ORDER BY skill_name");
    
    await testQuery(
      "12. Get Projects List",
      `
      SELECT p.id, p.title, p.status, p.owner_id,
        COUNT(DISTINCT pm.user_id) AS team_count,
        COUNT(DISTINCT ps.skill_id) AS skill_count
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id
      LEFT JOIN project_skills ps ON ps.project_id = p.id
      GROUP BY p.id, p.title, p.status, p.owner_id
      ORDER BY p.id ASC
      `
    );

    // ============================================
    // INDEX CHECK
    // ============================================
    await checkIndexes();
    
    // ============================================
    // SCHEMA CACHING CHECK
    // ============================================
    await checkSchemaCaching();

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(60));
    
    const passed = results.filter(r => r.status === "PASS").length;
    const warned = results.filter(r => r.status === "WARN").length;
    const failed = results.filter(r => r.status === "FAIL").length;
    
    console.log(`\nTotal: ${results.length} | ✅ Pass: ${passed} | ⚠️ Warn: ${warned} | ❌ Fail: ${failed}`);
    
    if (failed > 0) {
      console.log("\n⚠️ Queries requiring optimization:");
      results.filter(r => r.status === "FAIL").forEach(r => console.log(`  - ${r.name}`));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🏁 TESTS COMPLETE");
    console.log("=".repeat(60));

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    process.exit(0);
  }
}

runTests();
