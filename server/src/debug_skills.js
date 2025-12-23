import pool from "./config/db.js";

async function checkData() {
  try {
    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Checking user_skill_signals...");
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM user_skill_signals");
    console.log("Total skill signals:", rows[0].count);

    if (rows[0].count > 0) {
      const [sample] = await pool.query("SELECT * FROM user_skill_signals LIMIT 5");
      console.log("Sample data:", sample);
    } else {
      console.log("No data found in user_skill_signals table.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkData();
