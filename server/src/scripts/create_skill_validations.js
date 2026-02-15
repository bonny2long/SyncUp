import pool from "../config/db.js";

async function createSkillValidationsTable() {
  try {
    console.log("Creating skill_validations table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skill_validations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        signal_id INT NOT NULL,
        validator_id INT NOT NULL,
        validation_type ENUM('upvote', 'mentor_endorsement') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_validation (signal_id, validator_id, validation_type),
        FOREIGN KEY (signal_id) REFERENCES user_skill_signals(id) ON DELETE CASCADE,
        FOREIGN KEY (validator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_signal_id (signal_id),
        INDEX idx_validator_id (validator_id)
      )
    `);
    
    console.log("✅ skill_validations table created successfully!");
  } catch (err) {
    console.error("Error creating skill_validations table:", err.message);
    throw err;
  }
  process.exit(0);
}

createSkillValidationsTable();
