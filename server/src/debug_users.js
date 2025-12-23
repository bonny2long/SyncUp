import pool from "./config/db.js";

async function checkUsers() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Checking users...");
    const [users] = await pool.query("SELECT id, name, email FROM users");
    console.log("Users found:", users);

    console.log("\nChecking data for User 1:");
    const [user1Data] = await pool.query("SELECT COUNT(*) as count FROM user_skill_signals WHERE user_id = 1");
    console.log("User 1 skill signals:", user1Data[0].count);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkUsers();
