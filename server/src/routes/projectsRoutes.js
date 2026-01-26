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
} from "../controllers/projectsController.js";

const router = express.Router();

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

// GET /api/projects/user/:userId - MUST come before /:id routes
router.get("/user/:userId", getUserProjects);

// GET /api/projects/:projectId/portfolio-details
router.get("/:projectId/portfolio-details", getProjectPortfolioDetails);

// GET /api/projects/:projectId/metrics
router.get("/:projectId/metrics", getProjectMetrics);

export default router;
