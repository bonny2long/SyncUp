import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get user's notifications
router.get("/:userId", getUserNotifications);

// Get unread count
router.get("/:userId/unread-count", getUnreadCount);

// Mark single notification as read
router.put("/:id/read", markAsRead);

// Mark all as read
router.put("/:userId/read-all", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
