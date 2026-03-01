import pool from "../config/db.js";

/**
 * Centralized skill signal emission.
 * This is the ONLY place allowed to write to user_skill_signals.
 * 
 * ANTI-GAMING RULES:
 * - Each user can only get 1 signal per skill per source (project/update/mentorship)
 * - Duplicate signals are ignored to prevent farming points
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
  // 3. ANTI-GAMING: Check for existing signals
  // Only insert if no signal exists for this user+skill+source combo
  // This prevents users from farming points by posting multiple updates
  // with the same skill
  // ─────────────────────────────────────────────
  const db = connection || pool;
  
  // Get existing signals for this user + source
  const [existing] = await db.query(
    `SELECT user_id, skill_id, source_type, source_id 
     FROM user_skill_signals 
     WHERE user_id = ? AND source_type = ? AND source_id = ?`,
    [userId, sourceType, sourceId]
  );

  // Create a set of skill_ids that already have signals
  const existingSkills = new Set(existing.map(s => s.skill_id));
  
  // Only add signals for skills that don't already have one
  const newValues = uniqueSkillIds
    .filter(skillId => !existingSkills.has(skillId))
    .map((skillId) => [
      userId,
      skillId,
      sourceType,
      sourceId,
      signalType,
      weight,
    ]);

  if (newValues.length === 0) {
    console.log("All skills already signaled for this source - skipping to prevent gaming");
    return;
  }

  // ─────────────────────────────────────────────
  // 4. Insert only new signals
  // ─────────────────────────────────────────────
  await db.query(
    `
    INSERT INTO user_skill_signals
      (user_id, skill_id, source_type, source_id, signal_type, weight)
    VALUES ?
    `,
    [newValues],
  );
  
  console.log(`Inserted ${newValues.length} new skill signals, filtered ${existingSkills.size} duplicates`);

  // ─────────────────────────────────────────────
  // 5. ANTI-GAMING: Create verification records for team projects
  // Team members must verify skills claimed by others
  // Solo projects are auto-verified
  // ─────────────────────────────────────────────
  
  // Get project_id from context or sourceId
  const projectId = context.project_id || (sourceType === 'project' ? sourceId : null);
  
  if (projectId) {
    // Check if this is a team project (more than 1 member)
    const [members] = await db.query(
      `SELECT user_id FROM project_members WHERE project_id = ?`,
      [projectId]
    );
    
    const isTeamProject = members.length > 1;
    
    // Get the skill names for notifications
    const skillNames = [];
    if (newValues.length > 0) {
      const skillIdsList = newValues.map(v => v[1]);
      const [skills] = await db.query(
        `SELECT id, skill_name FROM skills WHERE id IN (?)`,
        [skillIdsList]
      );
      skills.forEach(s => skillNames.push(s.skill_name));
    }

    if (isTeamProject) {
      console.log("Team project detected - creating verifications and notifications");
      
      // Create pending verification records for each new signal
      for (const signal of newValues) {
        // Get the signal ID we just inserted
        const [signalRow] = await db.query(
          `SELECT id FROM user_skill_signals 
           WHERE user_id = ? AND skill_id = ? AND source_type = ? AND source_id = ? 
           LIMIT 1`,
          [signal[0], signal[1], signal[2], signal[3]]
        );
        
        if (signalRow.length > 0) {
          await db.query(
            `INSERT INTO skill_verifications (signal_id, project_id, claimant_id, skill_id, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [signalRow[0].id, projectId, signal[0], signal[1]]
          );
        }
      }
      
      // Notify team members about pending skill verifications
      const teamMemberIds = members
        .map(m => m.user_id)
        .filter(id => id !== userId); // Don't notify the claimant
      
      if (teamMemberIds.length > 0 && skillNames.length > 0) {
        try {
          await createSkillVerificationNotification(
            db, 
            teamMemberIds, 
            userId, 
            projectId, 
            skillNames.slice(0, 3), // Max 3 skills in notification
            sourceType
          );
        } catch (err) {
          console.error("Failed to create skill verification notification:", err);
          // Don't fail the main operation
        }
      }
      
      console.log(`Created ${newValues.length} pending verifications for team project ${projectId}`);
    } else {
      // Solo project - auto-verify
      for (const signal of newValues) {
        const [signalRow] = await db.query(
          `SELECT id FROM user_skill_signals 
           WHERE user_id = ? AND skill_id = ? AND source_type = ? AND source_id = ? 
           LIMIT 1`,
          [signal[0], signal[1], signal[2], signal[3]]
        );
        
        if (signalRow.length > 0) {
          await db.query(
            `INSERT INTO skill_verifications (signal_id, project_id, claimant_id, verifier_id, skill_id, status, verified_at) 
             VALUES (?, ?, ?, ?, ?, 'verified', NOW())`,
            [signalRow[0].id, projectId, signal[0], signal[0], signal[1]] // Self-verified
          );
        }
      }
      console.log(`Auto-verified ${newValues.length} skills for solo project ${projectId}`);
    }
  }
}

// Helper to create notification for skill verification
async function createSkillVerificationNotification(db, teamMemberIds, claimantId, projectId, skillNames, sourceType) {
  console.log("Creating skill verification notification:", { teamMemberIds, claimantId, projectId, skillNames, sourceType });
  
  try {
    const [project] = await db.query(
      `SELECT title FROM projects WHERE id = ?`,
      [projectId]
    );
    
    const projectTitle = project[0]?.title || 'Unknown Project';
    const skillText = skillNames.join(', ');
    
    // Get claimant name
    const [user] = await db.query(
      `SELECT name FROM users WHERE id = ?`,
      [claimantId]
    );
    const claimantName = user[0]?.name || 'Someone';
    
    const notificationType = sourceType === 'update' ? 'skill_update' : 'skill_claim';
    const message = `${claimantName} claimed ${skillText} on "${projectTitle}". Verify if accurate.`;
    
    for (const memberId of teamMemberIds) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link, is_read, related_id, related_type) 
         VALUES (?, ?, ?, ?, ?, 0, ?, 'skill_verification')`,
        [memberId, notificationType, 'Skill Verification Needed', message, `/collaboration?project=${projectId}`, projectId]
      );
    }
    console.log(`Created ${teamMemberIds.length} skill verification notifications`);
  } catch (err) {
    console.error("ERROR in createSkillVerificationNotification:", err.message);
  }
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
