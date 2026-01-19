import pool from "../config/db.js";

// GET /api/skills/user/:id/momentum
export const getSkillMomentum = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT
      s.skill_name,
      YEARWEEK(uss.created_at, 1) AS year_week,
      SUM(
        CASE uss.source_type
          WHEN 'project' THEN 1
          WHEN 'update' THEN 2
          WHEN 'mentorship' THEN 3
          ELSE 1
        END
      ) AS signal_count
    FROM user_skill_signals uss
    JOIN skills s ON s.id = uss.skill_id
    WHERE uss.user_id = ?
    GROUP BY s.skill_name, year_week
    ORDER BY year_week ASC
    `,
    [id],
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
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching skill distribution:", err);
    res.status(500).json({ error: "Failed to fetch skill distribution" });
  }
};

// GET /api/skills/user/:id/activity
export const getSkillActivity = async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query(
    `
    SELECT
      YEARWEEK(uss.created_at, 1) AS year_week,
      uss.source_type,
      SUM(
        CASE uss.source_type
          WHEN 'project' THEN 1
          WHEN 'update' THEN 2
          WHEN 'mentorship' THEN 3
          ELSE 1
        END
      ) AS signal_count
    FROM user_skill_signals uss
    WHERE uss.user_id = ?
    GROUP BY year_week, source_type
    ORDER BY year_week ASC
    `,
    [id],
  );
  res.json(rows);
};

// GET /api/skills/user/:id/summary
export const getSkillSummary = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id AS skill_id,
        s.skill_name,
        COUNT(uss.id) AS signal_count,
        SUM(uss.weight) AS total_weight,
        MAX(uss.created_at) AS last_activity_at,

        -- Last 7 days
        SUM(
          CASE
            WHEN uss.created_at >= NOW() - INTERVAL 7 DAY
            THEN uss.weight
            ELSE 0
          END
        ) AS current_weight,

        -- 7–14 days ago
        SUM(
          CASE
            WHEN uss.created_at < NOW() - INTERVAL 7 DAY
             AND uss.created_at >= NOW() - INTERVAL 14 DAY
            THEN uss.weight
            ELSE 0
          END
        ) AS previous_weight

      FROM user_skill_signals uss
      JOIN skills s ON s.id = uss.skill_id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name
      ORDER BY total_weight DESC
      `,
      [userId],
    );

    const skills = rows.map((row) => {
      // ─────────────────────────────
      // Trend readiness (existing)
      // ─────────────────────────────
      let trend_readiness = "emerging";

      if (row.signal_count >= 15) {
        trend_readiness = "strong";
      } else if (row.signal_count >= 5) {
        trend_readiness = "growing";
      }

      // ─────────────────────────────
      // Transition logic (NEW)
      // ─────────────────────────────
      const current = Number(row.current_weight || 0);
      const previous = Number(row.previous_weight || 0);
      const delta = current - previous;

      let direction = "flat";
      if (delta > 0) direction = "up";
      if (delta < 0) direction = "down";

      return {
        skill_id: row.skill_id,
        skill_name: row.skill_name,
        signal_count: Number(row.signal_count),
        total_weight: Number(row.total_weight),
        last_activity_at: row.last_activity_at,
        trend_readiness,

        transition: {
          direction,
          delta,
          current_window_weight: current,
          previous_window_weight: previous,
        },
      };
    });

    res.json({
      user_id: Number(userId),
      generated_at: new Date().toISOString(),
      window_days: 7,
      skills,
    });
  } catch (err) {
    console.error("Error generating skill summary:", err);
    res.status(500).json({ error: "Failed to generate skill summary" });
  }
};
