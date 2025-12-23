import pool from "../config/db.js";

export const getSkillMomentum = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT
      s.skill_name,
      YEARWEEK(uss.created_at, 1) AS year_week,
      COUNT(*) AS signal_count
    FROM user_skill_signals uss
    JOIN skills s ON s.id = uss.skill_id
    WHERE uss.user_id = ?
    GROUP BY s.skill_name, year_week
    ORDER BY year_week ASC
    `,
    [id]
  );
  res.json(rows);
};

// GET /api/skills/user/:id/distribution
export const getSkillDistribution = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        s.skill_name AS skill,
        COUNT(*) AS total
      FROM user_skill_signals uss
      JOIN skills s ON s.id = uss.skill_id
      WHERE uss.user_id = ?
      GROUP BY s.skill_name
      ORDER BY total DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching skill distribution:", err);
    res.status(500).json({ error: "Failed to fetch skill distribution" });
  }
};


export const getSkillActivity = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT
      YEARWEEK(created_at, 1) AS year_week,
      source_type,
      COUNT(*) AS count
    FROM user_skill_signals
    WHERE user_id = ?
    GROUP BY year_week, source_type
    ORDER BY year_week ASC
    `,
    [id]
  );
  res.json(rows);
};
