import pool from "./src/config/db.js";

async function fixSchema() {
  try {
    console.log("Modifying notifications table schema...");
    // Change ENUM to VARCHAR(50) to support 'project_completed' and future types
    await pool.query(
      "ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL",
    );
    console.log("Successfully changed 'type' column to VARCHAR(50)");

    // Verify changes
    const [rows] = await pool.query("DESCRIBE notifications");
    console.log("New Schema:");
    console.log(JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("Error modifying table:", err);
    process.exit(1);
  }
}

fixSchema();
