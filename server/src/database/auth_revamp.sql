-- =============================================
-- Email verification tokens
-- =============================================
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
);

-- =============================================
-- Password reset tokens
-- =============================================
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
);

-- =============================================
-- Extend admin_invitations for special invites
-- =============================================
ALTER TABLE admin_invitations
  ADD COLUMN IF NOT EXISTS invite_type
    ENUM('admin_creation', 'special_access', 'password_reset_bypass')
    DEFAULT 'admin_creation',
  ADD COLUMN IF NOT EXISTS intended_role
    ENUM('intern', 'resident', 'alumni', 'admin')
    DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS verified_by_admin_id INT NULL,
  ADD COLUMN IF NOT EXISTS verification_note TEXT NULL,
  ADD FOREIGN KEY (verified_by_admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- =============================================
-- Track email verification status on users
-- =============================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL;

-- Mark all existing users as verified so current accounts are not broken
UPDATE users SET email_verified = TRUE, email_verified_at = NOW()
WHERE email_verified = FALSE OR email_verified IS NULL;
