import express from "express";
import {
  getAllBadges,
  getUserBadges,
  checkUserBadges,
  getUserStats,
} from "../controllers/badgeController.js";
import { param } from "express-validator";
import { validate } from "../validators/index.js";

const router = express.Router();

const userIdValidation = [
  param("userId").isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
  validate,
];

router.get("/", getAllBadges);

router.get("/users/:userId", userIdValidation, getUserBadges);

router.post("/users/:userId/check", userIdValidation, checkUserBadges);

router.get("/users/:userId/stats", userIdValidation, getUserStats);

export default router;
