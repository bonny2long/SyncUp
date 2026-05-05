import pool from "../config/db.js";

function requesterCanAccess(req, targetUserId) {
  const requesterId = Number(req.user?.id);
  if (!requesterId) return false;
  return requesterId === Number(targetUserId) || req.user?.role === "admin";
}

async function requesterCanAccessNotification(req, notificationId) {
  const requesterId = Number(req.user?.id);
  if (!requesterId) return false;

  const [rows] = await pool.query(
    "SELECT user_id FROM notifications WHERE id = ? LIMIT 1",
    [notificationId],
  );

  if (rows.length === 0) return null;
  return requesterId === Number(rows[0].user_id) || req.user?.role === "admin";
}

// GET /api/notifications/:userId
// Fetch all notifications for a user (unread first)
export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  try {
    if (!requesterCanAccess(req, userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [notifications] = await pool.query(
      `SELECT
        id,
        type,
        title,
        message,
        link,
        is_read,
        related_id,
        related_type,
        group_key,
        created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT ?`,
      [userId, parseInt(limit)],
    );

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// GET /api/notifications/:userId/unread-count
// Get count of unread notifications
export const getUnreadCount = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!requesterCanAccess(req, userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [result] = await pool.query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [userId],
    );

    res.json({ count: result[0].count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// GET /api/notifications/:userId/unified-counts
// Aggregate all pending items for the user
export const getUnifiedCounts = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!requesterCanAccess(req, userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // 1. Unread notifications
    const [notifRows] = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId],
    );

    // 2. Pending mentorship sessions as mentor
    const [mentorRows] = await pool.query(
      "SELECT COUNT(*) as count FROM mentorship_sessions WHERE mentor_id = ? AND status = 'pending'",
      [userId],
    );

    // 3. Pending join requests for owned projects
    const [requestRows] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM project_join_requests pjr
       JOIN projects p ON pjr.project_id = p.id
       WHERE p.owner_id = ? AND pjr.status = 'pending'`,
      [userId],
    );

    // 4. Pending skill verifications (team member claims in shared projects)
    const [userProjects] = await pool.query(
      "SELECT project_id FROM project_members WHERE user_id = ?",
      [userId],
    );
    const projectIds = userProjects.map((p) => p.project_id);
    let verificationCount = 0;
    if (projectIds.length > 0) {
      try {
        const [verificationRows] = await pool.query(
          "SELECT COUNT(*) as count FROM skill_verifications WHERE project_id IN (?) AND claimant_id != ? AND status = 'pending'",
          [projectIds, userId],
        );
        verificationCount = verificationRows[0].count;
      } catch (verifErr) {
        console.error("Error fetching verification count:", verifErr);
        // If table doesn't exist yet, just continue with 0
      }
    }

    // 5. Unread chat messages (Currently disabled until schema includes last_read_at)
    // Counting DMs for this user that are not from them (placeholder for real unread logic)
    let chatCount = 0;
    /*
    try {
      const [chatRows] = await pool.query(
        `SELECT COUNT(*) as count FROM messages WHERE recipient_id = ?`,
        [userId]
      );
      chatCount = chatRows[0].count;
    } catch (chatErr) {
       console.error("Error fetching chat count:", chatErr);
    }
    */

    res.json({
      notifications: notifRows[0].count,
      mentorship: mentorRows[0].count,
      join_requests: requestRows[0].count,
      verifications: verificationCount,
      chat: chatCount,
      total:
        notifRows[0].count +
        mentorRows[0].count +
        requestRows[0].count +
        verificationCount +
        chatCount,
    });
  } catch (err) {
    console.error("Error fetching unified counts:", err);
    res.status(500).json({ error: "Failed to fetch unified counts" });
  }
};


// PUT /api/notifications/:id/read
// Mark notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const canAccess = await requesterCanAccessNotification(req, id);
    if (canAccess === null) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (!canAccess) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// PUT /api/notifications/:userId/read-all
// Mark all notifications as read for a user
export const markAllAsRead = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!requesterCanAccess(req, userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [userId],
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// DELETE /api/notifications/:id
// Delete a notification
export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const canAccess = await requesterCanAccessNotification(req, id);
    if (canAccess === null) {
      return res.status(404).json({ error: "Notification not found" });
    }
    if (!canAccess) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [result] = await pool.query(
      `DELETE FROM notifications WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
