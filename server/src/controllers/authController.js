import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import {
  isAllowedEmail,
  normalizeCycle,
  generateToken,
  sendEmail,
  verificationEmailHtml,
  passwordResetEmailHtml,
  specialInviteEmailHtml,
} from '../services/authService.js';

// =============================================
// POST /api/auth/register
// Main registration — @icstars.org emails only
// =============================================
export const register = async (req, res) => {
  const { name, email, password, status, cycle_input } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !status) {
    return res.status(400).json({ error: 'Name, email, password, and status are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (!isAllowedEmail(email)) {
    return res.status(400).json({
      error: 'Registration requires an @icstars.org email address. If you no longer have access to your ic.stars email, contact an iCAA administrator for a special invitation.',
    });
  }

  if (!['intern', 'resident', 'alumni'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status selection' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );
  if (existing.length > 0) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const cycle = normalizeCycle(cycle_input) || null;
  let role = status;
  let internCycleId = null;

  if (status === 'intern') {
    if (!cycle) {
      return res.status(400).json({ error: 'Interns must enter their cycle number' });
    }
    const [activeCycles] = await pool.query(
      `SELECT id FROM intern_cycles WHERE status = 'active' AND cycle_name = ?`,
      [cycle]
    );
    if (activeCycles.length > 0) {
      internCycleId = activeCycles[0].id;
    }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users
       (name, email, password_hash, role, cycle, intern_cycle_id, join_date, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE)`,
      [name.trim(), normalizedEmail, passwordHash, role, cycle, internCycleId]
    );

    const userId = result.insertId;

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );

    await sendEmail({
      to: normalizedEmail,
      subject: 'Verify your SyncUp account',
      html: verificationEmailHtml(name.trim(), token),
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email to verify your account before logging in.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// =============================================
// POST /api/auth/verify-email
// =============================================
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, expires_at, used_at FROM email_verifications WHERE token = ?`,
      [token]
    );

    if (!rows.length) return res.status(404).json({ error: 'Invalid verification link' });

    const record = rows[0];

    if (record.used_at) {
      return res.status(410).json({ error: 'This link has already been used' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This verification link has expired. Request a new one.' });
    }

    await pool.query(
      `UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = ?`,
      [record.user_id]
    );

    await pool.query(
      `UPDATE email_verifications SET used_at = NOW() WHERE id = ?`,
      [record.id]
    );

    res.json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// =============================================
// POST /api/auth/resend-verification
// =============================================
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  const successResponse = {
    success: true,
    message: 'If that email exists and is unverified, a new link has been sent.',
  };

  if (!email) return res.json(successResponse);

  try {
    const [users] = await pool.query(
      'SELECT id, name, email_verified FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users.length || users[0].email_verified) return res.json(successResponse);

    const user = users[0];

    await pool.query(
      `UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [user.id, token, expiresAt]
    );

    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: 'Verify your SyncUp account',
      html: verificationEmailHtml(user.name, token),
    });

    res.json(successResponse);
  } catch (err) {
    console.error('Resend verification error:', err);
    res.json(successResponse);
  }
};

// =============================================
// POST /api/auth/forgot-password
// =============================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const successResponse = {
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!email) return res.json(successResponse);

  try {
    const [users] = await pool.query(
      'SELECT id, name FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users.length) return res.json(successResponse);

    const user = users[0];

    await pool.query(
      `UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, initiated_by) VALUES (?, ?, ?, 'self')`,
      [user.id, token, expiresAt]
    );

    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: 'Reset your SyncUp password',
      html: passwordResetEmailHtml(user.name, token),
    });

    res.json(successResponse);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.json(successResponse);
  }
};

// =============================================
// POST /api/auth/reset-password
// =============================================
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token = ?`,
      [token]
    );

    if (!rows.length) return res.status(404).json({ error: 'Invalid reset link' });

    const record = rows[0];

    if (record.used_at) {
      return res.status(410).json({ error: 'This reset link has already been used' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This reset link has expired. Request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, record.user_id]
    );

    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [record.id]
    );

    res.json({ success: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// =============================================
// POST /api/auth/admin-reset-password
// Admin initiates reset for user who can't access email
// =============================================
export const adminResetPassword = async (req, res) => {
  const { target_user_id, admin_id } = req.body;

  try {
    const [adminRows] = await pool.query(
      'SELECT is_admin FROM users WHERE id = ?', [admin_id]
    );
    if (!adminRows.length || adminRows[0].is_admin !== true) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [userRows] = await pool.query(
      'SELECT id, name, email FROM users WHERE id = ?', [target_user_id]
    );
    if (!userRows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    await pool.query(
      `UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at, initiated_by) VALUES (?, ?, ?, 'admin')`,
      [user.id, token, expiresAt]
    );

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    res.json({
      success: true,
      reset_link: resetLink,
      message: `Share this link with ${user.name}. It expires in 24 hours.`,
    });
  } catch (err) {
    console.error('Admin reset error:', err);
    res.status(500).json({ error: 'Failed to generate reset link' });
  }
};

// =============================================
// POST /api/auth/login
// Real login with email + password
// =============================================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, role, cycle, intern_cycle_id, has_commenced, email_verified, is_admin FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    let passwordValid = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      passwordValid = user.password_hash === password;
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cycle: user.cycle,
        intern_cycle_id: user.intern_cycle_id,
        has_commenced: user.has_commenced,
        email_verified: user.email_verified,
        is_admin: user.is_admin === 1 || user.is_admin === true
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};
