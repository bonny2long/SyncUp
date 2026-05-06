# SyncChat (Community Chat)

**Route:** `/chat`
**Access:** Community members (residents, alumni, commenced interns)
**Sidebar ID:** `chat`

---

## Overview

SyncChat is the community communication layer for SyncUp. It provides channel-based group messaging, direct messaging, and the ICAA HQ information strip. Access is granted after an intern is commenced into the community.

---

## Features

### Channel System
- Pre-created channels: #general, #announcements, #introductions, #opportunities, #events
- Custom channels: Admins and users can create additional channels
- Channel membership: Users can join and leave channels
- Channel list in left sidebar shows joined channels
- Introductions feed: Dedicated view for new member welcome messages

### Direct Messages (1:1)
- DM list in left sidebar shows all community members
- Online status indicators: Green (online), Yellow (away), Gray (offline)
- Click any user to start a conversation
- No setup required between community members

### ICAA HQ Strip
- Located above chat messages in SyncChat
- Pinned resources and quick-access links
- Active announcements with read/unread state
- Upcoming events with RSVP functionality
- Community welcomes: Grouped new member welcomes by cycle
- Scrollable/capped to prevent dominating the chat area
- Detail modals for announcements, events, and welcome groups

### Online Presence
- Real-time status: online/offline/away for all users
- Status indicators: Green (online), Yellow (away), Gray (offline)
- Member panel in right sidebar grouped by status
- Auto-update via polling (5-second intervals)

### Messaging
- Message history stored in database
- Timestamps: Relative time display (2m ago, 1h ago, etc.)
- Sender info: Name and role displayed
- File attachments: Upload and share files in messages (stored on server)
- Current user displayed in chat header

### Announcement Archive
- Browse active announcements
- Event archive: Upcoming and past events
- Read/unread state tracking
- Detail views for announcements, events, and welcome groups

---

## API Endpoints

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

---

## File Locations

**Client:**
- `client/src/pages/Chat/Chat.jsx` - Main chat component
- `client/src/pages/Chat/CommunityFeed.jsx` - Community feed view
- `client/src/pages/Chat/CommunityArchive.jsx` - Announcement/event archive
- `client/src/utils/api.js` - Chat API functions

**Server:**
- `server/src/controllers/chatController.js` - API controllers
- `server/src/routes/chatRoutes.js` - API routes

---

## Technical Notes

- **Polling:** Messages and presence update every 5 seconds
- **Future:** Polling can be replaced with Supabase Realtime for true real-time messaging
- **Storage:** File attachments stored on server filesystem (local storage)
- **No RLS:** No row-level security (acceptable for internal tool)
