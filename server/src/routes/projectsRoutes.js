import express from "express";
import {
  getProjects,
  addProjectMember,
  removeProjectMember,
  updateProjectStatus,
  createProject,
  attachProjectSkills,
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

export default router;
