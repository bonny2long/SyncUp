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

export const getSkillDistribution = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT
      s.skill_name,
      SUM(uss.weight) AS total_signals
    FROM user_skill_signals uss
    JOIN skills s ON s.id = uss.skill_id
    WHERE uss.user_id = ?
    GROUP BY s.skill_name
    ORDER BY total_signals DESC
    `,
    [id]
  );
  res.json(rows);
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
