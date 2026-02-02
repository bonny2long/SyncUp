import pool from "../config/db.js";

// GET /api/notifications/:userId
// Fetch all notifications for a user (unread first)
export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  try {
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

// PUT /api/notifications/:id/read
// Mark notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
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
