# SyncUp - Team Chat System Documentation

**Last Updated:** February 13, 2026

---

## Overview

Team Chat is a full-featured messaging system built into SyncUp, allowing team members to communicate via channels and direct messages. It follows a Microsoft Teams/Discord-like structure with global channels and 1:1 direct messages.

---

## Current Features (Completed)

### 1. Channel System
- **Global Channels**: Users can create custom channels (e.g., #frontend, #backend, #design)
- **Default Channels**: #general and #announcements are pre-created
- **Channel List**: Left sidebar shows all available channels
- **Create Channel**: Click the + button to create a new channel

### 2. Direct Messages (1:1)
- **DM List**: Left sidebar shows all team members for 1:1 messaging
- **Online Status**: Green dot for online, gray for offline
- **Click to Chat**: Click any user to start a conversation
- **No Setup Required**: DMs work immediately between any two users

### 3. Online Presence
- **Real-time Status**: Shows online/offline status for all users
- **Status Indicators**: Green (online), Gray (offline), Yellow (away)
- **Member Panel**: Right sidebar shows all team members grouped by status
- **Auto-update**: Presence updates every 5 seconds via polling

### 4. Messaging
- **Message History**: All messages stored in database
- **Timestamps**: Shows relative time (2m ago, 1h ago, etc.)
- **Sender Info**: Shows name and role of message sender
- **Current User**: Shows "Logged in as [Name]" in chat header

### 5. Real-time Updates
- **Polling**: Messages and presence update every 5 seconds
- **Auto-refresh**: No need to manually refresh the page

---

## Technical Implementation

### Database Schema (MySQL)

```sql
-- Channels table
CREATE TABLE channels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by INT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (channels + DMs)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    channel_id INT,
    sender_id INT NOT NULL,
    recipient_id INT,
    content TEXT NOT NULL,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User presence table
CREATE TABLE user_presence (
    user_id INT PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_channel_id INT
);
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/channels` | List all channels |
| POST | `/api/chat/channels` | Create new channel |
| GET | `/api/chat/channels/:id/messages` | Get channel messages |
| GET | `/api/chat/dm/:userId` | Get DM conversation |
| POST | `/api/chat/messages` | Send message (channel or DM) |
| GET | `/api/chat/presence` | Get all users' presence |
| POST | `/api/chat/presence` | Update my presence |
| GET | `/api/chat/dm-users` | List users for DM |

### Frontend Structure

```
client/src/pages/Chat/
└── Chat.jsx          # Main chat component (all-in-one)
```

### Key Frontend Components

- **Left Sidebar**: Channel list + DM user list
- **Center Panel**: Chat window with messages + input
- **Right Sidebar**: Team members with online status

---

## Next Steps (Future Enhancements)

### High Priority

1. **File Attachments**
   - Implement file upload functionality
   - Store files locally or use cloud storage (Cloudinary, S3)
   - Display file attachments in messages

2. **Thread Replies**
   - Add reply-to-message functionality
   - Show thread replies under parent message
   - Thread notification support

### Medium Priority

3. **@Mentions**
   - Parse @username in messages
   - Highlight mentions in messages
   - Notification for mentions

4. **Message Reactions**
   - Add emoji reactions to messages
   - Show reaction counts

5. **Typing Indicators**
   - Show "User is typing..." when composing

### Lower Priority

6. **Message Search**
   - Search messages by content
   - Filter by channel/user

7. **Pinned Messages**
   - Pin important messages to channel
   - View pinned messages panel

8. **Group DMs**
   - Create group conversations with multiple users

---

## Migration to Supabase (Future)

When migrating to Supabase for production:

1. **Keep Same Schema**: The current schema is Supabase-compatible
2. **Enable Realtime**: Add tables to Supabase Realtime publication
3. **Replace Polling**: Swap polling for Supabase Realtime subscriptions
4. **Add RLS Policies**: Implement Row Level Security for security
5. **File Storage**: Use Supabase Storage for attachments

### Supabase Realtime Code Pattern

```javascript
// Instead of polling, use:
const channel = supabase
  .channel(`project:${projectId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, payload => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

---

## Testing Checklist

- [x] Create new channel
- [x] Send message to channel
- [x] Switch between channels
- [x] Send DM to user
- [x] See online/offline status
- [x] Messages persist after refresh
- [x] Presence updates correctly
- [x] Chat header shows current user

---

## Known Limitations

1. **No RLS**: Currently no row-level security (fine for internal tool)
2. **Polling**: Uses polling instead of WebSockets (MVP approach)
3. **No Encryption**: Messages stored in plain text
4. **File Upload**: UI exists but backend not implemented

---

## Files Changed

### New Files Created

- `server/src/database/chat.sql` - Database schema
- `server/src/controllers/chatController.js` - API controllers
- `server/src/routes/chatRoutes.js` - API routes
- `client/src/pages/Chat/Chat.jsx` - Main chat component
- `docs/CHAT_SYSTEM.md` - This documentation

### Modified Files

- `server/src/server.js` - Added chat routes
- `client/src/utils/api.js` - Added chat API functions
- `client/src/components/layout/Sidebar.jsx` - Added Team Chat nav item
- `client/src/App.jsx` - Added /chat route

---

## Support

For issues or questions about the Team Chat system:
1. Check browser console for error logs
2. Verify database tables exist
3. Check API endpoints return correct data
4. Ensure user is logged in

---

*Built with ❤️ for SyncUp Team*
