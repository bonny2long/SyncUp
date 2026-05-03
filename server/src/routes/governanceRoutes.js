import express from "express";
import {
  assignGovernancePosition,
  getGovernancePositions,
  getUserGovernancePositions,
  removeGovernancePosition,
} from "../controllers/governanceController.js";

const router = express.Router();

router.get("/positions", getGovernancePositions);
router.get("/user/:userId", getUserGovernancePositions);
router.post("/assign", assignGovernancePosition);
router.delete("/remove/:id", removeGovernancePosition);

export default router;
