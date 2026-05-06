# Intern Lobby

**Route:** `/lobby`
**Access:** Interns only (pre-commencement)
**Sidebar ID:** `lobby`

---

## Overview

The Intern Lobby is a dedicated pre-commencement space for interns who have not yet joined the broader ICAA community. It provides a communication hub where interns can connect with mentors, administrators, and fellow interns in their cohort (cycle). Once an intern is commenced by an admin, they transition to resident status and gain access to SyncChat and the full community.

---

## Features

### Two-Tab Interface

#### 1. Connections Tab (Direct Messaging)
- **Message mentors, administrators, and alumni**
- **Real-time polling** for new messages (every 5 seconds)
- **File attachment support** (images, documents)
- **Online/offline presence indicators**
- **User avatars** with fallback to initials
- **Auto-select user** from URL parameter (`?user=ID`)
- **Conversation starters** suggested when no messages exist
- **File upload** with preview before sending
- **Time formatting:** now, Xm, Xh, or date

#### 2. Cohort Tab (Cohort Chat)
- **Intern-to-intern communication** within the same cycle
- **Displays all members** of the cohort in a sidebar
- **Real-time message polling** (every 5 seconds)
- **Auto-scroll** to latest messages
- **Shows member count**
- **Cohort-specific channel** separate from main SyncChat

### Encouragement Board
- Displays motivational messages from the ICAA community (alumni, residents, mentors)
- **Compact mode** in Intern Lobby (shows 1 message, expandable to view all)
- **Can be hidden** by the user
- **Refresh capability**
- Fetched from `/api/chat/encouragements`

---

## API Endpoints

### Direct Messaging (Connections Tab)
| Function | Method | Endpoint | Purpose |
|----------|---------|----------|---------|
| `fetchDMMessages` | GET | `/api/chat/dm/:userId?currentUserId=X` | Fetch DM conversation with a specific user |
| `sendMessage` | POST | `/api/chat/messages` | Send a DM (supports file attachments) |
| `fetchDMUsers` | GET | `/api/chat/dm-users` | Get list of users available for DM (scope="lobby") |

### Cohort Chat (Cohort Tab)
| Function | Method | Endpoint | Purpose |
|----------|---------|----------|---------|
| `fetchCohortMessages` | GET | `/api/chat/cohort/:cycleId/messages` | Get messages from intern cohort channel |
| `sendCohortMessage` | POST | `/api/chat/cohort/:cycleId/messages` | Send message to cohort channel |
| `fetchCohortUsers` | GET | `/api/users/cohort/:cycleId` | Get all interns in a specific cycle |

### Supporting APIs
| Function | Method | Endpoint | Purpose |
|----------|---------|----------|---------|
| `fetchEncouragements` | GET | `/api/chat/encouragements` | Get community encouragement messages |
| `createEncouragement` | POST | `/api/chat/encouragements` | Post new encouragement |
| `deleteEncouragement` | DELETE | `/api/chat/encouragements/:id` | Remove encouragement |
| `uploadFile` | POST | `/api/upload/upload` | Upload file attachments for DMs |

---

## Database Schema

```sql
-- Intern cycles table
CREATE TABLE intern_cycles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cycle_name VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'commenced', 'closed'),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table has intern_cycle_id foreign key
-- users: ... intern_cycle_id INT NULL (links to intern_cycles.id)

-- Cohort messages (separate from general chat)
CREATE TABLE cohort_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cycle_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Encouragements
CREATE TABLE encouragements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- General messages table (for DMs)
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
```

---

## File Locations

### Frontend
| File | Path |
|------|------|
| Main Page | `client/src/pages/InternLobby/InternLobby.jsx` |
| Cohort Chat | `client/src/pages/InternLobby/CohortChat.jsx` |
| EncouragementBoard | `client/src/components/community/EncouragementBoard.jsx` |
| RoleBadge | `client/src/components/shared/RoleBadge.jsx` |
| API Utilities | `client/src/utils/api.js` |

### Backend
| File | Path |
|------|------|
| Chat Controller | `server/src/controllers/chatController.js` |
| Chat Routes | `server/src/routes/chatRoutes.js` |
| Users Controller | `server/src/controllers/usersController.js` |
| Users Routes | `server/src/routes/usersRoutes.js` |
| Database Schema | `server/src/database/intern_cycles.sql` |

---

## Implementation Details

### Server-Side Logic (chatController.js)
- **getDMUsers:** Filters users based on role and commencement status
  - Pre-commencement interns: see alumni, residents, admins
  - Others in "lobby" scope: see interns with `has_commenced = FALSE`
- **getCohortMessages:** Fetches from `cohort_messages` table, limited to 200 messages
- **sendCohortMessage:** Validates sender belongs to the cycle before allowing message

### Client-Side State Management
- Uses `UserContext` for current user data (role, cycle, `intern_cycle_id`)
- Polling intervals for real-time message updates
- Local state for messages, active DM user, file uploads
- Toast notifications for user feedback

### Commencement Flow
1. Intern starts in the Intern Lobby (pre-commencement)
2. Admin reviews and commences the intern via Admin Dashboard
3. Intern's role changes from `intern` to `resident`
4. Intern gains access to SyncChat and full community features
5. Welcome message posted to #introductions channel
6. Intern Lobby remains accessible but SyncChat becomes available

### User Role Awareness
- Pre-commencement interns see only support staff (alumni, residents, admins)
- Commenced community members see other community members
- Role-based filtering via `scope="lobby"` parameter

### User Experience Features
- **Responsive design** with sidebar for connections list
- **File upload** with preview before sending
- **Presence indicators** for online/offline status
- **Auto-scroll** to latest messages in cohort chat
- **Conversation starters** when no messages exist
