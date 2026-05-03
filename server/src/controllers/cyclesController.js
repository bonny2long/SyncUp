import pool from "../config/db.js";

async function requireAdmin(req, res) {
  const requesterId = req.user?.id || req.query.admin_id || req.body.admin_id;
  if (!requesterId) {
    res.status(403).json({ error: "Admin user is required" });
    return null;
  }

  const [rows] = await pool.query("SELECT id, role FROM users WHERE id = ?", [
    requesterId,
  ]);
  const requester = rows[0];
  if (requester?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }

  return requester;
}

function normalizeCycleName(value) {
  const cycleName = String(value || "").trim().toUpperCase();
  if (!cycleName) return "";
  return cycleName.startsWith("C-") ? cycleName : `C-${cycleName}`;
}

export const getCycles = async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = "";

  if (status && ["active", "commenced", "closed"].includes(status)) {
    where = "WHERE ic.status = ?";
    params.push(status);
  }

  try {
    const [rows] = await pool.query(
      `
        SELECT
          ic.id,
          ic.cycle_name,
          ic.start_date,
          ic.end_date,
          ic.status,
          ic.created_by,
          ic.created_at,
          creator.name AS created_by_name,
          COUNT(CASE WHEN u.role = 'intern' THEN u.id END) AS intern_count,
          COUNT(CASE WHEN u.role != 'intern' THEN u.id END) AS member_count
        FROM intern_cycles ic
        LEFT JOIN users creator ON creator.id = ic.created_by
        LEFT JOIN users u
          ON u.intern_cycle_id = ic.id
          OR (
            u.intern_cycle_id IS NULL
            AND UPPER(u.cycle) = ic.cycle_name
          )
        ${where}
        GROUP BY ic.id, creator.name
        ORDER BY
          FIELD(ic.status, 'active', 'commenced', 'closed'),
          ic.created_at DESC
      `,
      params,
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching cycles:", err);
    res.status(500).json({ error: "Failed to fetch cycles" });
  }
};

export const createCycle = async (req, res) => {
  const { cycle_name, start_date } = req.body;
  const cycleName = normalizeCycleName(cycle_name);

  if (!cycleName) {
    return res.status(400).json({ error: "Cycle name is required" });
  }

  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const [result] = await pool.query(
      `
        INSERT INTO intern_cycles (cycle_name, start_date, created_by)
        VALUES (?, ?, ?)
      `,
      [cycleName, start_date || null, admin.id],
    );

    const [rows] = await pool.query(
      "SELECT * FROM intern_cycles WHERE id = ?",
      [result.insertId],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Cycle already exists" });
    }
    console.error("Error creating cycle:", err);
    res.status(500).json({ error: "Failed to create cycle" });
  }
};

export const updateCycleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "commenced", "closed"].includes(status)) {
    return res.status(400).json({ error: "Valid status is required" });
  }

  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const endDateClause =
      status === "commenced" || status === "closed" ? ", end_date = CURDATE()" : "";

    await pool.query(
      `UPDATE intern_cycles SET status = ?${endDateClause} WHERE id = ?`,
      [status, id],
    );

    const [rows] = await pool.query(
      "SELECT * FROM intern_cycles WHERE id = ?",
      [id],
    );
    if (!rows.length) return res.status(404).json({ error: "Cycle not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating cycle status:", err);
    res.status(500).json({ error: "Failed to update cycle status" });
  }
};
