# ICAA / SyncUp Hybrid Final Plan

**Created:** 2026-05-03  
**Purpose:** Combined roadmap integrating existing ICAA phases + co-worker's Auth Revamp + actual codebase state.  
**Branding note:** All visual/brand changes deferred to final phase. Development first. Email templates use ICAA red `#b9123f` as specified by co-worker. All UI stays current Indigo `#4c5fd5` until brand phase.

---

## Current Codebase Reality Check

Gathered from live code exploration (2026-05-03):

### What Exists
- Phases 1–7 largely implemented (Mentor Credibility, Public Profiles, Member Directory, Governance Badges, Opportunity Board, Encouragement + Cycles, Polls)
- Phase 8 Smart Notifications: audit complete, foundation in progress
- Intern cycles, commencement flow, ICAA HQ, project discussions all working
- Role-based space separation: Intern Lobby vs SyncChat
- User roles: `intern`, `mentor`, `resident`, `alumni`, `admin`

### Critical Gaps (All Fixed ✅)
| Issue | Status | Severity |
|-------|--------|----------|
| Passwords stored in **plaintext** | ✅ FIXED - bcrypt implemented | 🔴 Was Critical |
| No real login — mock user selection dropdown | ✅ FIXED - real login with email/password | 🔴 Was Critical |
| No email verification | ✅ FIXED - `email_verifications` table + flow | 🔴 Was Critical |
| No password reset | ✅ FIXED - `password_resets` table + flow | 🔴 Was Critical |
| No `authController.js` | ✅ FIXED - file created with all auth functions | 🔴 Was Critical |
| `admin_invitations` table missing columns | ✅ FIXED - migration applied | 🟡 Was Medium |
| `users.email_verified` column missing | ✅ FIXED - column exists | 🟡 Was Medium |
| `bcrypt` not installed | ✅ FIXED - installed | 🔴 Was Critical |
| `nodemailer` not installed | ✅ FIXED - installed | 🟡 Was Medium |

### Current Color Scheme (Brand Phase Complete ✅)
- Primary: `#b9123f` (iCAA Red) ✅
- Secondary: `#383838` (iCAA Gray) ✅
- Accent: `#282827` (iCAA Black) ✅
- Vibrant Red: `#f83030` (Events/Promotions) ✅
- iCAA White: `#fdfdfd` ✅
- Font: League Spartan ✅

---

## Phase Sequence (Updated)

