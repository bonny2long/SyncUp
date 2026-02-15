import express from "express";
import {
  getMentors,
  getMentorDetails,
  getAvailableMentors,
  getProjectMentors,
  getSessions,
  createSession,
  updateSessionStatus,
  updateSessionDetails,
  rescheduleSession,
  deleteSession,
  getSessionSkills,
  getInternSessions,
  getMentorSessions,
  getMentorAvailability,
} from "../controllers/mentorshipController.js";
import { mentorshipValidators, userValidators } from "../validators/index.js";

const router = express.Router();

/**
 * @swagger
 * /mentorship/mentors:
 *   get:
 *     summary: Get all mentors
 *     tags: [Mentorship]
 *     responses:
 *       200:
 *         description: List of mentors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/mentors", getMentors);

/**
 * @swagger
 * /mentorship/mentors/available:
 *   get:
 *     summary: Get available mentors
 *     tags: [Mentorship]
 *     responses:
 *       200:
 *         description: List of mentors with availability
 */
router.get("/mentors/available", getAvailableMentors);

/**
 * @swagger
 * /mentorship/sessions:
 *   post:
 *     summary: Create a mentorship session
 *     tags: [Mentorship]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentor_id
 *               - intern_id
 *               - scheduled_at
 *             properties:
 *               mentor_id:
 *                 type: integer
 *               intern_id:
 *                 type: integer
 *               scheduled_at:
 *                 type: string
 *                 format: date-time
 *               topic:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 *       400:
 *         description: Validation error
 */
router.get("/mentor/:id/details", getMentorDetails);
router.get("/mentors/project", getProjectMentors);

router.get("/sessions", getSessions);
router.post("/sessions", mentorshipValidators.createSession, createSession);

/**
 * @swagger
 * /mentorship/sessions/{id}:
 *   put:
 *     summary: Update session status
 *     tags: [Mentorship]
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
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, declined, completed, cancelled]
 *     responses:
 *       200:
 *         description: Session updated
 *   delete:
 *     summary: Delete a session
 *     tags: [Mentorship]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session deleted
 */
router.put("/sessions/:id", mentorshipValidators.updateSession, updateSessionStatus);
router.put("/sessions/:id/details", updateSessionDetails);
router.put("/sessions/:id/reschedule", mentorshipValidators.updateSession, rescheduleSession);
router.delete("/sessions/:id", deleteSession);

router.get("/sessions/:id/skills", getSessionSkills);

router.get("/sessions/intern/:internId", getInternSessions);
router.get("/sessions/mentor/:mentorId", getMentorSessions);

router.get("/mentors/:id/availability", getMentorAvailability);

export default router;
