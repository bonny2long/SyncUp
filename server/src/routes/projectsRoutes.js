import express from "express";
import {
  getProjects,
  addProjectMember,
  removeProjectMember,
  updateProjectStatus,
  createProject,
  attachProjectSkills,
  getProjectSkills,
  getAllProjectSkills,
  getUserProjects,
  getProjectPortfolioDetails,
  getProjectMetrics,
  getProjectDiscussions,
  createProjectDiscussion,
  createJoinRequest,
  getProjectRequests,
  getUserProjectRequests,
  approveJoinRequest,
  rejectJoinRequest,
  checkJoinRequestStatus,
  getTeamMomentum,
} from "../controllers/projectsController.js";
import { projectValidators } from "../validators/index.js";

const router = express.Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", getProjects);

/**
 * @swagger
 * /projects/skills:
 *   get:
 *     summary: Get all skills used in projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of project skills
 */
router.get("/skills", getAllProjectSkills);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - owner_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               owner_id:
 *                 type: integer
 *               visibility:
 *                 type: string
 *                 enum: [public, seeking]
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
router.post("/", projectValidators.create, createProject);

router.post("/:id/skills", projectValidators.attachSkills, attachProjectSkills);

router.post("/:projectId/members", projectValidators.addMember, addProjectMember);

router.delete("/:projectId/members", removeProjectMember);

/**
 * @swagger
 * /projects/{id}/status:
 *   put:
 *     summary: Update project status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [planned, active, completed, archived]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Validation error
 */
router.put("/:id/status", projectValidators.updateStatus, updateProjectStatus);

router.get("/:id/skills", getProjectSkills);

router.get("/user/:userId", getUserProjects);

router.get("/:projectId/portfolio-details", getProjectPortfolioDetails);

router.get("/:projectId/metrics", getProjectMetrics);

router.get("/:projectId/discussions", getProjectDiscussions);

router.post("/:projectId/discussions", createProjectDiscussion);

/**
 * @swagger
 * /projects/{projectId}/join-request:
 *   post:
 *     summary: Submit join request to project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Join request created
 *       400:
 *         description: Validation error or already member
 */
router.post("/:projectId/join-request", projectValidators.joinRequest, createJoinRequest);

router.get("/:projectId/requests", getProjectRequests);

router.get("/requests/user/:userId", getUserProjectRequests);

router.get("/:projectId/join-request/status/:userId", checkJoinRequestStatus);

router.put("/:projectId/requests/:requestId/approve", approveJoinRequest);

router.put("/:projectId/requests/:requestId/reject", rejectJoinRequest);

router.get("/:id/team-momentum", getTeamMomentum);

export default router;
