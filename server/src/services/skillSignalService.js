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

/**
 * Get team skill aggregation for analytics
 * This extends the existing service for team-level analytics
 * while maintaining the same guardrails and data integrity
 */
export async function getTeamSkillAggregation(projectId, options = {}) {
  const { timeWindow = 4 } = options; // Default to 4 weeks
  const connection = options.connection || pool;

  try {
    // Get team skill distribution
    const [skillDistribution] = await connection.query(
      `SELECT
        u.name,
        u.id as user_id,
        s.skill_name,
        s.id as skill_id,
        COUNT(uss.id) as signal_count,
        SUM(uss.weight) as total_weight,
        MAX(uss.created_at) as last_signal
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN user_skill_signals uss ON u.id = uss.user_id
      LEFT JOIN skills s ON uss.skill_id = s.id
      WHERE pm.project_id = ?
      GROUP BY u.id, s.id
      HAVING signal_count > 0
      ORDER BY u.name, s.skill_name`,
      [projectId]
    );

    // Calculate momentum (week-over-week change)
    const [momentumData] = await connection.query(
      `SELECT
        YEARWEEK(uss.created_at, 1) as week,
        COUNT(uss.id) as signals,
        SUM(uss.weight) as total_weight,
        COUNT(DISTINCT uss.user_id) as active_users
      FROM project_members pm
      JOIN user_skill_signals uss ON pm.user_id = uss.user_id
      WHERE pm.project_id = ?
      AND uss.created_at >= DATE_SUB(NOW(), INTERVAL ? WEEK)
      GROUP BY YEARWEEK(uss.created_at, 1)
      ORDER BY week`,
      [projectId, timeWindow]
    );

    // Get team insights
    const [insights] = await connection.query(
      `SELECT
        COUNT(DISTINCT pm.user_id) as team_size,
        COUNT(DISTINCT s.id) as unique_skills,
        COUNT(uss.id) as total_signals,
        SUM(uss.weight) as total_weight,
        COUNT(CASE WHEN uss.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 1 END) as weekly_signals,
        AVG(uss.weight) as avg_signal_weight
      FROM project_members pm
      LEFT JOIN user_skill_signals uss ON pm.user_id = uss.user_id
      LEFT JOIN skills s ON uss.skill_id = s.id
      WHERE pm.project_id = ?`,
      [projectId]
    );

    return {
      skillDistribution,
      momentum: momentumData,
      insights: insights[0] || {},
      projectId: parseInt(projectId)
    };
  } catch (error) {
    console.error('Error in getTeamSkillAggregation:', error);
    throw error;
  }
}

/**
 * Calculate team skill diversity score
 * Higher score = more diverse skill distribution across team
 */
export function calculateSkillDiversityScore(skillDistribution) {
  if (!skillDistribution || skillDistribution.length === 0) return 0;
  
  const skillsPerUser = {};
  skillDistribution.forEach(item => {
    if (!skillsPerUser[item.user_id]) {
      skillsPerUser[item.user_id] = new Set();
    }
    if (item.signal_count > 0) {
      skillsPerUser[item.user_id].add(item.skill_id);
    }
  });

  const totalSkills = new Set();
  Object.values(skillsPerUser).forEach(skills => {
    skills.forEach(skill => totalSkills.add(skill));
  });

  const teamSize = Object.keys(skillsPerUser).length;
  if (teamSize === 0) return 0;

  // Diversity score: (unique skills / (team size * average skills per user))
  const totalSkillCount = Array.from(totalSkills).length;
  const avgSkillsPerUser = Object.values(skillsPerUser).reduce((sum, skills) => sum + skills.size, 0) / teamSize;
  
  return Math.min(100, (totalSkillCount / (teamSize * avgSkillsPerUser)) * 100);
}

/**
 * Generate team insights based on data patterns
 */
export function generateTeamInsights(teamData) {
  const insights = [];
  
  if (!teamData || !teamData.skillDistribution) {
    return insights;
  }

  // Top performing skills
  const skillTotals = {};
  teamData.skillDistribution.forEach(item => {
    if (!skillTotals[item.skill_name]) {
      skillTotals[item.skill_name] = { signals: 0, weight: 0, users: new Set() };
    }
    skillTotals[item.skill_name].signals += item.signal_count;
    skillTotals[item.skill_name].weight += item.total_weight;
    if (item.signal_count > 0) skillTotals[item.skill_name].users.add(item.user_id);
  });

  const topSkills = Object.entries(skillTotals)
    .sort(([,a], [,b]) => b.weight - a.weight)
    .slice(0, 3);

  if (topSkills.length > 0) {
    insights.push({
      type: 'top_skills',
      message: `Team excels in: ${topSkills.map(([skill]) => skill).join(', ')}`,
      data: topSkills
    });
  }

  // Growth momentum
  if (teamData.momentum && teamData.momentum.length > 1) {
    const recentWeek = teamData.momentum[teamData.momentum.length - 1];
    const previousWeek = teamData.momentum[teamData.momentum.length - 2];
    const growthRate = ((recentWeek.signals - previousWeek.signals) / previousWeek.signals) * 100;

    if (growthRate > 20) {
      insights.push({
        type: 'high_growth',
        message: `Rapid growth: ${growthRate.toFixed(0)}% increase in skill signals this week`,
        data: { growthRate, recentWeek, previousWeek }
      });
    }
  }

  // Skill coverage gaps
  const diversityScore = calculateSkillDiversityScore(teamData.skillDistribution);
  if (diversityScore < 30) {
    insights.push({
      type: 'coverage_gap',
      message: 'Low skill diversity - consider expanding team skill coverage',
      data: { diversityScore }
    });
  }

  return insights;
}
