import pool from "./src/config/db.js";

async function checkNotifications() {
  try {
    console.log("Checking last 5 notifications...");
    const [rows] = await pool.query(`
      SELECT id, user_id, type, title, is_read, created_at 
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    rows.forEach((row) => {
      console.log(
        `[${row.id}] User: ${row.user_id} | Type: ${row.type} | Read: ${row.is_read}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkNotifications();
