import express from "express";
import {
  getSkillMomentum,
  getSkillDistribution,
  getSkillActivity
} from "../controllers/skillsController.js";

const router = express.Router();

router.get("/user/:id/momentum", getSkillMomentum);
router.get("/user/:id/distribution", getSkillDistribution);
router.get("/user/:id/activity", getSkillActivity);

export default router;