```
Phase 1:  Mentor Credibility          ✅ Done
Phase 2:  Public Profiles             ✅ Done
Phase 3:  Member Directory            ✅ Done
Phase 4:  Governance Badges           ✅ Done
Phase 5:  Opportunity Board           ✅ Done
Phase 6:  Encouragement + Cycles      ✅ Done
Phase 7:  Polls on Announcements      ✅ Done
Phase 8:  Smart Notifications         ✅ Done
─── NEW ──────────────────────────────────
Phase 9:  Auth Revamp (CRITICAL)      ✅ Done
Phase 9A: League Spartan Font          ✅ Done
Phase 9B:  iCAA Color System           ✅ Done
Phase 9C:  Sidebar iCAA Identity       ✅ Done
Phase 9D:  RoleBadge iCAA Colors      ✅ Done
Phase 9E:  GovernanceBadge iCAA       ✅ Done
Phase 9F:  Event Cards Vibrant Red     ✅ Done
Phase 9G:  Button System Audit         ✅ Done
Phase 9H:  Login/Register Branded     ✅ Done
Phase 9I:  Copy Audit (iCAA Terms)    ✅ Done
Phase 9J:  HQ Visual Polish          ✅ Done
─── NEXT ────────────────────────────────
Phase 10: Production Hardening        🔨 In Progress
  - Access Control Verification
  - Idempotent Migrations
  - Seed Data
  - Cascade Delete Verification
```
Phase 1:  Mentor Credibility          ✅ Done
Phase 2:  Public Profiles             ✅ Done
Phase 3:  Member Directory            ✅ Done
Phase 4:  Governance Badges           ✅ Done
Phase 5:  Opportunity Board           ✅ Done
Phase 6:  Encouragement + Cycles      ✅ Mostly Done
Phase 7:  Polls on Announcements      ✅ Done
Phase 8:  Smart Notifications         🔄 In Progress
─── NEW ──────────────────────────────────────────
Phase 9:  Auth Revamp (CRITICAL)      🆕 Build Next
─── EXISTING (renumbered) ───────────────────────
Phase 10: Brand + Badge Visual System 🔜 Deferred
Phase 11: Production Hardening        🔜 Deferred
```

---

## Phase 9: Auth Revamp (NEW — Build Immediately)

**Why now:** App cannot go to production with plaintext passwords and mock login.

**Co-worker plan integrated with codebase reality. Build order matters — follow exactly.**

### 9A — Database Migration ✅ COMPLETED

**File:** `server/src/database/auth_revamp.sql` — **EXECUTED**

**Results:**
- ✅ `email_verifications` table created
- ✅ `password_resets` table created  
- ✅ `admin_invitations` extended with `invite_type`, `intended_role`, `verified_by_admin_id`, `verification_note`
- ✅ `users` table has `email_verified` + `email_verified_at` columns
- ✅ All 19 existing users marked as verified

**No action needed — already done.**

---

### 9B — Install Dependencies

```bash
cd server
npm install bcrypt nodemailer
```

`bcrypt` is critical — current passwords are plaintext. `nodemailer` needed for email verification and password reset.

---

### 9C — Backend: Auth Service

**File:** `server/src/services/authService.js`

Handles token generation, email sending, domain validation. Foundation for all auth flows.

```js
import crypto from 'crypto';
import pool from '../config/db.js';

// =============================================
// Domain validation — @icstars.org only for self-registration
// =============================================
const ALLOWED_DOMAIN = 'icstars.org';

export function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === ALLOWED_DOMAIN;
}

// =============================================
// Cycle normalization — mirrors cyclesController.js
// =============================================
export function normalizeCycle(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return null;
  if (raw.startsWith('C-')) return raw;
  if (/^\d+$/.test(raw)) return `C-${raw}`;
  if (/^C\d+$/.test(raw)) return `C-${raw.slice(1)}`;
  return raw;
}

