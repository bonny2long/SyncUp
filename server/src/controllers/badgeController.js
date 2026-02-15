import * as badgeService from "../services/badgeService.js";

export const getAllBadges = async (req, res) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json(badges);
  } catch (err) {
    console.error("Error fetching badges:", err);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
};

export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const badges = await badgeService.getUserBadges(userId);
    res.json(badges);
  } catch (err) {
    console.error("Error fetching user badges:", err);
    res.status(500).json({ error: "Failed to fetch user badges" });
  }
};

export const checkUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const newBadges = await badgeService.checkAndAwardBadges(userId);
    res.json({ newlyEarned: newBadges });
  } catch (err) {
    console.error("Error checking badges:", err);
    res.status(500).json({ error: "Failed to check badges" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await badgeService.getUserStats(userId);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
