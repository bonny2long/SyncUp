import express from "express";
import {
  getActiveProjects,
  getWeeklyUpdates,
  getMentorEngagement,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/projects/active", getActiveProjects);
router.get("/updates/weekly", getWeeklyUpdates);
router.get("/mentors/engagement", getMentorEngagement);

export default router;
