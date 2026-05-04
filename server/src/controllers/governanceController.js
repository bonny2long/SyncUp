import pool from "../config/db.js";

const POSITION_ORDER = [
  "president",
  "vice_president",
  "treasurer",
  "secretary",
  "parliamentarian",
  "tech_lead",
  "tech_member",
];

const ELIGIBLE_ROLES = ["resident", "alumni"];

function isValidPosition(position) {
  return POSITION_ORDER.includes(position);
}

async function requireAdmin(req, res) {
  const requesterId = req.user?.id || req.query.admin_id || req.body.admin_id;
  if (!requesterId) {
    res.status(403).json({ error: "Admin user is required" });
    return null;
  }

  const [rows] = await pool.query(
    "SELECT id, role, is_admin FROM users WHERE id = ?",
    [requesterId],
  );
  const requester = rows[0];
  if (!requester?.is_admin) {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return requester;
}

export const getGovernancePositions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        gp.id,
        gp.position,
        gp.assigned_at,
        gp.is_active,
        u.id AS user_id,
        u.name,
        u.role,
        u.cycle,
        u.profile_pic
      FROM governance_positions gp
      JOIN users u ON u.id = gp.user_id
      WHERE gp.is_active = TRUE
      ORDER BY FIELD(
        gp.position,
        'president',
        'vice_president',
        'treasurer',
        'secretary',
        'parliamentarian',
        'tech_lead',
        'tech_member'
      ), u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching governance positions:", err);
    res.status(500).json({ error: "Failed to fetch governance positions" });
  }
};

export const getUserGovernancePositions = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
        SELECT id, position, assigned_at
        FROM governance_positions
        WHERE user_id = ? AND is_active = TRUE
        ORDER BY FIELD(
          position,
          'president',
          'vice_president',
          'treasurer',
          'secretary',
          'parliamentarian',
          'tech_lead',
          'tech_member'
        )
      `,
      [userId],
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user governance positions:", err);
    res.status(500).json({ error: "Failed to fetch user governance" });
  }
};

export const assignGovernancePosition = async (req, res) => {
  const { user_id, position } = req.body;

  if (!user_id || !isValidPosition(position)) {
    return res.status(400).json({ error: "Valid user and position required" });
  }

  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const [users] = await pool.query("SELECT id, role FROM users WHERE id = ?", [
      user_id,
    ]);
    const target = users[0];
    if (!target) return res.status(404).json({ error: "User not found" });
    if (!ELIGIBLE_ROLES.includes(target.role)) {
      return res.status(400).json({
        error: "Governance positions can only be assigned to community members",
      });
    }

    await pool.query(
      `
        INSERT INTO governance_positions (user_id, position, assigned_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          is_active = TRUE,
          assigned_by = VALUES(assigned_by),
          assigned_at = CURRENT_TIMESTAMP
      `,
      [user_id, position, admin.id],
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error assigning governance position:", err);
    res.status(500).json({ error: "Failed to assign governance position" });
  }
};

export const removeGovernancePosition = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    await pool.query(
      "UPDATE governance_positions SET is_active = FALSE WHERE id = ?",
      [id],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error removing governance position:", err);
    res.status(500).json({ error: "Failed to remove governance position" });
  }
};
