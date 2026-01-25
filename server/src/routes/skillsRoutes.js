import express from "express";
import {
  getSkillMomentum,
  getSkillDistribution,
  getSkillActivity,
  getSkillSummary,
  getAllSkills,
  getRecentSkills,
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

export default router;
