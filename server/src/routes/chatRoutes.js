import express from "express";
import {
  getChannels,
  createChannel,
  joinChannel,
  leaveChannel,
  getChannelMessages,
  getDMMessages,
  sendMessage,
  getPresence,
  updatePresence,
  getDMUsers,
} from "../controllers/chatController.js";

const router = express.Router();

// Channels
router.get("/channels", getChannels);
router.post("/channels", createChannel);
router.post("/channels/:channelId/join", joinChannel);
router.delete("/channels/:channelId/leave", leaveChannel);

// Messages
router.get("/channels/:channelId/messages", getChannelMessages);
router.get("/dm/:userId", getDMMessages);
router.post("/messages", sendMessage);

// Presence
router.get("/presence", getPresence);
router.post("/presence", updatePresence);

// DM Users
router.get("/dm-users", getDMUsers);

export default router;
