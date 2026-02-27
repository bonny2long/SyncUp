import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log("Connected to MySQL, running migration...");

    // Add profile_pic column to users table
    await connection.query(`
      ALTER TABLE users ADD COLUMN profile_pic VARCHAR(500) NULL
    `);
    console.log("✓ Added profile_pic column to users table");

    // Create profile_pictures table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profile_pictures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        file_data LONGBLOB NOT NULL,
        mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
        file_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✓ Created profile_pictures table");

    // Create index
    await connection.query(`
      CREATE INDEX idx_profile_pictures_user_id ON profile_pictures(user_id)
    `);
    console.log("✓ Created index on profile_pictures.user_id");

    console.log("\n✅ Migration completed successfully!");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("✓ profile_pic column already exists, skipping...");
    } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log("✓ profile_pictures table already exists, skipping...");
    } else {
      console.error("Migration error:", err.message);
    }
  } finally {
    await connection.end();
  }
}

runMigration();
