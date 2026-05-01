import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  markAnnouncementRead,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementsController.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.post("/:id/read", markAnnouncementRead);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;
