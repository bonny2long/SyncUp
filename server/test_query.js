import mysql from 'mysql2/promise';

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'N!gga840',
    database: 'syncup_local'
  });

  try {
    console.log("Adding is_active column...");
    await connection.query(`ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;`);
    
    const [rows] = await connection.query(`
      SELECT 
       id, name, email, role, join_date, bio, profile_pic, is_active, has_commenced,
       cycle, email_notifications, notify_join_requests, notify_mentions, notify_session_reminders,
       notify_project_updates, notify_weekly_summary, profile_visibility, show_email, show_projects,
       show_skills, accept_mentorship, auto_accept_teammates
      FROM users
      ORDER BY name ASC
    `);
    console.log(rows.length, "users fetched. Success!");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
fixDb();
