import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/health
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      status: "ok",
      database: "connected",
      version: "3.0.0",
      timestamp: rows[0].now,
    });
  } catch (err) {
    console.error("❌ Health check DB error:", err.message);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: err.message,
    });
  }
});

export default router;
