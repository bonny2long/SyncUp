import express from "express";
import {
  getActiveProjects,
  getWeeklyUpdates,
  getMentorEngagement,
  getMentorshipGrowthCorrelation,
  getEffectivePairings,
  getEngagementLoops,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/projects/active", getActiveProjects);
router.get("/updates/weekly", getWeeklyUpdates);
router.get("/mentors/engagement", getMentorEngagement);
router.get("/correlation/mentorship-growth", getMentorshipGrowthCorrelation);
router.get("/correlation/effective-pairings", getEffectivePairings);
router.get("/correlation/engagement-loops", getEngagementLoops);

export default router;
