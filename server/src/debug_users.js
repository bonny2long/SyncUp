import pool from "./config/db.js";

async function checkUsers() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Checking users...");
    const [users] = await pool.query("SELECT * FROM users");
    console.log("Users found:", JSON.stringify(users, null, 2));

    const alex = users.find(
      (u) => u.name && u.name.toLowerCase().includes("alex"),
    );
    if (alex) {
      console.log(`Found Alex (ID: ${alex.id}), restoring role to 'intern'...`);
      await pool.query("UPDATE users SET role = 'intern' WHERE id = ?", [
        alex.id,
      ]);
      console.log("Role restored.");
    } else {
      console.log("Alex not found by name.");
    }

    console.log("\nChecking data for User 1:");
    const [user1Data] = await pool.query(
      "SELECT COUNT(*) as count FROM user_skill_signals WHERE user_id = 1",
    );
    console.log("User 1 skill signals:", user1Data[0].count);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkUsers();
