import pool from "../config/db.js";

/**
 * Centralized notification creation service
 * Emits notifications for various user events
 */

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  relatedId = null,
  relatedType = null,
  connection = null,
}) => {
  const db = connection || pool;

  try {
    const [result] = await db.query(
      `INSERT INTO notifications 
        (user_id, type, title, message, link, related_id, related_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, link, relatedId, relatedType],
    );

    console.log(`📬 Notification created for user ${userId}: ${type}`);
    return result.insertId;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
};

/**
 * Helper functions for specific notification types
 */

// Join Request Approved
export const notifyJoinRequestApproved = async (
  userId,
  projectTitle,
  projectId,
  connection = null,
) => {
  return createNotification({
    userId,
    type: "join_request_approved",
    title: "Join Request Approved! 🎉",
    message: `Your request to join "${projectTitle}" has been approved. Welcome to the team!`,
    link: `/collaboration`,
    relatedId: projectId,
    relatedType: "project",
    connection,
  });
};

// Join Request Rejected
export const notifyJoinRequestRejected = async (
  userId,
  projectTitle,
  projectId,
  connection = null,
) => {
  return createNotification({
    userId,
    type: "join_request_rejected",
    title: "Join Request Declined",
    message: `Your request to join "${projectTitle}" was declined. Keep exploring other projects!`,
    link: `/collaboration`,
    relatedId: projectId,
    relatedType: "project",
    connection,
  });
};

// Session Accepted
export const notifySessionAccepted = async (
  internId,
  mentorName,
  topic,
  sessionId,
  connection = null,
) => {
  return createNotification({
    userId: internId,
    type: "session_accepted",
    title: "Session Accepted! ✅",
    message: `${mentorName} accepted your session request: "${topic}". Check your schedule!`,
    link: `/mentorship`,
    relatedId: sessionId,
    relatedType: "session",
    connection,
  });
};

// Session Declined
export const notifySessionDeclined = async (
  internId,
  mentorName,
  topic,
  sessionId,
  connection = null,
) => {
  return createNotification({
    userId: internId,
    type: "session_declined",
    title: "Session Declined",
    message: `${mentorName} declined your session request: "${topic}". Try requesting another time!`,
    link: `/mentorship`,
    relatedId: sessionId,
    relatedType: "session",
    connection,
  });
};

// Session Completed
export const notifySessionCompleted = async (
  internId,
  mentorName,
  topic,
  sessionId,
  connection = null,
) => {
  return createNotification({
    userId: internId,
    type: "session_completed",
    title: "Session Completed! 🎓",
    message: `Your session with ${mentorName} on "${topic}" has been marked complete. Great work!`,
    link: `/mentorship`,
    relatedId: sessionId,
    relatedType: "session",
    connection,
  });
};

// Project Update Posted
export const notifyProjectUpdate = async (
  userIds,
  projectTitle,
  authorName,
  projectId,
  connection = null,
) => {
  const db = connection || pool;

  if (!Array.isArray(userIds) || userIds.length === 0) return;

  try {
    const values = userIds.map((userId) => [
      userId,
      "project_update",
      "New Project Update",
      `${authorName} posted an update on "${projectTitle}"`,
      `/collaboration`,
      projectId,
      "update",
    ]);

    await db.query(
      `INSERT INTO notifications 
        (user_id, type, title, message, link, related_id, related_type)
       VALUES ?`,
      [values],
    );

    console.log(`📬 ${userIds.length} project update notifications created`);
  } catch (err) {
    console.error("Error creating project update notifications:", err);
    throw err;
  }
};
// Project Completed
export const notifyProjectCompleted = async (
  userIds,
  projectTitle,
  projectId,
  connection = null,
) => {
  const db = connection || pool;

  if (!Array.isArray(userIds) || userIds.length === 0) return;

  try {
    const values = userIds.map((userId) => [
      userId,
      "project_completed",
      "Project Completed! 🏆",
      `The project "${projectTitle}" has been marked as completed. Congratulations on the great work!`,
      `/portfolio`,
      projectId,
      "project",
    ]);

    await db.query(
      `INSERT INTO notifications 
        (user_id, type, title, message, link, related_id, related_type)
       VALUES ?`,
      [values],
    );

    console.log(`📬 ${userIds.length} project completed notifications created`);
  } catch (err) {
    console.error("Error creating project completed notifications:", err);
    throw err;
  }
};
