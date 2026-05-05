import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  getUnifiedCounts,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { param } from "express-validator";
import { validate } from "../validators/index.js";

const router = express.Router();

const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  validate,
];

const userIdValidation = [
  param("userId").isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
  validate,
];

router.get("/:userId", userIdValidation, getUserNotifications);
router.get("/:userId/unread-count", userIdValidation, getUnreadCount);
router.get("/:userId/unified-counts", userIdValidation, getUnifiedCounts);
router.put("/:id/read", idValidation, markAsRead);
router.put("/:userId/read-all", userIdValidation, markAllAsRead);
router.delete("/:id", idValidation, deleteNotification);

export default router;
