import express from "express";
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunities,
} from "../controllers/opportunitiesController.js";

const router = express.Router();

router.get("/", getOpportunities);
router.post("/", createOpportunity);
router.delete("/:id", deleteOpportunity);

export default router;
