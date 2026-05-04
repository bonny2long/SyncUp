import pool from './src/config/db.js';

async function check() {
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM users LIKE 'digest_mode'");
    if (rows.length > 0) {
      console.log('COLUMN EXISTS:', JSON.stringify(rows[0]));
    } else {
      console.log('COLUMN NOT FOUND - need to add it');
    }
    
    // Also check notification preference columns
    const prefs = ['notify_channel_messages', 'notify_dm_messages', 'notify_opportunities', 'notify_events', 'notify_encouragements'];
    for (const col of prefs) {
      const [r] = await pool.query(`SHOW COLUMNS FROM users LIKE '${col}'`);
      console.log(col, r.length > 0 ? 'EXISTS' : 'MISSING');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

check();
