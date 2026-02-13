import pool from "../config/db.js";

// =============================================
// CHANNELS
// =============================================

// Get all channels
export const getChannels = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) as member_count
      FROM channels c
      ORDER BY created_at DESC
    `);
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
    const [result] = await pool.query(
      "INSERT INTO channels (name, description, created_by, is_private) VALUES (?, ?, ?, ?)",
      [name, description || null, user_id, is_private || false]
    );

    const channelId = result.insertId;

    // Add creator as member
    await pool.query(
      "INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)",
      [channelId, user_id]
    );

    const [rows] = await pool.query("SELECT * FROM channels WHERE id = ?", [channelId]);
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
      [channelId, user_id]
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
      [channelId, user_id]
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

// Get messages for a channel
export const getChannelMessages = async (req, res) => {
  const { channelId } = req.params;
  const { limit = 50 } = req.query;

  try {
    const [rows] = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [channelId, parseInt(limit)]);

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
    const [rows] = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?)
         OR (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [userId, currentUserId, currentUserId, userId, parseInt(limit)]);

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
    const [result] = await pool.query(
      `INSERT INTO messages (channel_id, sender_id, recipient_id, content, file_url, file_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [channel_id || null, user_id, recipient_id || null, content, file_url || null, file_name || null]
    );

    const [rows] = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// =============================================
// PRESENCE
// =============================================

// Get all users and their presence
export const getPresence = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT up.*, u.name, u.role
      FROM user_presence up
      JOIN users u ON up.user_id = u.id
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
  const { status, current_channel_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  try {
    await pool.query(
      `INSERT INTO user_presence (user_id, status, last_seen, current_channel_id) 
       VALUES (?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE status = ?, last_seen = NOW(), current_channel_id = ?`,
      [user_id, status || 'online', current_channel_id || null, status || 'online', current_channel_id || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating presence:", err);
    res.status(500).json({ error: "Failed to update presence" });
  }
};

// Get users I can DM (project teammates + all users)
export const getDMUsers = async (req, res) => {
  const { user_id } = req.query;

  try {
    // Get users from same projects + all other users
    const [rows] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.role, 
             COALESCE(up.status, 'offline') as status,
             up.last_seen
      FROM users u
      LEFT JOIN user_presence up ON u.id = up.user_id
      WHERE u.id != ?
      ORDER BY u.name
    `, [user_id]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching DM users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
