import pool from "./src/config/db.js";
import fs from "fs";

async function checkDb() {
  try {
    const results = {};
    const [projects] = await pool.query("SELECT id, title FROM projects");
    results.projects = projects;

    const [users] = await pool.query("SELECT id, name FROM users");
    results.users = users;

    const [updates] = await pool.query(
      "SELECT COUNT(*) as count FROM progress_updates",
    );
    results.update_count = updates[0].count;

    const [signals] = await pool.query(
      "SELECT COUNT(*) as count FROM user_skill_signals",
    );
    results.signal_count = signals[0].count;

    fs.writeFileSync("db_check_results.json", JSON.stringify(results, null, 2));
    console.log("Results written to db_check_results.json");
    process.exit(0);
  } catch (err) {
    console.error("Error querying DB:", err);
    process.exit(1);
  }
}

checkDb();
