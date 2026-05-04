import pool from '../config/db.js';

/**
 * Middleware to verify user is authenticated
 * Expects user info in req.user (set by previous auth check)
 */
export function requireAuth(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

/**
 * Middleware to verify user is an admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

/**
 * Middleware to load user from user_id query param or header
 * Sets req.user for use in route handlers
 */
export async function loadUser(req, res, next) {
  const userId = req.query.user_id || req.headers['x-user-id'] || req.body.user_id;
  
  if (!userId) {
    req.user = null;
    return next();
  }
  
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, cycle, intern_cycle_id, has_commenced, email_verified
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (rows.length === 0) {
      req.user = null;
    } else {
      req.user = rows[0];
    }
    next();
  } catch (err) {
    console.error('Error loading user:', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
}
