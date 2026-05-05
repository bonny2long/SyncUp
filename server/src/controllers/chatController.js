import pool from "../config/db.js";
import { createSmartNotification } from "../services/notificationService.js";

// =============================================
// CHANNELS
// =============================================

// Get all channels
export const getChannels = async (req, res) => {
  const { user_id } = req.query;

  try {
    let userRole = "intern";

    if (user_id) {
      const [userRows] = await pool.query(
        "SELECT role FROM users WHERE id = ?",
        [user_id],
      );

      if (userRows.length > 0) {
        userRole = userRows[0].role;
      }
    }

    if (userRole === "intern") {
      return res.json([]);
    }

    const [rows] = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) as member_count
      FROM channels c
      WHERE c.allowed_roles IS NULL
         OR JSON_CONTAINS(c.allowed_roles, JSON_QUOTE(?))
      ORDER BY
        CASE c.channel_type
          WHEN 'announcements' THEN 0
          WHEN 'general' THEN 1
          WHEN 'community' THEN 2
          WHEN 'restricted' THEN 3
          ELSE 4
        END,
        c.created_at ASC
    `, [userRole]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
};

// Create a new channel
export const createChannel = async (req, res) => {
  const { name, description, is_private } = req.body;
  const { user_id } = req.query;

  if (!name || !user_id) {
    return res.status(400).json({ error: "Name and user_id required" });
  }

  try {
    const [userRows] = await pool.query(
      "SELECT role, is_admin FROM users WHERE id = ?",
      [user_id],
    );

    if (!userRows[0]?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const [result] = await pool.query(
      "INSERT INTO channels (name, description, created_by, is_private) VALUES (?, ?, ?, ?)",
      [name, description || null, user_id, is_private || false],
    );

    const channelId = result.insertId;

    // Add creator as member
    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)",
      [channelId, user_id],
    );

    const [rows] = await pool.query("SELECT * FROM channels WHERE id = ?", [
      channelId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Channel name already exists" });
    }
    console.error("Error creating channel:", err);
    res.status(500).json({ error: "Failed to create channel" });
  }
};

// Join a channel
export const joinChannel = async (req, res) => {
  const { channelId } = req.params;
  const { user_id } = req.query;

  try {
    await pool.query(
      "INSERT IGNORE INTO channel_members (channel_id, user_id) VALUES (?, ?)",
      [channelId, user_id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error joining channel:", err);
    res.status(500).json({ error: "Failed to join channel" });
  }
};

// Leave a channel
export const leaveChannel = async (req, res) => {
  const { channelId } = req.params;
  const { user_id } = req.query;

  try {
    await pool.query(
      "DELETE FROM channel_members WHERE channel_id = ? AND user_id = ?",
      [channelId, user_id],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error leaving channel:", err);
    res.status(500).json({ error: "Failed to leave channel" });
  }
};

// =============================================
// MESSAGES
// =============================================

// Get recent commencement introductions for the community HQ strip
export const getIntroductionMessages = async (req, res) => {
  const { limit = 5, user_id } = req.query;

  try {
    if (user_id) {
      const [users] = await pool.query("SELECT role FROM users WHERE id = ?", [
        user_id,
      ]);
      if (users[0]?.role === "intern") {
        return res.status(403).json({
          error: "Introductions are for commenced community members",
        });
      }
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
    const [rows] = await pool.query(
      `
      SELECT m.id, m.content, m.created_at,
             u.name AS sender_name, u.role AS sender_role, u.cycle AS sender_cycle
      FROM messages m
      JOIN channels c ON m.channel_id = c.id
      JOIN users u ON m.sender_id = u.id
      WHERE c.name = 'introductions'
      ORDER BY m.created_at DESC
      LIMIT ?
    `,
      [safeLimit],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching introductions:", err);
    res.status(500).json({ error: "Failed to fetch introductions" });
  }
};

// Get messages for a channel
export const getChannelMessages = async (req, res) => {
  const { channelId } = req.params;
  const { limit = 50, user_id } = req.query;

  try {
    if (user_id) {
      const [users] = await pool.query("SELECT role FROM users WHERE id = ?", [
        user_id,
      ]);
      if (users[0]?.role === "intern") {
        return res.status(403).json({ error: "SyncChat is for commenced community members" });
      }
    }

    const [rows] = await pool.query(
      `
      SELECT m.*, u.name as sender_name, u.role as sender_role, u.cycle as sender_cycle, u.profile_pic as sender_pic
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `,
      [channelId, parseInt(limit)],
    );

    res.json(rows.reverse());
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get DM conversation with a user
export const getDMMessages = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.query;
  const { limit = 50 } = req.query;

  try {
    const [rows] = await pool.query(
      `
      SELECT m.*, u.name as sender_name, u.role as sender_role, u.cycle as sender_cycle, u.profile_pic as sender_pic
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?)
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ?
    `,
      [userId, currentUserId, currentUserId, userId, parseInt(limit)],
    );

    res.json(rows.reverse());
  } catch (err) {
    console.error("Error fetching DM:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Send a message (channel or DM)
export const sendMessage = async (req, res) => {
  const { channel_id, recipient_id, content, file_url, file_name } = req.body;
  const { user_id } = req.query;

  if (!user_id || !content) {
    return res.status(400).json({ error: "User ID and content required" });
  }

  if (!channel_id && !recipient_id) {
    return res.status(400).json({ error: "Channel ID or recipient required" });
  }

  try {
    if (channel_id) {
      const [users] = await pool.query("SELECT role FROM users WHERE id = ?", [
        user_id,
      ]);
      if (users[0]?.role === "intern") {
        return res.status(403).json({ error: "SyncChat is for commenced community members" });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO messages (channel_id, sender_id, recipient_id, content, file_url, file_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        channel_id || null,
        user_id,
        recipient_id || null,
        content,
        file_url || null,
        file_name || null,
      ],
    );

    const [rows] = await pool.query(
      `
      SELECT m.*, u.name as sender_name, u.role as sender_role, u.cycle as sender_cycle
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `,
      [result.insertId],
    );

    const messageData = rows[0];

    // Fire DM notification without blocking the response
    if (recipient_id) {
      const preview = content.length > 80 ? `${content.slice(0, 80)}...` : content;
      createSmartNotification({
        recipientId: Number(recipient_id),
        type: "dm",
        title: `Message from ${messageData.sender_name}`,
        message: preview,
        link: `/chat?user=${user_id}`,
        relatedId: result.insertId,
        relatedType: "message",
        groupKey: `dm:${user_id}:${recipient_id}`,
        preferenceKey: "dm",
      }).catch((err) => console.error("DM notification error:", err));
    }

    res.status(201).json(messageData);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// =============================================
// PRESENCE
// =============================================

// Get all users and their presence, including shared projects
export const getPresence = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT up.status, up.last_seen, up.current_channel_id,
             u.id, u.name, u.role, u.profile_pic, u.cycle
      FROM user_presence up
      JOIN users u ON up.user_id = u.id
      WHERE u.role != 'intern'
      ORDER BY 
        CASE up.status WHEN 'online' THEN 0 ELSE 1 END,
        u.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching presence:", err);
    res.status(500).json({ error: "Failed to fetch presence" });
  }
};

// Update my presence
export const updatePresence = async (req, res) => {
  const { user_id } = req.query;
  const { status, current_channel_id, last_page } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    await pool.query(
      `INSERT INTO user_presence (user_id, status, last_seen, current_channel_id, last_page) 
       VALUES (?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, last_seen = NOW(), current_channel_id = ?, last_page = ?`,
      [
        user_id,
        status || "online",
        current_channel_id || null,
        last_page || null,
        status || "online",
        current_channel_id || null,
        last_page || null,
      ],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating presence:", err);
    res.status(500).json({ error: "Failed to update presence" });
  }
};

// Get users I can DM (project teammates + all users)
export const getDMUsers = async (req, res) => {
  const { user_id, scope = "chat", recent_only = "false", target_user_id } = req.query;

  try {
    const [requestingUser] = await pool.query(
      'SELECT role, has_commenced FROM users WHERE id = ?',
      [user_id]
    );

    if (!requestingUser.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const requesterRole = requestingUser[0]?.role || "intern";
    const isPreCommencedIntern =
      requesterRole === 'intern' &&
      !requestingUser[0]?.has_commenced;

    let baseFilter = "";
    let params = [user_id];

    if (scope === "lobby" && requesterRole !== "intern") {
      // Community helpers see interns
      baseFilter = "u.role = 'intern' AND COALESCE(u.has_commenced, FALSE) = FALSE";
    } else if (isPreCommencedIntern) {
      // Pre-commencemet interns see support staff
      baseFilter = "(u.role IN ('alumni', 'resident') OR u.is_admin = TRUE)";
    } else {
      // Commenced community see other community members
      baseFilter = "u.role != 'intern'";
    }

    // Recent activity filtering (last 3 days)
    // We include users who:
    // 1. Are currently online
    // 2. Have messaged the user in the last 3 days
    // 3. Are the specific target_user_id (from directory)
    let recentCondition = "";
    if (recent_only === "true") {
      recentCondition = `
        AND (
          up.status = 'online'
          OR u.id IN (
            SELECT DISTINCT recipient_id FROM messages WHERE sender_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 3 DAY)
            UNION
            SELECT DISTINCT sender_id FROM messages WHERE recipient_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 3 DAY)
          )
          ${target_user_id ? "OR u.id = ?" : ""}
        )
      `;
      params.push(user_id, user_id);
      if (target_user_id) params.push(target_user_id);
    }

    const query = `
      SELECT u.id, u.name, u.role, u.profile_pic, u.cycle,
             COALESCE(up.status, 'offline') as status,
             up.last_seen
      FROM users u
      LEFT JOIN user_presence up ON u.id = up.user_id
      WHERE u.id != ?
        AND ${baseFilter}
        ${recentCondition}
      ORDER BY 
        CASE up.status WHEN 'online' THEN 0 ELSE 1 END,
        up.last_seen DESC,
        u.name ASC
    `;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching DM users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// =============================================
// COHORT MESSAGES (Intern-to-Intern)
// =============================================

// Get cohort messages for a specific cycle
export const getCohortMessages = async (req, res) => {
  const { cycleId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT cm.id, cm.content, cm.created_at, cm.sender_id,
             u.name as sender_name, u.profile_pic as sender_pic, u.role as sender_role
      FROM cohort_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.cycle_id = ?
      ORDER BY cm.created_at ASC
      LIMIT 200
    `, [cycleId]);
    res.json(rows);
  } catch (err) {
    console.error("Cohort messages error:", err);
    res.status(500).json({ error: "Failed to fetch cohort messages" });
  }
};

// Send a message to cohort channel
export const sendCohortMessage = async (req, res) => {
  const { cycleId } = req.params;
  const { content, sender_id } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ error: "Message content required" });
  }

  try {
    // Verify sender is in this cycle
    const [userRows] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? AND intern_cycle_id = ?",
      [sender_id, cycleId]
    );
    if (!userRows.length) {
      return res.status(403).json({ error: "You are not in this cohort" });
    }

    const [result] = await pool.query(
      "INSERT INTO cohort_messages (cycle_id, sender_id, content) VALUES (?, ?, ?)",
      [cycleId, sender_id, content.trim()]
    );

    const [rows] = await pool.query(
      `SELECT cm.id, cm.content, cm.created_at, cm.sender_id,
              u.name as sender_name
       FROM cohort_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Send cohort message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};;
