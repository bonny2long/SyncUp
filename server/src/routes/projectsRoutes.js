import express from "express";
import {
  getProjects,
  addProjectMember,
  removeProjectMember,
  updateProjectStatus,
  createProject,
  attachProjectSkills,
  getProjectSkills,
  getUserProjects,
  getProjectPortfolioDetails,
  getProjectMetrics,
  // NEW: Join Request functions
  createJoinRequest,
  getProjectRequests,
  getUserProjectRequests,
  approveJoinRequest,
  rejectJoinRequest,
  checkJoinRequestStatus,
} from "../controllers/projectsController.js";

const router = express.Router();

// ============================================================
// EXISTING ROUTES
// ============================================================

// GET /api/projects
router.get("/", getProjects);

// POST /api/projects
router.post("/", createProject);

// POST /api/projects/:id/skills
router.post("/:id/skills", attachProjectSkills);

// POST /api/projects/:projectId/members
router.post("/:projectId/members", addProjectMember);

// DELETE /api/projects/:projectId/members
router.delete("/:projectId/members", removeProjectMember);

// PUT /api/projects/:id/status
router.put("/:id/status", updateProjectStatus);

// GET /api/projects/:id/skills
router.get("/:id/skills", getProjectSkills);

// GET /api/projects/user/:userId - MUST come before /:projectId routes
router.get("/user/:userId", getUserProjects);

// GET /api/projects/:projectId/portfolio-details
router.get("/:projectId/portfolio-details", getProjectPortfolioDetails);

// GET /api/projects/:projectId/metrics
router.get("/:projectId/metrics", getProjectMetrics);

// ============================================================
// NEW: JOIN REQUEST ROUTES
// ============================================================

// POST /api/projects/:projectId/join-request
// User submits request to join
router.post("/:projectId/join-request", createJoinRequest);

// GET /api/projects/:projectId/requests
// Owner gets pending requests for this project
router.get("/:projectId/requests", getProjectRequests);

// GET /api/projects/requests/user/:userId
// Owner gets all pending requests across their projects
router.get("/requests/user/:userId", getUserProjectRequests);

// GET /api/projects/:projectId/join-request/status/:userId
// Check if user has pending request
router.get("/:projectId/join-request/status/:userId", checkJoinRequestStatus);

// PUT /api/projects/:projectId/requests/:requestId/approve
// Owner approves request
router.put("/:projectId/requests/:requestId/approve", approveJoinRequest);

// PUT /api/projects/:projectId/requests/:requestId/reject
// Owner rejects request
router.put("/:projectId/requests/:requestId/reject", rejectJoinRequest);

export default router;
