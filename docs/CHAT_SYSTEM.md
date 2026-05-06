# SyncChat (Community Chat)

**Route:** `/chat`
**Access:** Community members (residents, alumni) + commenced interns
**Sidebar ID:** `chat`
**Last Updated:** May 6, 2026

---

## Overview

SyncChat is the community communication layer for SyncUp / ICAA. It provides channel-based group messaging, direct messaging, cohort chat for interns, and the ICAA HQ information strip. Access to SyncChat is granted after an intern is commenced into the community.

---

## Current Features

### 1. Channel System
- **Pre-created Channels**: #general, #announcements, #introductions, #opportunities, #events
- **Custom Channels**: Admins and users can create additional channels
- **Channel Membership**: Users can join and leave channels
- **Channel List**: Left sidebar shows all channels the user is a member of
- **Introductions Feed**: Dedicated view for new member welcome messages

### 2. Direct Messages (1:1)
- **DM List**: Left sidebar shows all community members for 1:1 messaging
- **Online Status**: Green dot for online, yellow for away, gray for offline
- **Click to Chat**: Click any user to start a conversation
- **No Setup Required**: DMs work immediately between any two community members

### 3. ICAA HQ Strip
- **Location**: Appears above the chat messages in SyncChat
- **Pinned Resources**: Quick-access links and resources
- **News Announcements**: Active announcements from admins with read/unread state
- **Upcoming Events**: Events with RSVP functionality
- **Community Welcomes**: Grouped new member welcomes by cycle (e.g., "5 new residents joined Cycle C-60")
- **Scrollable/Capped**: The strip does not take over the whole chat area
- **Detail Modals**: Clicking any announcement, event, or welcome opens a detail modal

### 4. Online Presence
- **Real-time Status**: Shows online/offline/away status for all users
- **Status Indicators**: Green (online), Yellow (away), Gray (offline)
- **Member Panel**: Right sidebar shows all team members grouped by status
- **Auto-update**: Presence updates via polling

### 5. Messaging
- **Message History**: All messages stored in database
- **Timestamps**: Shows relative time (2m ago, 1h ago, etc.)
- **Sender Info**: Shows name and role of message sender
- **File Attachments**: Upload and share files in messages (stored on server)
- **Current User**: Shows "Logged in as [Name]" in chat header

### 6. Announcement Archive
- **Active Announcements**: Browse current announcements
- **Event Archive**: Browse upcoming and past events
- **Read/Unread State**: Announcements disappear from HQ strip when marked read
- **Detail Views**: Click to read full announcement content, event details, or welcome groups

---

## Technical Implementation

### Database Schema (MySQL)

```sql
-- Channels table
CREATE TABLE channels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Channel membership
CREATE TABLE channel_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    channel_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages (channels + DMs)
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
| POST | `/api/chat/channels/:channelId/join` | Join a channel |
| DELETE | `/api/chat/channels/:channelId/leave` | Leave a channel |
| GET | `/api/chat/introductions` | Get introduction/welcome messages |
| GET | `/api/chat/channels/:id/messages` | Get channel messages |
| GET | `/api/chat/dm/:userId` | Get DM conversation |
| POST | `/api/chat/messages` | Send message (channel or DM) |
| GET | `/api/chat/presence` | Get all users' presence |
| POST | `/api/chat/presence` | Update my presence |
| GET | `/api/chat/dm-users` | List users for DM |

### Frontend Structure

```
client/src/pages/Chat/
├── Chat.jsx              # Main chat component
├── CommunityFeed.jsx     # Community feed view
└── CommunityArchive.jsx  # Announcement/event archive

client/src/pages/InternLobby/
├── InternLobby.jsx       # Intern lobby with cohort chat
└── CohortChat.jsx       # Cohort-specific messaging
```

### Key Frontend Components

- **Left Sidebar**: Channel list + DM user list
- **Center Panel**: Chat window with messages + input
- **Right Sidebar**: Community members with online status
- **ICAA HQ Strip**: Announcements, events, and welcomes above chat
- **Archive View**: Browse active announcements and events
- **Cohort Chat**: Intern-to-intern messaging within same cycle (Intern Lobby)
- **Encouragement Board**: Motivational messages from community (in Intern Lobby)

---

## Real-time Updates

- **Polling**: Messages and presence update every 5 seconds via polling
- **Auto-refresh**: No need to manually refresh the page

### Future: Supabase Realtime

When migrating to Supabase for production, polling can be replaced with Supabase Realtime subscriptions for true real-time messaging. See the archive for the original Supabase Realtime implementation plan.

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
- [x] ICAA HQ strip displays announcements, events, welcomes
- [x] Mark announcements as read
- [x] RSVP to events from HQ
- [x] View announcement archive
- [x] Upload files in messages

---

## Known Limitations

1. **No RLS**: Currently no row-level security (fine for internal tool)
2. **Polling**: Uses polling instead of WebSockets (MVP approach)
3. **No Encryption**: Messages stored in plain text
4. **Local File Storage**: File attachments stored on server filesystem

---

## Files

### Backend
- `server/src/controllers/chatController.js` - API controllers (channels, messages, presence, cohort, encouragements)
- `server/src/routes/chatRoutes.js` - API routes
- `server/src/database/chat.sql` - Database schema
- `server/src/database/cohort_messages.sql` - Cohort chat schema
- `server/src/database/intern_cycles.sql` - Intern cycles schema

### Frontend
- `client/src/pages/Chat/Chat.jsx` - Main chat component
- `client/src/pages/Chat/CommunityFeed.jsx` - Community feed
- `client/src/pages/Chat/CommunityArchive.jsx` - Announcement archive
- `client/src/pages/InternLobby/InternLobby.jsx` - Intern lobby with cohort chat
- `client/src/pages/InternLobby/CohortChat.jsx` - Cohort-specific messaging
- `client/src/components/community/EncouragementBoard.jsx` - Encouragement board
- `client/src/utils/api.js` - Chat API functions

### Modified
- `server/src/server.js` - Added chat routes
- `client/src/components/layout/Sidebar.jsx` - Added SyncChat nav item
- `client/src/App.jsx` - Added /chat and /lobby routes
