# SyncUp - Technical Summary

## Project Overview

SyncUp is a full-stack intern collaboration and mentorship platform that tracks professional growth through an evidence-based Skill Signal pipeline. The platform connects interns, residents, mentors, and alumni through project collaboration, structured mentorship sessions, and community communication.

## Architecture

### Frontend Architecture (React + Vite)

- **React 19** with functional components and hooks
- **Vite 7** for fast development and builds
- **Tailwind CSS v4** for responsive styling
- **Recharts** and **AG Charts** for data visualization
- **React Context** for state management (UserContext, ToastContext, ThemeContext, OnboardingContext)
- **React Router DOM** for navigation
- **Lucide React** for icons

### Backend Architecture (Node.js + Express)

- **Express 5** RESTful API
- **MySQL 8** database with connection pooling
- **Swagger/OpenAPI** for API documentation (available at `/api-docs`)
- **Express Rate Limiting** for API protection
- **Helmet** for security headers
- **Multer** for file upload handling
- **Express Validator** for request validation

---

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DB connectivity |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration (invitation required) |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | User logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:userId/profile` | Get user profile |
| GET | `/api/users/:userId/skill-inventory` | Get user skill inventory with signals |
| GET | `/api/users/:userId/activity-timeline` | Get user activity timeline |
| PUT | `/api/users/:userId/profile` | Update user profile |
| PUT | `/api/users/:userId/password` | Change password |
| DELETE | `/api/users/:userId` | Delete user account |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/skills` | Get all skills used in projects |
| POST | `/api/projects` | Create project |
| POST | `/api/projects/:id/skills` | Attach skills to project |
| POST | `/api/projects/:projectId/members` | Add project member |
| DELETE | `/api/projects/:projectId/members` | Remove project member |
| PUT | `/api/projects/:id/status` | Update project status |
| PUT | `/api/projects/:id/links` | Update project links |
| GET | `/api/projects/:id/skills` | Get project skills |
| GET | `/api/projects/user/:userId` | Get user's projects |
| GET | `/api/projects/:projectId/portfolio-details` | Get portfolio details |
| GET | `/api/projects/:projectId/metrics` | Get project metrics |
| GET | `/api/projects/:projectId/discussions` | Get project discussions |
| POST | `/api/projects/:projectId/discussions` | Create project discussion |
| POST | `/api/projects/:projectId/join-request` | Submit join request |
| GET | `/api/projects/:projectId/requests` | Get project join requests |
| GET | `/api/projects/requests/user/:userId` | Get user's project requests |
| GET | `/api/projects/:projectId/join-request/status/:userId` | Check join request status |
| PUT | `/api/projects/:projectId/requests/:requestId/approve` | Approve join request |
| PUT | `/api/projects/:projectId/requests/:requestId/reject` | Reject join request |
| GET | `/api/projects/:id/team-momentum` | Get team momentum |

### Progress Updates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress_updates` | Get all progress updates |
| POST | `/api/progress_updates` | Create progress update |
| PUT | `/api/progress_updates/:id` | Update progress update |
| DELETE | `/api/progress_updates/:id` | Delete progress update |
| GET | `/api/progress_updates/project/:projectId` | Get updates for a project |

