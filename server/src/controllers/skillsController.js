import pool from "../config/db.js";

// GET /api/skills
export const getAllSkills = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, skill_name, category FROM skills ORDER BY skill_name ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};

// GET /api/skills/user/:id/recent
// Returns top 3 most recent skills for quick-add suggestions
export const getRecentSkills = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        s.id,
        s.skill_name,
        s.category,
        MAX(uss.created_at) AS last_used,
        COUNT(uss.id) AS signal_count
      FROM user_skill_signals uss
      JOIN skills s ON s.id = uss.skill_id
      WHERE uss.user_id = ?
      GROUP BY s.id, s.skill_name, s.category
      ORDER BY last_used DESC
      LIMIT 3
      `,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching recent skills:", err);
    res.status(500).json({ error: "Failed to fetch recent skills" });
  }
};

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

      // ─────────────────────────────
      // Velocity logic (NEW)
      // ─────────────────────────────
      const WINDOW_DAYS = 7;
      const velocityPerDay = current / WINDOW_DAYS;

      let velocityState = "steady";

      if (delta > 2) velocityState = "accelerating";
      else if (delta > 0) velocityState = "gaining";
      else if (delta < 0) velocityState = "slowing";

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

        velocity: {
          per_day: Number(velocityPerDay.toFixed(2)),
          window_days: WINDOW_DAYS,
          window_weight: current,
          state: velocityState,
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

// POST /api/skills/:signalId/validate - Add validation (upvote or mentor endorsement)
export const addValidation = async (req, res) => {
  const { signalId } = req.params;
  const { validator_id, validation_type } = req.body;

  if (!validator_id || !validation_type) {
    return res.status(400).json({ error: "validator_id and validation_type are required" });
  }

  if (!["upvote", "mentor_endorsement"].includes(validation_type)) {
    return res.status(400).json({ error: "Invalid validation_type" });
  }

  try {
    // Get the skill signal to find the owner and source
    const [signals] = await pool.query(
      "SELECT user_id, source_type, source_id FROM user_skill_signals WHERE id = ?",
      [signalId]
    );

    if (signals.length === 0) {
      return res.status(404).json({ error: "Skill signal not found" });
    }

    const signal = signals[0];

    // Guardrail: Cannot validate own signal
    if (signal.user_id === Number(validator_id)) {
      return res.status(403).json({ error: "Cannot validate your own skill signal" });
    }

    // Check if validator is a mentor (required for mentor_endorsement)
    if (validation_type === "mentor_endorsement") {
      const [users] = await pool.query(
        "SELECT role FROM users WHERE id = ?",
        [validator_id]
      );
      if (users.length === 0 || users[0].role !== "mentor") {
        return res.status(403).json({ error: "Only mentors can give endorsements" });
      }
    }

    // Guardrail: For upvotes, only project team members can validate
    if (validation_type === "upvote") {
      let projectId = null;

      if (signal.source_type === "project") {
        projectId = signal.source_id;
      } else if (signal.source_type === "update") {
        // Get project from progress update
        const [updates] = await pool.query(
          "SELECT project_id FROM progress_updates WHERE id = ?",
          [signal.source_id]
        );
        if (updates.length > 0) {
          projectId = updates[0].project_id;
        }
      } else if (signal.source_type === "mentorship") {
        // Get project from mentorship session
        const [sessions] = await pool.query(
          "SELECT project_id FROM mentorship_sessions WHERE id = ?",
          [signal.source_id]
        );
        if (sessions.length > 0 && sessions[0].project_id) {
          projectId = sessions[0].project_id;
        }
      }

      // If we found a project, check membership
      if (projectId) {
        const [members] = await pool.query(
          "SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?",
          [projectId, validator_id]
        );
        if (members.length === 0) {
          return res.status(403).json({ error: "Only project team members can upvote" });
        }
      }
      // If no project found, allow the upvote (signal might be orphaned or from update without project)
    }

    // Insert validation
    await pool.query(
      "INSERT INTO skill_validations (signal_id, validator_id, validation_type) VALUES (?, ?, ?)",
      [signalId, validator_id, validation_type]
    );

    res.status(201).json({ message: "Validation added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Validation already exists" });
    }
    console.error("Error adding validation:", err);
    res.status(500).json({ error: "Failed to add validation" });
  }
};

// DELETE /api/skills/:signalId/validate - Remove validation
export const removeValidation = async (req, res) => {
  const { signalId } = req.params;
  const { validator_id, validation_type } = req.body;

  if (!validator_id || !validation_type) {
    return res.status(400).json({ error: "validator_id and validation_type are required" });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM skill_validations WHERE signal_id = ? AND validator_id = ? AND validation_type = ?",
      [signalId, validator_id, validation_type]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Validation not found" });
    }

    res.json({ message: "Validation removed successfully" });
  } catch (err) {
    console.error("Error removing validation:", err);
    res.status(500).json({ error: "Failed to remove validation" });
  }
};

// GET /api/skills/:signalId/validations - Get validation counts for a signal
export const getSignalValidations = async (req, res) => {
  const { signalId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        validation_type,
        COUNT(*) as count
      FROM skill_validations
      WHERE signal_id = ?
      GROUP BY validation_type
      `,
      [signalId]
    );

    const validations = {
      upvote: 0,
      mentor_endorsement: 0,
      total: 0
    };

    rows.forEach(row => {
      validations[row.validation_type] = row.count;
      validations.total += row.count;
    });

    res.json(validations);
  } catch (err) {
    console.error("Error fetching validations:", err);
    res.status(500).json({ error: "Failed to fetch validations" });
  }
};