// =============================================
// Token generation
// =============================================
export function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// =============================================
// Email sending — falls back to console in dev
// =============================================
export async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log(`[EMAIL - DEV MODE]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html.replace(/<[^>]+>/g, '')}`);
    return;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"SyncUp | iCAA" <noreply@icstars.org>`,
    to,
    subject,
    html,
  });
}

// =============================================
// Email templates — ICAA red only in emails
// =============================================
const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export function verificationEmailHtml(name, token) {
  const link = `${BASE_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #b9123f;">Welcome to SyncUp, ${name}</h2>
      <p>You're almost in. Confirm your email address to activate your account.</p>
      <a href="${link}"
         style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Verify My Email
      </a>
      <p style="color:#666;font-size:12px;margin-top:24px;">
        This link expires in 24 hours. If you did not create a SyncUp account, ignore this email.
      </p>
    </div>
  `;
}

export function passwordResetEmailHtml(name, token) {
  const link = `${BASE_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #b9123f;">Reset Your Password</h2>
      <p>Hi ${name}, someone requested a password reset for your SyncUp account.</p>
      <a href="${link}"
         style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Reset My Password
      </a>
      <p style="color:#666;font-size:12px;margin-top:24px;">
        This link expires in 1 hour. If you did not request this, your account is safe — ignore this email.
      </p>
    </div>
  `;
}

export function specialInviteEmailHtml(name, token, note) {
  const link = `${BASE_URL}/register?token=${token}`;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #b9123f;">You have been invited to SyncUp</h2>
      <p>Hi ${name || 'there'},</p>
      <p>An iCAA administrator has verified your membership and invited you to join the iCAA community platform.</p>
      ${note ? `<p style="font-style:italic;color:#555;">"${note}"</p>` : ''}
      <a href="${link}"
         style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Create My Account
      </a>
      <p style="color:#666;font-size:12px;margin-top:24px;">
        This link expires in 7 days.
      </p>
    </div>
  `;
}
```

---

### 9D — Backend: Auth Controller (Registration + Email Verification)

**File:** `server/src/controllers/authController.js` (NEW FILE)

```js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import {
  isAllowedEmail,
  normalizeCycle,
  generateToken,
  sendEmail,
  verificationEmailHtml,
} from '../services/authService.js';

// =============================================
// POST /api/auth/register
// Main registration — @icstars.org emails only
// =============================================
export const register = async (req, res) => {
  const { name, email, password, status, cycle_input } = req.body;
  // status: 'intern' | 'resident' | 'alumni'

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

  // Check for existing account
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
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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
      'SELECT role FROM users WHERE id = ?', [admin_id]
    );
    if (!adminRows.length || adminRows[0].role !== 'admin') {
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
```

---

### 9F — Backend: Real Login Endpoint

**File:** `server/src/controllers/authController.js` — ADD at bottom of file:

```js
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
      'SELECT id, name, email, password_hash, role, cycle, intern_cycle_id, has_commenced, email_verified FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password — handle both bcrypt and legacy plaintext
    let passwordValid = false;
    if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
      // Bcrypt hashed password
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy plaintext — direct comparison
      passwordValid = user.password_hash === password;
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check email verification
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // Return user object
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
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};
```

---

### 9G — Backend: Auth Routes + Server Registration

**File:** `server/src/routes/authRoutes.js` (NEW FILE)

```js
import express from 'express';
import {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  adminResetPassword,
  login,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/admin-reset-password', adminResetPassword);
router.post('/login', login);

export default router;
```

**Register in `server.js`:**

Add these lines near the other route registrations:

```js
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
```

Also add special invitation route to `adminRoutes.js`:

```js
import { createSpecialInvitation } from '../controllers/invitationController.js';
router.post('/invitations/special', createSpecialInvitation);
```

---

### 9H — Frontend: API Functions

**File:** `client/src/utils/api.js` — ADD these functions at the bottom:

```js
// =============================================
// Auth API functions
// =============================================
export const registerAccount = async (data) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Registration failed');
  return result;
};

export const loginAccount = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Login failed');
  return result;
};

