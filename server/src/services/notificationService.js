import pool from "../config/db.js";

/**
 * Centralized notification creation service
 * Emits notifications for various user events
 */

const PREFERENCE_FIELDS = {
  join_request: "notify_join_requests",
  mention: "notify_mentions",
  session: "notify_session_reminders",
  project_update: "notify_project_updates",
  channel_message: "notify_channel_messages",
  dm: "notify_dm_messages",
  opportunity: "notify_opportunities",
  event: "notify_events",
  encouragement: "notify_encouragements",
};

async function getRecipientPreference(userId, preferenceKey, db) {
  if (!preferenceKey) return true;

  const preferenceField = PREFERENCE_FIELDS[preferenceKey];
  if (!preferenceField) return true;

  const [rows] = await db.query(
    `SELECT ${preferenceField} AS enabled FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );

  return rows.length === 0 ? false : Boolean(rows[0].enabled);
}

export const createSmartNotification = async ({
  userId,
  recipientId,
  type,
  title,
  message,
  link = null,
  relatedId = null,
  relatedType = null,
  groupKey = null,
  preferenceKey = null,
  critical = false,
  connection = null,
}) => {
  const db = connection || pool;
  const targetUserId = recipientId || userId;

  if (!targetUserId) return null;

  try {
    const shouldNotify =
      critical || (await getRecipientPreference(targetUserId, preferenceKey, db));

    if (!shouldNotify) return null;

    if (groupKey) {
      const [existing] = await db.query(
        `SELECT id
         FROM notifications
         WHERE user_id = ?
           AND group_key = ?
           AND is_read = 0
         ORDER BY created_at DESC
         LIMIT 1`,
        [targetUserId, groupKey],
      );

      if (existing.length > 0) {
        await db.query(
          `UPDATE notifications
           SET type = ?,
               title = ?,
               message = ?,
               link = ?,
               related_id = ?,
               related_type = ?,
               created_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            type,
            title,
            message,
            link,
            relatedId,
            relatedType,
            existing[0].id,
          ],
        );
        return existing[0].id;
      }
    }

    const [result] = await db.query(
      `INSERT INTO notifications
        (user_id, type, title, message, link, related_id, related_type, group_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetUserId,
        type,
        title,
        message,
        link,
        relatedId,
        relatedType,
        groupKey,
      ],
    );

    return result.insertId;
  } catch (err) {
    console.error("Error creating smart notification:", err);
    throw err;
  }
};

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
  return createSmartNotification({
    userId,
    type,
    title,
    message,
    link,
    relatedId,
    relatedType,
    critical: true,
    connection,
  });
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
    title: "Join Request Approved!",
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
    title: "Session Accepted!",
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
    title: "Session Completed!",
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
    const eligibleUserIds = [];
    for (const userId of userIds) {
      if (await getRecipientPreference(userId, "project_update", db)) {
        eligibleUserIds.push(userId);
      }
    }

    for (const userId of eligibleUserIds) {
      await createSmartNotification({
        userId,
        type: "project_update",
        title: "New Project Update",
        message: `${authorName} posted an update on "${projectTitle}"`,
        link: `/collaboration`,
        relatedId: projectId,
        relatedType: "update",
        groupKey: `project_update:${projectId}`,
        preferenceKey: "project_update",
        connection,
      });
    }

    console.log(`${eligibleUserIds.length} project update notifications created`);
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
    const eligibleUserIds = [];
    for (const userId of userIds) {
      if (await getRecipientPreference(userId, "project_update", db)) {
        eligibleUserIds.push(userId);
      }
    }

    for (const userId of eligibleUserIds) {
      await createSmartNotification({
        userId,
        type: "project_completed",
        title: "Project Completed!",
        message: `The project "${projectTitle}" has been marked as completed. Congratulations on the great work!`,
        link: `/portfolio`,
        relatedId: projectId,
        relatedType: "project",
        groupKey: `project_completed:${projectId}`,
        preferenceKey: "project_update",
        connection,
      });
    }

    console.log(`${eligibleUserIds.length} project completed notifications created`);
  } catch (err) {
    console.error("Error creating project completed notifications:", err);
    throw err;
  }
};