// GET /api/skills/user/:userId/validations - Get user's received validations
export const getUserValidations = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        sv.id,
        sv.signal_id,
        sv.validation_type,
        sv.created_at,
        s.skill_name,
        u.name as validator_name,
        u.role as validator_role
      FROM skill_validations sv
      JOIN user_skill_signals uss ON uss.id = sv.signal_id
      JOIN skills s ON s.id = uss.skill_id
      JOIN users u ON u.id = sv.validator_id
      WHERE uss.user_id = ?
      ORDER BY sv.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching user validations:", err);
    res.status(500).json({ error: "Failed to fetch user validations" });
  }
};

// GET /api/skills/user/:userId/has-validated - Check which signals user has validated
export const getUserValidatedSignals = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT signal_id, validation_type FROM skill_validations WHERE validator_id = ?",
      [userId]
    );

    const validated = rows.reduce((acc, row) => {
      if (!acc[row.signal_id]) {
        acc[row.signal_id] = [];
      }
      acc[row.signal_id].push(row.validation_type);
      return acc;
    }, {});

    res.json(validated);
  } catch (err) {
    console.error("Error fetching user validated signals:", err);
    res.status(500).json({ error: "Failed to fetch validated signals" });
  }
};

// GET /api/skills/user/:userId/signals - Get user's skill signals with IDs for validation
export const getUserSkillSignals = async (req, res) => {
  const { userId } = req.params;

  try {
    const [signals] = await pool.query(
      `
      SELECT 
        uss.id as signal_id,
        uss.skill_id,
        s.skill_name,
        s.category,
        uss.source_type,
        uss.created_at,
        uss.weight,
        (
          SELECT COUNT(*) FROM skill_validations sv 
          WHERE sv.signal_id = uss.id AND sv.validation_type = 'upvote'
        ) as upvote_count,
        (
          SELECT COUNT(*) FROM skill_validations sv 
          WHERE sv.signal_id = uss.id AND sv.validation_type = 'mentor_endorsement'
        ) as endorsement_count
      FROM user_skill_signals uss
      JOIN skills s ON s.id = uss.skill_id
      WHERE uss.user_id = ?
      ORDER BY uss.created_at DESC
      `,
      [userId]
    );

    res.json(signals);
  } catch (err) {
    console.error("Error fetching user skill signals:", err);
    res.status(500).json({ error: "Failed to fetch skill signals" });
  }
};
