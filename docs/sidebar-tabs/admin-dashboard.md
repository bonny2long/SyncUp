# Admin Dashboard

**Route:** `/admin`
**Access:** Admin only
**Sidebar ID:** `admin`

---

## Overview

The Admin Dashboard is the central management hub for the SyncUp platform. It provides 13 tabs for managing users, projects, mentorship, announcements, events, system health, and platform settings.

---

## Tabs

### 1. Overview
- Platform statistics: Total Users, Active Projects, Active Mentors, Total Updates
- ICAA HQ Operations Snapshot: active announcements, unread follow-ups, upcoming events, RSVPs, recent commencements
- 30-day growth chart (AgCharts)
- Recent activity feed
- Quick action buttons

### 2. Users
- Paginated user table with filters (role, status, search)
- Edit user details (name, email, role, cycle, admin access, ban status)
- Delete users, reset passwords
- Profile completeness tracking

### 3. Projects
- View all projects with status filtering (active, completed, planned, seeking, archived)
- Search, archive, delete, or update project status
- Pagination support

### 4. Mentorship
- Session statistics and mentor leaderboard with completion rates
- Pending session requests tracking
- Recent sessions with expandable details

### 5. Governance
- Assign governance positions: President, Vice President, Treasurer, Secretary, Parliamentarian, Tech Lead, Tech Member
- Only residents, alumni, or admins can hold positions
- Remove governance positions

### 6. Cycles
- Manage intern cohorts/cycles (e.g., C-61, C-62)
- Create new cycles with start dates
- Update cycle status (active, commenced, closed)
- Track intern counts per cycle

### 7. Chat
- Lazy-loaded SyncChat component for admin communication

### 8. Announcements
- Create/edit announcements (News, Pinned, Event Promo)
- Set expiration dates, attach polls (Yes/No or Multiple Choice)
- Track read receipts and unread users
- View reader lists

### 9. Events
- Create/edit community events with dates, locations, descriptions
- Enable/disable RSVP functionality
- Track RSVP attendees

### 10. Errors
- View and manage system errors with filtering
- Bulk actions (resolve, ignore, delete)
- Export to CSV or JSON
- Error statistics and recent errors summary

### 11. System
- System health monitoring (database, API status)
- Active user sessions count
- Platform statistics and server info

### 12. Settings
- Platform name, support email, timezone selection
- Feature flags: mentorship, project discovery, maintenance mode, leaderboards
- Maintenance mode with custom message
- Danger zone: clear error logs, reset demo data

### 13. Invitations
- Send admin invitations via email
- Copy invitation links, revoke pending invitations
- Special access invitations for ic.stars members

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform stats (users, projects, sessions, inactive) |
| GET | `/api/admin/platform-stats` | Platform info (totals, version, timezone) |
| GET | `/api/admin/growth-stats` | Daily user/project growth (30 days) |
| GET | `/api/admin/hq-analytics` | ICAA HQ operations snapshot |
| GET | `/api/admin/active-sessions` | Count online users |
| GET/PUT | `/api/admin/settings/maintenance` | Get/set maintenance mode |
| POST | `/api/admin/invitations` | Create invitation |
| GET | `/api/admin/invitations` | List invitations |
| DELETE | `/api/admin/invitations/:id` | Revoke invitation |
| POST | `/api/admin/reset-demo` | Reset and seed demo data (API key protected) |

---

## File Locations

**Client:**
- `client/src/pages/AdminDashboard.jsx` - Main dashboard component
- `client/src/components/admin/InvitationPanel.jsx` - Invitation management

**Server:**
- `server/src/controllers/adminController.js` - Admin API controllers
- `server/src/routes/adminRoutes.js` - Admin routes
- `server/src/controllers/governanceController.js` - Governance management
- `server/src/routes/governanceRoutes.js` - Governance routes
- `server/src/controllers/cyclesController.js` - Cycle management
- `server/src/routes/cyclesRoutes.js` - Cycle routes
