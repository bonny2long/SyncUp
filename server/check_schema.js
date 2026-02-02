import pool from "./src/config/db.js";

async function checkSchema() {
  try {
    const [rows] = await pool.query("DESCRIBE notifications");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error describing table:", err);
    process.exit(1);
  }
}

checkSchema();
