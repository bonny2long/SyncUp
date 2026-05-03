import express from "express";
import {
  createCycle,
  getCycles,
  updateCycleStatus,
} from "../controllers/cyclesController.js";

const router = express.Router();

router.get("/", getCycles);
router.post("/", createCycle);
router.put("/:id/status", updateCycleStatus);

export default router;
