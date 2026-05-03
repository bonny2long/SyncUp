import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  markAnnouncementRead,
  updateAnnouncement,
  deleteAnnouncement,
  getPollForAnnouncement,
  submitPollVote,
} from "../controllers/announcementsController.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.get("/:announcementId/poll", getPollForAnnouncement);
router.post("/polls/:pollId/vote", submitPollVote);
router.post("/:id/read", markAnnouncementRead);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;