export const resendVerificationEmail = async (email) => {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const verifyEmailToken = async (token) => {
  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Verification failed');
  return result;
};

export const forgotPasswordRequest = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

export const resetPasswordWithToken = async (token, password) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Reset failed');
  return result;
};
```

---

### 9I — Frontend: Rewrite Register.jsx

**File:** `client/src/pages/Register.jsx` — REPLACE entirely

The new page supports two modes:
- `/register` — normal @icstars.org registration
- `/register?token=...` — special invitation registration

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { registerAccount, validateInvitation } from '../utils/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [mode, setMode] = useState('validating');
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    status: '',
    cycle_input: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const statusOptions = [
    { value: 'intern', label: 'Intern' },
    { value: 'resident', label: 'Resident' },
    { value: 'alumni', label: 'Alumni' },
  ];

  useEffect(() => {
    if (!token) {
      setMode('normal');
      return;
    }
    validateInvitation(token)
      .then(data => {
        if (data.valid) {
          setInvitation(data);
          setForm(f => ({ ...f, email: data.email || '', status: data.intended_role || '' }));
          setMode('special');
        } else {
          setMode('invalid');
        }
      })
      .catch(() => setMode('invalid'));
  }, [token]);

  const formatCycle = (value) => {
    const raw = value.trim().toUpperCase();
    if (!raw) return '';
    if (raw.startsWith('C-')) return raw;
    if (/^\d+$/.test(raw)) return `C-${raw}`;
    if (/^C\d+$/.test(raw)) return `C-${raw.slice(1)}`;
    return raw;
  };

  const handleCycleChange = (e) => {
    const formatted = formatCycle(e.target.value);
    setForm(f => ({ ...f, cycle_input: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.password) {
      setError('All fields are required.');
      return;
    }

    if (mode === 'normal') {
      if (!isAllowedEmail(form.email)) {
        setError('Registration requires an @icstars.org email address.');
        return;
      }
      if (!form.status) {
        setError('Please select your status.');
        return;
      }
      if (form.status === 'intern' && !form.cycle_input) {
        setError('Interns must enter their cycle number.');
        return;
      }
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'special' && token) {
        await registerWithInvitation(token, form.name, form.password);
      } else {
        await registerAccount({
          name: form.name,
          email: form.email,
          password: form.password,
          status: form.status,
          cycle_input: form.cycle_input,
        });
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-text-secondary mb-4">
            We sent a verification link to <strong>{form.email}</strong>.
            You'll be able to log in once you verify.
          </p>
          <button
            onClick={() => resendVerificationEmail(form.email)}
            className="btn btn-outline text-sm"
          >
            Resend verification email
          </button>
          <div className="mt-4">
            <a href="/login" className="text-sm text-primary hover:underline">
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'invalid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Invalid or Expired Link</h2>
          <p className="text-text-secondary mb-4">
            This invitation link is invalid or has expired.
          </p>
          <a href="/register" className="btn btn-primary">Go to Registration</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Account</h1>
          <p className="text-text-secondary mt-2">
            {mode === 'special'
              ? 'Complete your invitation to join SyncUp'
              : 'Join the iCAA community on SyncUp'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="input w-full"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>

          {mode === 'normal' && (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input w-full"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@icstars.org"
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                Requires an @icstars.org email address.
              </p>
            </div>
          )}

          {mode === 'normal' && (
            <div>
              <label className="block text-sm font-medium mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                      form.status === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Cycle {mode === 'normal' && form.status === 'intern' ? '(required)' : '(optional)'}
            </label>
            <input
              type="text"
              className="input w-full"
              value={form.cycle_input}
              onChange={handleCycleChange}
              placeholder="e.g. 58 or C-58"
            />
            <p className="text-xs text-text-secondary mt-1">
              Your ic.stars cycle. Will be formatted as C-XX.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="input w-full"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="input w-full"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">Log in</a>
        </p>

        {mode === 'normal' && (
          <p className="text-center text-xs text-text-secondary mt-4">
            Lost access to your @icstars.org email?{' '}
            <a href="/login" className="text-primary hover:underline">Contact an iCAA administrator</a>
          </p>
        )}
      </div>
    </div>
  );
}

function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === 'icstars.org';
}
```

---

### 9J — Frontend: New Pages

#### VerifyEmail.jsx
**File:** `client/src/pages/VerifyEmail.jsx` (NEW FILE)

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailToken } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No verification token provided.');
      return;
    }

    verifyEmailToken(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setError(err.message);
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        {status === 'verifying' && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-secondary">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-text-secondary mb-6">Your email has been verified. You can now log in.</p>
            <a href="/login" className="btn btn-primary">Log In</a>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <a href="/register" className="btn btn-primary">Back to Registration</a>
          </>
        )}
      </div>
    </div>
  );
}
```

#### ForgotPassword.jsx
**File:** `client/src/pages/ForgotPassword.jsx` (NEW FILE)

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordRequest } from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-text-secondary mb-6">
            If an account with that email exists, we've sent a reset link.
          </p>
          <a href="/login" className="btn btn-primary">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-text-secondary mt-2">Enter your email to receive a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@icstars.org"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          <a href="/login" className="text-primary hover:underline">Back to login</a>
        </p>
      </div>
    </div>
  );
}
```

#### ResetPassword.jsx
**File:** `client/src/pages/ResetPassword.jsx` (NEW FILE)

```jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordWithToken } from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No reset token provided.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Updated</h2>
          <p className="text-text-secondary mb-6">Your password has been set. You can now log in.</p>
          <a href="/login" className="btn btn-primary">Log In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Set New Password</h1>
          <p className="text-text-secondary mt-2">Enter your new password below.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="input w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="input w-full"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              minLength={8}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### 9K — Frontend: Rewrite Login.jsx (Keep Dev Mock + Add Real Login)

**File:** `client/src/pages/Login.jsx` — REPLACE entirely

This version has BOTH real login AND dev mock dropdown (toggled via "Dev Mode" checkbox):

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAccount, fetchUsers } from '../utils/api';
import { useUser } from '../context/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  // Dev mode state
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem('devMode') === 'true' || false;
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [devError, setDevError] = useState('');

  // Real login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);

  // Load users for dev mode
  useEffect(() => {
    if (devMode) {
      setLoadingUsers(true);
      fetchUsers()
        .then(data => {
          setUsers(data.sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (a.role !== 'admin' && b.role === 'admin') return 1;
            return a.name.localeCompare(b.name);
          }));
        })
        .catch(() => setDevError('Failed to load users'))
        .finally(() => setLoadingUsers(false));
    }
  }, [devMode]);

  const handleDevLogin = () => {
    const selected = users.find(u => u.id === parseInt(selectedUserId));
    if (selected) {
      login(selected);
      if (selected.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const handleRealLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setLoading(true);

    try {
      const data = await loginAccount(email, password);
      login(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      if (msg.includes('EMAIL_NOT_VERIFIED')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(email);
      setError('');
      setShowResend(false);
      alert('Verification email resent. Check your inbox.');
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Log In to SyncUp</h1>
          <p className="text-text-secondary mt-2">
            {devMode ? 'Dev Mode — Quick user selection' : 'Enter your credentials to access your account.'}
          </p>
        </div>

        {/* Dev Mode Toggle */}
        <div className="flex items-center justify-between mb-6 p-3 bg-surface-highlight rounded-lg">
          <span className="text-sm font-medium">Dev Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => {
                setDevMode(e.target.checked);
                localStorage.setItem('devMode', e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Dev Mode Login */}
        {devMode ? (
          <div className="space-y-4">
            {devError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{devError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Select User</label>
              <select
                className="input w-full"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">-- Choose a user --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}{u.cycle ? ` - ${u.cycle}` : ''})
                  </option>
                ))}
              </select>
              {loadingUsers && <p className="text-xs text-text-secondary mt-1">Loading users...</p>}
            </div>

            <button
              onClick={handleDevLogin}
              disabled={!selectedUserId}
              className="btn btn-primary w-full"
            >
              Continue as Selected User
            </button>

            {/* Debug button */}
            <button
              onClick={() => {
                throw new Error('Test error from Login page');
              }}
              className="btn btn-ghost w-full text-xs"
            >
              Trigger Test Error
            </button>
          </div>
        ) : (
          /* Real Login Form */
          <div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                {showResend && (
                  <button
                    onClick={handleResend}
                    className="text-sm text-primary hover:underline mt-1 block"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleRealLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@icstars.org"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input w-full"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-text-secondary">
                <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
              </p>
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <a href="/register" className="text-primary hover:underline">Register</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 9L — Frontend: Update App.jsx Routes

**File:** `client/src/App.jsx` — ADD these imports and routes:

Add to imports section:
```jsx
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
```

Add these routes inside `<Routes>` (no auth protection needed):
```jsx
<Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

### 9M — Admin Dashboard Updates

**File:** `client/src/pages/AdminDashboard.jsx` — ADD these capabilities:

#### M1: Email Verification Status Column in Users Table

In the users table, add after the Status column:

```jsx
<td className="p-3">
  <span className={`px-2 py-0.5 rounded text-xs ${
    user.email_verified
      ? 'bg-green-500/20 text-green-400'
      : 'bg-yellow-500/20 text-yellow-400'
  }`}>
    {user.email_verified ? 'Verified' : 'Unverified'}
  </span>
</td>
```

#### M2: Password Reset Button in Edit User Modal

