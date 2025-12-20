import express from "express";
import {
  getProgressUpdates,
  createProgressUpdate,
  updateProgressUpdate,
  deleteProgressUpdate,
  getUpdatesByProject,
} from "../controllers/progressController.js";

const router = express.Router();

router.get("/", getProgressUpdates);
router.post("/", createProgressUpdate);
router.put("/:id", updateProgressUpdate);
router.delete("/:id", deleteProgressUpdate);
router.get("/project/:projectId", getUpdatesByProject);


export default router;
