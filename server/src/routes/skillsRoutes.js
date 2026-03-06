import express from "express";
import pool from "../config/db.js";
import {
  getSkillMomentum,
  getSkillDistribution,
  getSkillActivity,
  getSkillSummary,
  getAllSkills,
  getRecentSkills,
  addValidation,
  removeValidation,
  getSignalValidations,
  getUserValidations,
  getUserValidatedSignals,
  getUserSkillSignals,
} from "../controllers/skillsController.js";

const router = express.Router();

// GET /api/skills
router.get("/", getAllSkills);

// GET /api/skills/user/:id/momentum
router.get("/user/:id/momentum", getSkillMomentum);

// GET /api/skills/user/:id/distribution
router.get("/user/:id/distribution", getSkillDistribution);

// GET /api/skills/user/:id/activity
router.get("/user/:id/activity", getSkillActivity);

// GET /api/skills/user/:id/summary
router.get("/user/:id/summary", getSkillSummary);

// GET /api/skills/user/:id/recent
router.get("/user/:id/recent", getRecentSkills);

// GET /api/skills/user/:id/signals - Get user's skill signals with validation counts
router.get("/user/:id/signals", getUserSkillSignals);

// POST /api/skills/:signalId/validate - Add validation (upvote or mentor endorsement)
router.post("/:signalId/validate", addValidation);

// DELETE /api/skills/:signalId/validate - Remove validation
router.delete("/:signalId/validate", removeValidation);

// GET /api/skills/:signalId/validations - Get validation counts
router.get("/:signalId/validations", getSignalValidations);

// GET /api/skills/user/:userId/validations - Get user's received validations
router.get("/user/:userId/validations", getUserValidations);

// GET /api/skills/user/:userId/has-validated - Check which signals user has validated
router.get("/user/:userId/has-validated", getUserValidatedSignals);

// GET /api/skills/verifications/pending - Get pending verifications for current user
router.get("/verifications/pending", async (req, res) => {
  const userId = req.query.user_id;
  
  if (!userId) {
    return res.status(400).json({ error: "user_id required" });
  }

  try {
    // Get projects where user is a team member
    const [projects] = await pool.query(
      `SELECT project_id FROM project_members WHERE user_id = ?`,
      [userId]
    );
    
    const projectIds = projects.map(p => p.project_id);
    
    if (projectIds.length === 0) {
      return res.json([]);
    }

    // Get pending verifications for those projects (where user is NOT the claimant)
    const [verifications] = await pool.query(
      `SELECT 
        sv.id, sv.signal_id, sv.project_id, sv.claimant_id, sv.skill_id, sv.status, sv.created_at,
        u.name as claimant_name, u.role as claimant_role,
        p.title as project_title,
        s.skill_name
      FROM skill_verifications sv
      JOIN users u ON sv.claimant_id = u.id
      JOIN projects p ON sv.project_id = p.id
      JOIN skills s ON sv.skill_id = s.id
      WHERE sv.project_id IN (?) AND sv.claimant_id != ? AND sv.status = 'pending'
      ORDER BY sv.created_at DESC`,
      [projectIds, userId]
    );

    res.json(verifications);
  } catch (err) {
    console.error("Error fetching verifications:", err);
    res.status(500).json({ error: "Failed to fetch verifications" });
  }
});

// POST /api/skills/verifications/:id/verify - Verify a skill claim
router.post("/verifications/:id/verify", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  try {
    await pool.query(
      `UPDATE skill_verifications SET status = 'verified', verifier_id = ?, verified_at = NOW() WHERE id = ?`,
      [user_id, id]
    );

    res.json({ success: true, message: "Skill verified" });
  } catch (err) {
    console.error("Error verifying skill:", err);
    res.status(500).json({ error: "Failed to verify skill" });
  }
});

// POST /api/skills/verifications/:id/challenge - Challenge a skill claim
router.post("/verifications/:id/challenge", async (req, res) => {
  const { id } = req.params;
  const { user_id, reason } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  try {
    await pool.query(
      `UPDATE skill_verifications SET status = 'challenged', verifier_id = ?, verified_at = NOW() WHERE id = ?`,
      [user_id, id]
    );

    // Optionally delete the skill signal if challenged
    // This could be added based on your policy

    res.json({ success: true, message: "Skill claim challenged" });
  } catch (err) {
    console.error("Error challenging skill:", err);
    res.status(500).json({ error: "Failed to challenge skill" });
  }
});

export default router;