```jsx
<button
  onClick={async () => {
    try {
      const result = await fetch(`${API_BASE}/auth/admin-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: selectedUser.id, admin_id: user.id }),
      });
      const data = await result.json();
      if (data.reset_link) {
        navigator.clipboard.writeText(data.reset_link);
        alert(`Reset link copied to clipboard. Share with ${selectedUser.name}. Valid 24h.`);
      }
    } catch {
      alert('Failed to generate reset link');
    }
  }}
  className="flex items-center gap-2 px-3 py-2 bg-surface-highlight text-text-secondary rounded-lg text-sm hover:bg-border transition"
>
  Generate Password Reset Link
</button>
```

#### M3: Special Invitation Panel + State

Add state:
```jsx
const [specialInvite, setSpecialInvite] = useState({ email: '', role: 'alumni', note: '' });
```

Add handler:
```jsx
const handleSpecialInvite = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/invitations/special`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: specialInvite.email,
        intended_role: specialInvite.role,
        verification_note: specialInvite.note,
        admin_id: user.id,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Special invitation sent!');
      setSpecialInvite({ email: '', role: 'alumni', note: '' });
    }
  } catch {
    alert('Failed to send invitation');
  }
};
```

Add UI in Invitations tab:
```jsx
{/* Special Access Invitation Section */}
<div className="mt-8 border-t border-border pt-6">
  <h3 className="text-lg font-semibold mb-4">Special Access Invitation</h3>
  <p className="text-sm text-text-secondary mb-4">
    For verified ic.stars members who cannot access their @icstars.org email.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <input
      type="email"
      className="input"
      placeholder="Email address"
      value={specialInvite.email}
      onChange={e => setSpecialInvite(s => ({ ...s, email: e.target.value }))}
    />
    <select
      className="input"
      value={specialInvite.role}
      onChange={e => setSpecialInvite(s => ({ ...s, role: e.target.value }))}
    >
      <option value="alumni">Alumni</option>
      <option value="resident">Resident</option>
      <option value="intern">Intern</option>
      <option value="admin">Admin</option>
    </select>
  </div>
  <textarea
    className="input w-full mt-4"
    rows={3}
    placeholder="Verification note (required): Why does this person get special access?"
    value={specialInvite.note}
    onChange={e => setSpecialInvite(s => ({ ...s, note: e.target.value }))}
  />
  <button
    onClick={handleSpecialInvite}
    className="btn btn-secondary mt-4"
  >
    Send Special Invitation
  </button>
</div>
```

---

### 9N — Environment Variables

**Add to `server/.env`:**

```env
# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@icstars.org
EMAIL_PASS=your-email-password
EMAIL_FROM="SyncUp | iCAA" <noreply@icstars.org>

# Frontend URL (for email links)
CLIENT_URL=http://localhost:5173
```

**Create `server/.env.example` (without real credentials):**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=syncup_local
PORT=5000

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@icstars.org
EMAIL_PASS=your-email-password
EMAIL_FROM="SyncUp | iCAA" <noreply@icstars.org>

# Frontend URL
CLIENT_URL=http://localhost:5173
```

---

## Implementation Order (Exact Sequence)

```
1.  Run auth_revamp.sql migration (9A)
2.  npm install bcrypt nodemailer (9B)
3.  Create server/src/services/authService.js (9C)
4.  Create server/src/controllers/authController.js (9D + 9F)
5.  Update server/src/controllers/invitationController.js — add special invites + fix password hashing (9E)
6.  Create server/src/routes/authRoutes.js (9G)
7.  Register authRoutes in server.js (9G)
8.  Add auth routes to adminRoutes.js (9G)
9.  Add API functions to client/src/utils/api.js (9H)
10. Rewrite client/src/pages/Register.jsx (9I)
11. Create client/src/pages/VerifyEmail.jsx (9J)
12. Create client/src/pages/ForgotPassword.jsx (9J)
13. Create client/src/pages/ResetPassword.jsx (9J)
14. Rewrite client/src/pages/Login.jsx — keep dev mode (9K)
15. Update client/src/App.jsx routes (9L)
16. Update AdminDashboard.jsx (9M)
17. Add env variables to server/.env (9N)
```

---

## What Stays the Same

- Existing `admin_invitations` flow for creating admin accounts still works — it's extended, not replaced
- All existing user data unaffected — migration marks everyone as pre-verified
- Login keeps `x-user` header pattern + dev mock dropdown for easy testing
- Intern Lobby / SyncChat / ICAA HQ / all Phase 1–7 features untouched
- Current Indigo `#4c5fd5` color scheme preserved until Phase 10 (Branding)
- Email templates use ICAA red `#b9123f` per co-worker's spec (only in emails)

