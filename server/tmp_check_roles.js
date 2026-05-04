import pool from './src/config/db.js';
try {
  const [rows] = await pool.query("SELECT id, name, role, is_admin FROM users WHERE role IN ('admin', 'mentor')");
  console.log(JSON.stringify(rows, null, 2));
} catch (err) {
  console.error(err);
} finally {
  process.exit(0);
}
