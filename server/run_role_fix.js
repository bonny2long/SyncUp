import pool from './src/config/db.js';

async function runMigration() {
  try {
    console.log('Starting role migration...');
    
    // 1. Add is_admin column
    await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
    console.log('✓ Added is_admin column');
    
    // 2. Migrate existing admin users to alumni + is_admin
    const [adminResult] = await pool.query(
      "UPDATE users SET role = 'alumni', is_admin = TRUE WHERE role = 'admin'"
    );
    console.log(`✓ Migrated ${adminResult.affectedRows} admin users to alumni + is_admin`);
    
    // 3. Migrate existing mentor users to alumni
    const [mentorResult] = await pool.query(
      "UPDATE users SET role = 'alumni' WHERE role = 'mentor'"
    );
    console.log(`✓ Migrated ${mentorResult.affectedRows} mentor users to alumni`);
    
    // 4. Update role enum to remove admin and mentor
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('intern', 'resident', 'alumni') DEFAULT 'intern'");
    console.log('✓ Updated role enum');
    
    // 5. Verify
    const [users] = await pool.query('SELECT id, name, role, is_admin FROM users');
    console.log('\nCurrent users:');
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