---

## Multi-City Note (Future)

When multi-city support is added:
- Add `city` field to `users` and `intern_cycles` tables
- Registration form adds city selector (Chicago, Detroit, etc.)
- Cycle identity stays as-is (C-58 means Chicago C-58 by convention)
- Do not build any of this yet

---

## Phase 10: Production Hardening (In Progress)

Build/check:

### 10A — Access Control Verification
- ✅ `requesterCanAccess()` in `notificationController.js`
- ✅ Auth middleware created: `server/src/middleware/auth.js`
- ✅ ErrorBoundary component created: `client/src/components/ErrorBoundary.jsx`
- ✅ ErrorBoundary added to `App.jsx` to catch silent errors
- TODO: Apply `requireAuth` and `requireAdmin` to all admin routes
- TODO: Verify Intern Lobby only accessible by interns (own cycle) + admins
- TODO: Verify SyncChat channels only accessible by commenced members
- TODO: Verify project discussions only by members/owners/admins
- TODO: Verify mentorship sessions only by intern + their mentor
- TODO: Verify admin routes have admin role check
- TODO: Verify public profile returns no private data

### 10B — Idempotent Migrations
- ✅ `admin_invitations` table updated with `IF NOT EXISTS` patterns
- TODO: Review all SQL files in `server/src/database/` for `IF NOT EXISTS`
- TODO: Ensure all migrations can be run safely multiple times

### 10C — Seed Data
- TODO: Create `server/src/database/seed_demo.sql`
- TODO: Include test users: 1 admin, 2 alumni, 2 residents, 3 interns (same cycle), 1 commenced intern

### 10D — Cascade Delete Verification
- TODO: Verify CASCADE rules on:
  - `mentorship_sessions` (as intern_id or mentor_id)
  - `project_members`
  - `skill_signals`
  - `user_badges`
  - `encouragements` (authored by user)
  - `notifications` (for user)
  - `announcement_reads`
  - `event_rsvps`
  - `poll_votes`

---

## Phase 11: Completed Work Summary

### Auth Revamp (Phase 9) ✅ COMPLETE
- 9A: Database migration ✅
- 9B: Install dependencies (bcrypt, nodemailer) ✅
- 9C: Auth service ✅
- 9D: Auth controller ✅
- 9E: Auth routes + server registration ✅
- 9F: Frontend API functions ✅
- 9G: Rewrite Register.jsx ✅
- 9H: Rewrite Login.jsx ✅
- 9I: VerifyEmail, ForgotPassword, ResetPassword pages ✅
- 9J: Dev mode toggle ✅

### Brand Implementation (Phase 9 Continued) ✅ COMPLETE
- 9A: League Spartan font ✅
- 9B: iCAA color system ✅
- 9C: Sidebar iCAA identity ✅
- 9D: RoleBadge iCAA colors ✅
- 9E: GovernanceBadge iCAA colors ✅
- 9F: Event cards vibrant red ✅
- 9G: Button system audit ✅
- 9H: Login/Register branded ✅
- 9I: Copy audit (iCAA terminology) ✅
- 9J: HQ visual polish ✅

---

*Hybrid Plan created: 2026-05-03*  
*Updated: 2026-05-04 — Auth + Brand phases complete, moving to Production Hardening*  
*Combines: ICAA_FINAL_PLAN.md + ICAA_WORKLOG_2026-05-01.md + ICAA_NOTIFICATION_AUDIT_2026-05-03.md + Co-worker's Auth Revamp Plan + Live Codebase State*