### Mentorship
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentorship/mentors` | Get all mentors |
| GET | `/api/mentorship/mentors/available` | Get available mentors |
| GET | `/api/mentorship/mentor/:id/details` | Get mentor details |
| GET | `/api/mentorship/mentors/project` | Get project mentors |
| GET | `/api/mentorship/sessions` | Get all sessions |
| POST | `/api/mentorship/sessions` | Create session request |
| PUT | `/api/mentorship/sessions/:id` | Update session status |
| PUT | `/api/mentorship/sessions/:id/details` | Update session details |
| PUT | `/api/mentorship/sessions/:id/reschedule` | Reschedule session |
| DELETE | `/api/mentorship/sessions/:id` | Delete session |
| GET | `/api/mentorship/sessions/:id/skills` | Get session skills |
| GET | `/api/mentorship/sessions/intern/:internId` | Get intern's sessions |
| GET | `/api/mentorship/sessions/mentor/:mentorId` | Get mentor's sessions |
| GET | `/api/mentorship/mentors/:id/availability` | Get mentor availability |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | Get all skills |
| GET | `/api/skills/user/:id/momentum` | Get user skill momentum |
| GET | `/api/skills/user/:id/distribution` | Get skill distribution |
| GET | `/api/skills/user/:id/activity` | Get skill activity |
| GET | `/api/skills/user/:id/summary` | Get skill summary |
| GET | `/api/skills/user/:id/recent` | Get recent skills |
| GET | `/api/skills/user/:id/signals` | Get user skill signals with validation counts |
| POST | `/api/skills/:signalId/validate` | Add validation (upvote/endorsement) |
| DELETE | `/api/skills/:signalId/validate` | Remove validation |
| GET | `/api/skills/:signalId/validations` | Get validation counts |
| GET | `/api/skills/user/:userId/validations` | Get user's received validations |
| GET | `/api/skills/user/:userId/has-validated` | Check which signals user validated |
| GET | `/api/skills/verifications/pending` | Get pending verifications |
| POST | `/api/skills/verifications/:id/verify` | Verify a skill claim |
| POST | `/api/skills/verifications/:id/challenge` | Challenge a skill claim |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/channels` | Get channels |
| POST | `/api/chat/channels` | Create channel |
| POST | `/api/chat/channels/:channelId/join` | Join channel |
| DELETE | `/api/chat/channels/:channelId/leave` | Leave channel |
| GET | `/api/chat/introductions` | Get introduction messages |
| GET | `/api/chat/channels/:channelId/messages` | Get channel messages |
| GET | `/api/chat/dm/:userId` | Get DM messages |
| POST | `/api/chat/messages` | Send message |
| GET | `/api/chat/presence` | Get user presence |
| POST | `/api/chat/presence` | Update presence |
| GET | `/api/chat/dm-users` | Get DM users |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements` | Get announcements |
| POST | `/api/announcements` | Create announcement |
| POST | `/api/announcements/:id/read` | Mark announcement read |
| PUT | `/api/announcements/:id` | Update announcement |
| DELETE | `/api/announcements/:id` | Delete announcement |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get events |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| POST | `/api/events/:id/rsvp` | RSVP to event |
| DELETE | `/api/events/:id` | Delete event |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/:userId` | Get user notifications |
| GET | `/api/notifications/:userId/unread-count` | Get unread count |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/:userId/read-all` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/badges` | Get all badges |
| GET | `/api/badges/users/:userId` | Get user's earned badges |
| POST | `/api/badges/users/:userId/check` | Check/award badges |
| GET | `/api/badges/users/:userId/stats` | Get user stats for badge criteria |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/upload` | Upload file (chat attachments) |
| POST | `/api/upload/avatar` | Upload avatar |
| GET | `/api/upload/avatar/:userId` | Get avatar |
| DELETE | `/api/upload/avatar/:userId` | Delete avatar |

### Errors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/errors` | Get all errors (paginated) |
| GET | `/api/errors/stats` | Get error statistics |
| GET | `/api/errors/recent` | Get recent errors |
| POST | `/api/errors` | Report error |
| PUT | `/api/errors/:id` | Update error status |
| DELETE | `/api/errors/:id` | Delete error |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/active-sessions` | Count online users |
| GET | `/api/admin/stats` | Platform stats (users, projects, sessions, inactive) |
| GET | `/api/admin/platform-stats` | Platform info (total counts, version, timezone) |
| GET | `/api/admin/growth-stats` | Daily user/project growth (30 days) |
| GET | `/api/admin/settings/maintenance` | Get maintenance mode status |
| PUT | `/api/admin/settings/maintenance` | Toggle maintenance mode |
| POST | `/api/admin/invitations` | Create invitation |
| GET | `/api/admin/invitations` | List invitations |
| DELETE | `/api/admin/invitations/:id` | Revoke invitation |
| GET | `/api/admin/invitations/validate` | Validate invitation token |
| POST | `/api/admin/register` | Register with invitation |
| POST | `/api/admin/reset-demo` | Reset and seed demo data (API key protected) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/projects/active` | Active projects |
| GET | `/api/analytics/updates/weekly` | Weekly updates |
| GET | `/api/analytics/mentors/engagement` | Mentor engagement |
| GET | `/api/analytics/correlation/mentorship-growth` | Mentorship-growth correlation |
| GET | `/api/analytics/correlation/effective-pairings` | Effective skill pairings |
| GET | `/api/analytics/correlation/engagement-loops` | Engagement loops |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('intern', 'mentor', 'resident', 'alumni', 'admin') NOT NULL,
  bio TEXT,
  headline VARCHAR(255),
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  personal_site_url VARCHAR(500),
  featured_project_id INT,
  has_commenced BOOLEAN DEFAULT FALSE,
  cycle VARCHAR(50),
  profile_pic VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  -- Privacy settings
  profile_visibility ENUM('public', 'private') DEFAULT 'public',
  show_email BOOLEAN DEFAULT FALSE,
  show_projects BOOLEAN DEFAULT TRUE,
  show_skills BOOLEAN DEFAULT TRUE,
  accept_mentorship BOOLEAN DEFAULT TRUE,
  auto_accept_teammates BOOLEAN DEFAULT FALSE,
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  notify_join_requests BOOLEAN DEFAULT TRUE,
  notify_mentions BOOLEAN DEFAULT TRUE,
  notify_session_reminders BOOLEAN DEFAULT TRUE,
  notify_project_updates BOOLEAN DEFAULT TRUE,
  notify_weekly_summary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL,
  status ENUM('planned', 'active', 'completed', 'archived', 'seeking_members') DEFAULT 'planned',
  visibility ENUM('public', 'private') DEFAULT 'public',
  github_url VARCHAR(500),
  live_url VARCHAR(500),
  case_study_problem TEXT,
  case_study_solution TEXT,
  case_study_tech_stack TEXT,
  case_study_outcomes TEXT,
  case_study_artifact_url VARCHAR(500),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Core Tables
