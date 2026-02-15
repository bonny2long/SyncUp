import * as badgeService from "../services/badgeService.js";

export const checkBadges = async (userId) => {
  try {
    const newBadges = await badgeService.checkAndAwardBadges(userId);
    return newBadges;
  } catch (err) {
    console.error("Error checking badges:", err);
    return [];
  }
};
