import crypto from 'crypto';
import pool from '../config/db.js';

// Domain validation - @icstars.org only for self-registration
const ALLOWED_DOMAIN = 'icstars.org';

export function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === ALLOWED_DOMAIN;
}

// Cycle normalization - mirrors cyclesController.js
export function normalizeCycle(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return null;
  if (raw.startsWith('C-')) return raw;
  if (/^\d+$/.test(raw)) return 'C-' + raw;
  if (/^C\d+$/.test(raw)) return 'C-' + raw.slice(1);
  return raw;
}

// Token generation
export function generateToken() {
  return crypto.randomBytes(48).toString('hex');
}

// Email sending - falls back to console in dev
export async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.log('[EMAIL - DEV MODE]');
    console.log('To: ' + to);
    console.log('Subject: ' + subject);
    var linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch) {
      console.log('LINK: ' + linkMatch[1]);
    }
    console.log('Body: ' + html.replace(/<[^>]+>/g, ''));
    console.log('');
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
    from: process.env.EMAIL_FROM || '"SyncUp | iCAA" <noreply@icstars.org>',
    to,
    subject,
    html,
  });
}

// Email templates - ICAA red only in emails
const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export function verificationEmailHtml(name, token) {
  var link = BASE_URL + '/verify-email?token=' + token;
  return '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">' +
    '<h2 style="color:#b9123f;">Welcome to SyncUp, ' + name + '</h2>' +
    '<p>You are almost in. Confirm your email address to activate your account.</p>' +
    '<a href="' + link + '" style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Verify My Email</a>' +
    '<p style="color:#666;font-size:12px;margin-top:24px;">This link expires in 24 hours. If you did not create a SyncUp account, ignore this email.</p>' +
    '</div>';
}

export function passwordResetEmailHtml(name, token) {
  var link = BASE_URL + '/reset-password?token=' + token;
  return '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">' +
    '<h2 style="color:#b9123f;">Reset Your Password</h2>' +
    '<p>Hi ' + name + ', someone requested a password reset for your SyncUp account.</p>' +
    '<a href="' + link + '" style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset My Password</a>' +
    '<p style="color:#666;font-size:12px;margin-top:24px;">This link expires in 1 hour. If you did not request this, your account is safe — ignore this email.</p>' +
    '</div>';
}

export function specialInviteEmailHtml(name, token, note) {
  var link = BASE_URL + '/register?token=' + token;
  return '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;">' +
    '<h2 style="color:#b9123f;">You have been invited to SyncUp</h2>' +
    '<p>Hi ' + (name || 'there') + ',</p>' +
    '<p>An iCAA administrator has verified your membership and invited you to join the iCAA community platform.</p>' +
    (note ? '<p style="font-style:italic;color:#555;">"' + note + '"</p>' : '') +
    '<a href="' + link + '" style="display:inline-block;background:#b9123f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Create My Account</a>' +
    '<p style="color:#666;font-size:12px;margin-top:24px;">This link expires in 7 days.</p>' +
    '</div>';
}
