import express from "express";
import {
  getAllErrors,
  getErrorStats,
  reportError,
  updateErrorStatus,
  deleteError,
  getRecentErrors
} from "../controllers/errorsController.js";

const router = express.Router();

// GET /api/errors - Get all errors (paginated)
router.get("/", getAllErrors);

// GET /api/errors/stats - Get error statistics
router.get("/stats", getErrorStats);

// GET /api/errors/recent - Get recent errors for overview
router.get("/recent", getRecentErrors);

// POST /api/errors - Report a new error
router.post("/", reportError);

// PUT /api/errors/:id - Update error status
router.put("/:id", updateErrorStatus);

// DELETE /api/errors/:id - Delete an error
router.delete("/:id", deleteError);

export default router;
