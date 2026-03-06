// server/src/scripts/add_indexes.js
// Add missing performance indexes
// Run with: node src/scripts/add_indexes.js

import pool from "../config/db.js";

const indexes = [
  { name: "idx_signals_user_created", sql: "CREATE INDEX idx_signals_user_created ON user_skill_signals(user_id, created_at DESC)" },
  { name: "idx_signals_user_skill", sql: "CREATE INDEX idx_signals_user_skill ON user_skill_signals(user_id, skill_id)" },
  { name: "idx_pm_project", sql: "CREATE INDEX idx_pm_project ON project_members(project_id)" },
  { name: "idx_sessions_mentor_date", sql: "CREATE INDEX idx_sessions_mentor_date ON mentorship_sessions(mentor_id, session_date)" },
  { name: "idx_progress_project_date", sql: "CREATE INDEX idx_progress_project_date ON progress_updates(project_id, created_at)" },
  { name: "idx_skills_name", sql: "CREATE INDEX idx_skills_name ON skills(skill_name)" },
];

async function addIndexes() {
  console.log("🔧 Adding indexes...\n");
  
  for (const idx of indexes) {
    try {
      await pool.query(idx.sql);
      console.log(`✅ Created: ${idx.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_KEYNAME") {
        console.log(`⏭️  Already exists: ${idx.name}`);
      } else {
        console.log(`❌ Failed: ${idx.name} - ${err.message}`);
      }
    }
  }
  
  console.log("\n🏁 Done!");
  process.exit(0);
}

addIndexes();
