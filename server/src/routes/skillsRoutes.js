import express from "express";
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

export default router;
