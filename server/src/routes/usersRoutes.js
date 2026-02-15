import express from "express";
import {
  getAllUsers,
  getUserProfile,
  getUserSkillInventory,
  getUserActivityTimeline,
} from "../controllers/usersController.js";
import { userValidators } from "../validators/index.js";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /users/{userId}/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get("/:userId/profile", userValidators.getProfile, getUserProfile);

/**
 * @swagger
 * /users/{userId}/skill-inventory:
 *   get:
 *     summary: Get user skill inventory
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User skills with signals
 */
router.get("/:userId/skill-inventory", userValidators.getProfile, getUserSkillInventory);

/**
 * @swagger
 * /users/{userId}/activity-timeline:
 *   get:
 *     summary: Get user activity timeline
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: User activity timeline
 */
router.get("/:userId/activity-timeline", userValidators.getActivityTimeline, getUserActivityTimeline);

export default router;
