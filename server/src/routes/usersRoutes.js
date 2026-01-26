import express from "express";
import {
  getAllUsers,
  getUserProfile,
  getUserSkillInventory,
  getUserActivityTimeline,
} from "../controllers/usersController.js";

const router = express.Router();

// GET /api/users
router.get("/", getAllUsers);

// GET /api/users/:userId/profile
router.get("/:userId/profile", getUserProfile);

// GET /api/users/:userId/skill-inventory
router.get("/:userId/skill-inventory", getUserSkillInventory);

// GET /api/users/:userId/activity-timeline
router.get("/:userId/activity-timeline", getUserActivityTimeline);

export default router;
