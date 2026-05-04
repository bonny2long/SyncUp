import crypto from "crypto";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { specialInviteEmailHtml, generateToken, sendEmail } from "../services/authService.js";

const INVITATION_EXPIRY_DAYS =
  parseInt(process.env.INVITATION_EXPIRY_DAYS) || 7;
const MAX_INVITATIONS_PER_ADMIN =
  parseInt(process.env.MAX_INVITATIONS_PER_ADMIN) || 10;

export const createInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const invitedBy = req.user?.id;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (invitedBy === undefined || invitedBy === null) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const [admin] = await pool.query("SELECT role FROM users WHERE id = ?", [
      invitedBy,
    ]);

    if (!admin.length || admin[0].role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can create invitations" });
    }

    const [recentInvites] = await pool.query(
      `SELECT COUNT(*) as count FROM admin_invitations 
       WHERE invited_by = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [invitedBy],
    );

    if (recentInvites[0].count >= MAX_INVITATIONS_PER_ADMIN) {
      return res.status(429).json({
        error: `Maximum ${MAX_INVITATIONS_PER_ADMIN} invitations per day exceeded`,
      });
    }

    const [existing] = await pool.query(
      `SELECT id, used_at FROM admin_invitations 
       WHERE email = ? AND used_at IS NULL AND expires_at > NOW()`,
      [email],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "An active invitation already exists for this email",
      });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    await pool.query(
      `INSERT INTO admin_invitations (token, email, invited_by, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [token, email, invitedBy, expiresAt],
    );

    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const invitationLink = `${baseUrl}/register?token=${token}`;

    res.status(201).json({
      success: true,
      invitation: {
        email,
        expiresAt,
        link: invitationLink,
        token: token,
      },
    });
  } catch (err) {
    console.error("Create invitation error:", err);
    res.status(500).json({ error: "Failed to create invitation" });
  }
};

export const validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: "Token is required" });
    }

    const [invitation] = await pool.query(
      `SELECT id, email, expires_at, used_at, invite_type, intended_role
         FROM admin_invitations
         WHERE token = ?`,
      [token],
    );

    if (!invitation.length) {
      return res
        .status(404)
        .json({ valid: false, error: "Invalid invitation" });
    }

    const inv = invitation[0];

    if (inv.used_at) {
      return res
        .status(410)
        .json({ valid: false, error: "Invitation already used" });
    }

    if (new Date(inv.expires_at) < new Date()) {
      return res
        .status(410)
        .json({ valid: false, error: "Invitation expired" });
    }

    res.json({
      valid: true,
      email: inv.email,
      invite_type: inv.invite_type,
      intended_role: inv.intended_role,
      is_special_invite: inv.invite_type === 'special_access',
    });
  } catch (err) {
    console.error("Validate invitation error:", err);
    res
      .status(500)
      .json({ valid: false, error: "Failed to validate invitation" });
  }
};

export const registerWithInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({
        error: "Token, name, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const [invitation] = await pool.query(
      `SELECT id, email, expires_at, used_at, invite_type, intended_role
         FROM admin_invitations
         WHERE token = ?`,
      [token],
    );

    if (!invitation.length) {
      return res.status(404).json({ error: "Invalid invitation" });
    }

    const inv = invitation[0];

    if (inv.used_at) {
      return res.status(410).json({ error: "Invitation already used" });
    }

    if (new Date(inv.expires_at) < new Date()) {
      return res.status(410).json({ error: "Invitation expired" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [inv.email],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const role = inv.intended_role || 'admin';
    const emailVerified = inv.invite_type === 'special_access' ? true : false;

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, join_date, email_verified)
         VALUES (?, ?, ?, ?, NOW(), ?)`,
      [name, inv.email, passwordHash, role, emailVerified],
    );

    await pool.query(
      `UPDATE admin_invitations SET used_at = NOW() WHERE id = ?`,
      [inv.id],
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Register with invitation error:", err);
    res.status(500).json({ error: "Failed to register" });
  }
};

export const listInvitations = async (req, res) => {
  try {
    const invitedBy = req.user?.id;

    if (invitedBy === undefined || invitedBy === null) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [admin] = await pool.query("SELECT role FROM users WHERE id = ?", [
      invitedBy,
    ]);

    if (!admin.length || admin[0].role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view invitations" });
    }

    const [invitations] = await pool.query(
      `SELECT 
        ai.id,
        ai.token,
        ai.email,
        ai.expires_at,
        ai.used_at,
        ai.created_at,
        u.name as invited_by_name
       FROM admin_invitations ai
       LEFT JOIN users u ON ai.invited_by = u.id
       ORDER BY ai.created_at DESC
       LIMIT 50`,
    );

    const formatted = invitations.map((inv) => ({
      id: inv.id,
      token: inv.token,
      email: inv.email,
      expiresAt: inv.expires_at,
      usedAt: inv.used_at,
      createdAt: inv.created_at,
      invitedBy: inv.invited_by_name,
      status:
        inv.used_at ? "used"
        : new Date(inv.expires_at) < new Date() ? "expired"
        : "pending",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("List invitations error:", err);
    res.status(500).json({ error: "Failed to list invitations" });
  }
};

// =============================================
// POST /api/admin/invitations/special
// Special access invite for non-@icstars.org users
// =============================================
export const createSpecialInvitation = async (req, res) => {
  const {
    email,
    name,
    intended_role,
    verification_note,
    admin_id,
  } = req.body;

  try {
    const [adminRows] = await pool.query(
      'SELECT role FROM users WHERE id = ?', [admin_id]
    );
    if (!adminRows.length || adminRows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!email || !verification_note?.trim()) {
      return res.status(400).json({
        error: 'Email and verification note are required. Document why this person is getting special access.'
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO admin_invitations
       (email, token, invited_by, expires_at, invite_type, intended_role, verified_by_admin_id, verification_note)
       VALUES (?, ?, ?, ?, 'special_access', ?, ?, ?)`,
      [email.toLowerCase().trim(), token, admin_id, expiresAt,
       intended_role || 'alumni', admin_id, verification_note.trim()]
    );

    await sendEmail({
      to: email.toLowerCase().trim(),
      subject: 'You have been invited to join the iCAA community on SyncUp',
      html: specialInviteEmailHtml(name, token, verification_note.trim()),
    });

    res.status(201).json({ success: true, message: `Special invitation sent to ${email}` });
  } catch (err) {
    console.error('Special invitation error:', err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

export const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitedBy = req.user?.id;

    if (invitedBy === undefined || invitedBy === null) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [admin] = await pool.query("SELECT role FROM users WHERE id = ?", [
      invitedBy,
    ]);

    if (!admin.length || admin[0].role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can revoke invitations" });
    }

    const [result] = await pool.query(
      `DELETE FROM admin_invitations 
       WHERE id = ? AND used_at IS NULL`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Invitation not found or already used",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Revoke invitation error:", err);
    res.status(500).json({ error: "Failed to revoke invitation" });
  }
};