| Table | Purpose |
|-------|---------|
| `project_members` | User-project membership (project_id, user_id, role, joined_at) |
| `project_skills` | Skills associated with projects (project_id, skill_id) |
| `project_discussions` | Project-specific discussions |
| `project_join_requests` | Join request management |
| `progress_updates` | Progress updates (project_id, user_id, content) |
| `skills` | Master skill catalog (skill_name, category) |
| `user_skill_signals` | Append-only signals (user_id, skill_id, source_type, source_id, signal_type, weight) |
| `skill_validations` | Peer upvotes and mentor endorsements |
| `skill_verifications` | Team member skill claim verification |
| `mentorship_sessions` | Mentorship sessions (intern_id, mentor_id, topic, details, session_focus, scheduled_at, status) |
| `mentorship_session_skills` | Skills practiced in sessions |
| `notifications` | In-app notifications |
| `channels` | Chat channels |
| `channel_members` | Channel membership |
| `messages` | Chat messages (channel + DM) |
| `user_presence` | Online/offline/away status |
| `announcements` | Org-wide announcements |
| `announcement_reads` | Read tracking for announcements |
| `events` | Community events |
| `event_rsvps` | Event RSVPs |
| `badges` | Badge definitions (name, description, icon, category) |
| `user_badges` | Earned badges per user |
| `system_errors` | Error tracking |
| `platform_settings` | Key-value settings |
| `admin_invitations` | Invitation-based registration |

---

## Skill Signal Pipeline (A -> B -> C -> D)

### A - Project Context
Skills must be tied to concrete project scope. Project skills are explicitly defined in `project_skills` table. Project metadata `skill_ideas` is informational only and does NOT generate signals.

### B - Mentorship Session
Mentorship does NOT emit skill signals by default. Only explicit skill verification during session completion generates signals. This prevents mentorship from being a loophole for skill inflation.

### C - Progress Updates
When a progress update is posted, signals are emitted for all project skills via `emitSkillSignals()`. If no project_skills exist, no signals are emitted.

### D - Analytics Layer
All skill charts read exclusively from `user_skill_signals`. Distribution, momentum, and activity are derived from signals. No direct writes to aggregated tables.

### Signal Types and Weights
- **joined**: Weight for joining a project
- **update**: Weight for posting progress updates
- **completed**: Weight for completing milestones
- **validated**: Higher weight for mentor-verified skills

### Guardrails
- Only `skillSignalService` can write to `user_skill_signals`
- All controllers must use `emitSkillSignals` function
- Append-only design prevents data drift
- Uniqueness constraints prevent duplicate signals
- See [MENTORSHIP_GUARDRAILS.md](MENTORSHIP_GUARDRAILS.md) for full constraint documentation

---

## Services

| Service | Purpose |
|---------|---------|
| `skillSignalService.js` | Centralized skill signal emission and momentum calculation |
| `badgeService.js` | Badge eligibility checking and awarding |
| `checkBadges.js` | Badge checking helper |
| `notificationService.js` | Notification creation and delivery |

---

## Middleware

| Middleware | Purpose |
|------------|---------|
| `maintenanceMode.js` | Blocks non-admin requests when maintenance mode is active |

---

## Security Features

- Password hashing
- Rate limiting (tiered: general, strict, create, sensitive, admin)
- Helmet security headers
- Input validation with express-validator
- SQL injection prevention via parameterized queries
- Invitation-based registration
- Role-based access control

---

## Known Limitations

- Local file storage (production would use cloud storage)
- Polling-based real-time updates (production would use WebSockets)
- No email notifications (user preference columns exist but no email service)
- No third-party OAuth (email/password only)
- Azure SQL driver installed but commented out; currently using MySQL
