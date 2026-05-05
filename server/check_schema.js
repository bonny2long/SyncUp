import pool from './src/config/db.js';
try {
  const [rows] = await pool.query("DESCRIBE user_presence");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
