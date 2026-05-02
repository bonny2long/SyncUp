# Supabase Realtime Implementation Plan

> **Status:** Planned (Not Yet Implemented)
> **Last Updated:** 2026-02-12

---

## Overview

This document outlines the implementation plan for adding real-time features to SyncUp using **Supabase Realtime**. This approach replaces the need for a custom Socket.io server, leveraging Supabase's built-in WebSocket infrastructure.

---

## Why Supabase Realtime?

| Option | Pros | Cons |
|--------|------|------|
| **Supabase Realtime** | Free tier included, no server code, built-in presence | Tied to Supabase |
| Socket.io | Full control, works with any backend | Extra server setup, more complex |
| **Selected:** Supabase | ✅ | - |

---

## Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (Netlify)              │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Supabase    │  │ Chat UI          │  │
│  │ Realtime    │  │ (listening)      │  │
│  └─────────────┘  └─────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│         Supabase                        │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ Realtime    │  │ Database        │  │
│  │ Subscriptions│  │ (messages,     │  │
│  │ + Presence │  │  presence)     │  │
│  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
         ▲
         │
┌────────┴────────┐
│  Railway       │
│  (existing API) │
└─────────────────┘
```

---

## Features to Implement

### Priority 1: Chat System
- [ ] Project-based group chat
- [ ] Direct messages (optional, v2)
- [ ] Message history storage
- [ ] Typing indicators
- [ ] Read receipts (optional)

### Priority 2: Presence
- [ ] Online/offline status
- [ ] "Currently viewing project" status
- [ ] User presence on profile cards

### Priority 3: Enhanced Notifications (Optional)
- [ ] Real-time notification delivery
- [ ] Currently using local polling - could upgrade

---

## Database Schema (Supabase)

### Messages Table

```sql
-- Enable replication on this table in Supabase dashboard

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER REFERENCES users(id),  -- NULL for project chat
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add useful indexes
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Presence Tracking

```sql
CREATE TABLE user_presence (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline',  -- 'online', 'offline', 'away'
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_project_id INTEGER REFERENCES projects(id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
```

---

## Frontend Implementation

### Dependencies

```bash
npm install @supabase/supabase-js
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### File Structure

```
client/src/
├── lib/
│   └── supabase.js          # Supabase client initialization
├── context/
│   └── RealtimeContext.jsx  # Real-time subscriptions context
├── components/
│   └── chat/
│       ├── ChatPanel.jsx   # Main chat component
│       ├── ChatWindow.jsx  # Chat messages display
│       └── ChatInput.jsx   # Message input
└── hooks/
    └── useRealtime.js      # Custom hooks for subscriptions
```

### Key Code Patterns

#### Supabase Client

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Subscribe to Messages

```javascript
// Subscribe to project chat
const channel = supabase
  .channel(`project:${projectId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      setMessages(prev => [...prev, payload.new])
    }
  )
  .subscribe()
```

#### Presence Tracking

```javascript
// Track user presence
const channel = supabase.channel('presence')

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    setOnlineUsers(Object.keys(state))
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: currentUser.id,
        status: 'online'
      })
    }
  })
```

---

## Implementation Steps

### Step 1: Supabase Setup
- [ ] Create tables in Supabase
- [ ] Enable Realtime on tables
- [ ] Configure RLS policies

### Step 2: Frontend Client
- [ ] Install @supabase/supabase-js
- [ ] Create supabase.js client
- [ ] Create RealtimeContext

### Step 3: Chat Components
- [ ] ChatPanel in CollaborationHub
- [ ] Message list with real-time updates
- [ ] Message input with optimistic UI

### Step 4: Presence
- [ ] Online status indicator
- [ ] Track user presence on app load
- [ ] Update presence on navigation

### Step 5: Integration
- [ ] Add Chat tab to CollaborationHub
- [ ] Add presence to project cards
- [ ] Test real-time across browsers

---

## Security Considerations

### Row Level Security (RLS)

```sql
-- Messages: users can only read their project messages
CREATE POLICY "Read project messages"
ON messages FOR SELECT
USING (
  project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  )
);

-- Messages: users can only insert their own messages
CREATE POLICY "Insert own messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());
```

### Presence Security
- [ ] Limit presence updates to once per 5 seconds
- [ ] Validate user_id matches authenticated user

---

## Testing Checklist

- [ ] Open app in two browser windows
- [ ] Send message in one, appears in other instantly
- [ ] User shows as online in both windows
- [ ] Disconnect one window, other shows offline
- [ ] Works on mobile browsers
- [ ] Works after page refresh

---

## Known Limitations

1. **Free Tier Limits**: Supabase free tier has connection limits
2. **Offline Support**: Messages won't queue when offline (v2 feature)
3. **Large Messages**: Keep messages under 10KB for performance

---

## Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Presence](https://supabase.com/docs/guides/realtime/presence)
- [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast)

---

## Timeline Estimate

| Phase | Time |
|-------|------|
| Supabase Setup | 30 min |
| Frontend Client | 30 min |
| Chat Components | 1 hour |
| Presence | 30 min |
| Integration & Testing | 1 hour |
| **Total** | **~3.5 hours** |

---

## Alternative: Socket.io (If Needed Later)

If Supabase Realtime doesn't meet needs, Socket.io implementation backup:

- Server: `server/src/config/socket.js`
- Client: `client/src/context/SocketContext.jsx`
- Requires Railway WebSocket support

*See separate Socket.io Implementation Plan document if needed.*
