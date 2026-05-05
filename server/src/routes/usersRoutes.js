import express from "express";
import pool from "../config/db.js";
import {
  getAllUsers,
  getMemberDirectory,
  getUserProfile,
  getUserSkillInventory,
  getUserActivityTimeline,
  updateUserProfile,
  changePassword,
  deleteUser,
  getCohortUsers,
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
router.get("/directory", getMemberDirectory);

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

/**
 * @swagger
 * /users/{userId}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put("/:userId/profile", userValidators.updateProfile, updateUserProfile);

/**
 * @swagger
 * /users/{userId}/password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Invalid password
 */
router.put("/:userId/password", userValidators.changePassword, changePassword);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted
 *       404:
 *         description: User not found
 */
router.delete("/:userId", deleteUser);

/**
 * @swagger
 * /users/cohort/{cycleId}:
 *   get:
 *     summary: Get interns in a specific cohort/cycle
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: cycleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of interns in the cohort
 */
router.get("/cohort/:cycleId", getCohortUsers);

export default router;
