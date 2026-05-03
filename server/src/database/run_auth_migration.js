import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('C:\\Users\\BonnyMakaniankhondo\\Documents\\GitHub\\SyncUp\\server\\.env') });
import pool from '../config/db.js';

async function runMigration() {
  try {
    console.log('Running auth_revamp migration...');

    // Create email_verifications table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_verifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          token VARCHAR(128) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_token (token),
          INDEX idx_user (user_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('✓ Created email_verifications table');
    } catch (err) {
      console.error('✗ email_verifications:', err.message);
    }

    // Create password_resets table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          token VARCHAR(128) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP NULL,
          initiated_by ENUM('self', 'admin') DEFAULT 'self',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_token (token),
          INDEX idx_user (user_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      console.log('✓ Created password_resets table');
    } catch (err) {
      console.error('✗ password_resets:', err.message);
    }

    // Add columns to admin_invitations using information_schema check
    const [invitationColumns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_invitations'
    `, [process.env.DB_NAME]);

    const existingCols = invitationColumns.map(c => c.COLUMN_NAME);

    if (!existingCols.includes('invite_type')) {
      try {
        await pool.query(`ALTER TABLE admin_invitations ADD COLUMN invite_type ENUM('admin_creation', 'special_access', 'password_reset_bypass') DEFAULT 'admin_creation'`);
        console.log('✓ Added invite_type column to admin_invitations');
      } catch (err) {
        console.error('✗ invite_type:', err.message);
      }
    } else {
      console.log('  Skipped invite_type (exists)');
    }

    if (!existingCols.includes('intended_role')) {
      try {
        await pool.query(`ALTER TABLE admin_invitations ADD COLUMN intended_role ENUM('intern', 'resident', 'alumni', 'admin') DEFAULT 'admin'`);
        console.log('✓ Added intended_role column to admin_invitations');
      } catch (err) {
        console.error('✗ intended_role:', err.message);
      }
    } else {
      console.log('  Skipped intended_role (exists)');
    }

    if (!existingCols.includes('verified_by_admin_id')) {
      try {
        await pool.query(`ALTER TABLE admin_invitations ADD COLUMN verified_by_admin_id INT NULL`);
        await pool.query(`ALTER TABLE admin_invitations ADD FOREIGN KEY (verified_by_admin_id) REFERENCES users(id) ON DELETE SET NULL`);
        console.log('✓ Added verified_by_admin_id column to admin_invitations');
      } catch (err) {
        console.error('✗ verified_by_admin_id:', err.message);
      }
    } else {
      console.log('  Skipped verified_by_admin_id (exists)');
    }

    if (!existingCols.includes('verification_note')) {
      try {
        await pool.query(`ALTER TABLE admin_invitations ADD COLUMN verification_note TEXT NULL`);
        console.log('✓ Added verification_note column to admin_invitations');
      } catch (err) {
        console.error('✗ verification_note:', err.message);
      }
    } else {
      console.log('  Skipped verification_note (exists)');
    }

    // Add columns to users table
    const [userColumns] = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);

    const existingUserCols = userColumns.map(c => c.COLUMN_NAME);

    if (!existingUserCols.includes('email_verified')) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE`);
        console.log('✓ Added email_verified column to users');
      } catch (err) {
        console.error('✗ email_verified:', err.message);
      }
    } else {
      console.log('  Skipped email_verified (exists)');
    }

    if (!existingUserCols.includes('email_verified_at')) {
      try {
        await pool.query(`ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL`);
        console.log('✓ Added email_verified_at column to users');
      } catch (err) {
        console.error('✗ email_verified_at:', err.message);
      }
    } else {
      console.log('  Skipped email_verified_at (exists)');
    }

    // Mark all existing users as verified
    try {
      const [result] = await pool.query(`UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE email_verified = FALSE OR email_verified IS NULL`);
      console.log(`✓ Marked existing users as verified (${result.affectedRows} rows)`);
    } catch (err) {
      console.error('✗ Update existing users:', err.message);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
