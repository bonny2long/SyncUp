import pool from "../config/db.js";

/**
 * Centralized skill signal emission.
 * This is the ONLY place allowed to write to user_skill_signals.
 */
export async function emitSkillSignals({
  userId,
  sourceType, // 'project' | 'update' | 'mentorship'
  sourceId,
  signalType, // 'joined' | 'update' | 'completed'
  context = {}, // { session_focus, project_id }
  skillIds = [],
  weight = 1,
  connection,
}) {
  console.log("emitSkillSignals called with:", {
    userId,
    sourceType,
    sourceId,
    signalType,
    context,
  });

  if (!userId || !sourceType || !sourceId || !signalType) {
    return; // silent no-op (guardrail)
  }

  // ─────────────────────────────────────────────
  // 1. Guardrails by source type
  // ─────────────────────────────────────────────

  // Mentorship rules (CRITICAL)
  if (sourceType === "mentorship") {
    const allowedFocuses = ["project_support", "technical_guidance"];

    // No intent or non-technical intent → no skills
    if (!allowedFocuses.includes(context.session_focus)) {
      return;
    }

    // Allowed focuses proceed to skill emission
    // (skills must be provided in skillIds)
  }

  // Project & update require skills
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    return;
  }

  // ─────────────────────────────────────────────
  // 2. Deduplicate skill IDs (safety)
  // ─────────────────────────────────────────────
  const uniqueSkillIds = [...new Set(skillIds)];

  // ─────────────────────────────────────────────
  // 3. Insert signals (append-only)
  // ─────────────────────────────────────────────
  const values = uniqueSkillIds.map((skillId) => [
    userId,
    skillId,
    sourceType,
    sourceId,
    signalType,
    weight,
  ]);

  const db = connection || pool;

  await db.query(
    `
    INSERT INTO user_skill_signals
      (user_id, skill_id, source_type, source_id, signal_type, weight)
    VALUES ?
    `,
    [values],
  );
}
