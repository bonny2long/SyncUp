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
} from "../controllers/mentorshipController.js";

const router = express.Router();

// GET all mentors
router.get("/mentors", getMentors);
// GET mentor details
router.get("/mentor/:id/details", getMentorDetails);

// GET available mentors (availability table)
router.get("/mentors/available", getAvailableMentors);

// GET mentors assigned to projects
router.get("/mentors/project", getProjectMentors);

// GET all sessions
router.get("/sessions", getSessions);

// POST new mentorship session
router.post("/sessions", createSession);

// PUT update session status
router.put("/sessions/:id", updateSessionStatus);

// PUT update session details
router.put("/sessions/:id/details", updateSessionDetails);

// PUT reschedule session
router.put("/sessions/:id/reschedule", rescheduleSession);

// DELETE session
router.delete("/sessions/:id", deleteSession);

export default router;
