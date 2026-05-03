import express from "express";
import {
  createEncouragement,
  deleteEncouragement,
  getEncouragements,
} from "../controllers/encouragementsController.js";

const router = express.Router();

router.get("/", getEncouragements);
router.post("/", createEncouragement);
router.delete("/:id", deleteEncouragement);

export default router;
