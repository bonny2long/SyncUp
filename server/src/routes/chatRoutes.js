import express from "express";
import {
  getChannels,
  createChannel,
  joinChannel,
  leaveChannel,
  getIntroductionMessages,
  getChannelMessages,
  getDMMessages,
  sendMessage,
  getPresence,
  updatePresence,
  getDMUsers,
  getCohortMessages,
  sendCohortMessage,
} from "../controllers/chatController.js";
import { chatValidators } from "../validators/index.js";

const router = express.Router();

// Channels
router.get("/channels", getChannels);
router.post("/channels", chatValidators.createChannel, createChannel);
router.post("/channels/:channelId/join", joinChannel);
router.delete("/channels/:channelId/leave", leaveChannel);

// Messages
router.get("/introductions", getIntroductionMessages);
router.get("/channels/:channelId/messages", getChannelMessages);
router.get("/dm/:userId", getDMMessages);
router.post("/messages", chatValidators.sendMessage, sendMessage);

// Cohort Messages (intern-to-intern)
router.get("/cohort/:cycleId/messages", getCohortMessages);
router.post("/cohort/:cycleId/messages", sendCohortMessage);

// Presence
router.get("/presence", getPresence);
router.post("/presence", updatePresence);

// DM Users
router.get("/dm-users", getDMUsers);

export default router;
