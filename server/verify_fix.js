import pool from "./src/config/db.js";

async function verifyFix() {
  try {
    const [rows] = await pool.query(
      "SHOW COLUMNS FROM notifications LIKE 'type'",
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error checking column:", err);
    process.exit(1);
  }
}

verifyFix();
