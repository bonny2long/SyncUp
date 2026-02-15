import pool from "./src/config/db.js";

async function createMentorshipSessionSkillsTable() {
  try {
    console.log("Creating mentorship_session_skills table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentorship_session_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        skill_id INT NOT NULL,
        skill_name VARCHAR(100),
        FOREIGN KEY (session_id) REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session_skill (session_id, skill_id),
        INDEX idx_session_id (session_id),
        INDEX idx_skill_id (skill_id)
      )
    `);
    console.log("Successfully created mentorship_session_skills table");

    const [rows] = await pool.query("DESCRIBE mentorship_session_skills");
    console.log("Table Schema:");
    console.log(JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Error creating table:", err);
    process.exit(1);
  }
}

createMentorshipSessionSkillsTable();
