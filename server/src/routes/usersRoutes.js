import express from "express";
import { getAllUsers } from "../controllers/usersController.js";

const router = express.Router();

// GET /api/users
router.get("/", getAllUsers);

export default router;
