import express from "express";
import {
  getProgressUpdates,
  createProgressUpdate,
  updateProgressUpdate,
  deleteProgressUpdate,
  getUpdatesByProject,
} from "../controllers/progressController.js";
import { progressValidators } from "../validators/index.js";

const router = express.Router();

/**
 * @swagger
 * /progress_updates:
 *   get:
 *     summary: Get all progress updates
 *     tags: [Progress Updates]
 *     responses:
 *       200:
 *         description: List of progress updates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProgressUpdate'
 *   post:
 *     summary: Create a progress update
 *     tags: [Progress Updates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - user_id
 *               - content
 *             properties:
 *               project_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               content:
 *                 type: string
 *               signal_type:
 *                 type: string
 *                 enum: [learned, applied, taught]
 *               skill_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Update created
 *       400:
 *         description: Validation error
 */
router.get("/", getProgressUpdates);
router.post("/", progressValidators.create, createProgressUpdate);

/**
 * @swagger
 * /progress_updates/{id}:
 *   put:
 *     summary: Update a progress update
 *     tags: [Progress Updates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update modified
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete a progress update
 *     tags: [Progress Updates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Update deleted
 */
router.put("/:id", progressValidators.update, updateProgressUpdate);
router.delete("/:id", progressValidators.delete, deleteProgressUpdate);

/**
 * @swagger
 * /progress_updates/project/{projectId}:
 *   get:
 *     summary: Get updates for a specific project
 *     tags: [Progress Updates]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of project updates
 */
router.get("/project/:projectId", getUpdatesByProject);

export default router;
