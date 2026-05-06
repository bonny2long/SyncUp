# SyncUp / ICAA

The Intern Collaboration and Mentorship Reflection System

SyncUp is a full-stack professional community platform connecting interns, residents, mentors, and alumni through real-world project collaboration, structured mentorship, and evidence-based skill tracking.

---

## Documentation Structure

Documentation is organized by **sidebar tabs** (one doc per tab) and **technical references**:

### Sidebar Tab Documentation (`sidebar-tabs/`)
| Tab | File | Description |
|-----|------|-------------|
| Admin Dashboard | `sidebar-tabs/admin-dashboard.md` | Platform management and settings |
| Collaboration Hub | `sidebar-tabs/collaboration-hub.md` | Project collaboration workspace |
| SyncChat | `sidebar-tabs/syncchat.md` | Community chat and messaging |
| Member Directory | `sidebar-tabs/member-directory.md` | Browse member profiles |
| Opportunity Board | `sidebar-tabs/opportunity-board.md` | Job and opportunity sharing |
| Mentorship Bridge | `sidebar-tabs/mentorship-bridge.md` | Mentorship session management |
| Project Portfolio | `sidebar-tabs/project-portfolio.md` | Professional project showcase |
| Intern Lobby | `sidebar-tabs/intern-lobby.md` | Pre-commencement space |
| Skill Tracker | `sidebar-tabs/skill-tracker.md` | Evidence-based skill analytics |

### Technical References
| Document | Purpose |
|----------|---------|
| [TECHNICAL_SUMMARY.md](TECHNICAL_SUMMARY.md) | API endpoints and schema reference |
| [architecture.md](architecture.md) | Skill Signal pipeline (A->B->C->D) specification |
| [CHAT_SYSTEM.md](CHAT_SYSTEM.md) | SyncChat system documentation |

### Setup Guides
| Document | Purpose |
|----------|---------|
| [README_client.md](README_client.md) | Frontend setup and development guide |
| [README_server.md](README_server.md) | Backend setup and development guide |

---

## The Vision

Professional growth should be a mirror of real activity, not a manual checklist. SyncUp derives skills from demonstrated work -- projects, progress updates, and verified mentorship sessions -- so that every skill displayed is backed by verifiable evidence.

### Core Principles

- **Evidence-Based Growth**: Skills are earned through demonstrated work, not self-reported.
- **Integrity First**: Guardrails prevent conceptual drift (e.g., career advice does not boost technical skills).
- **Decoupled Hubs**: Mentorship, projects, and community chat are independent but intersecting systems.
- **Credential-Focused**: Profiles and portfolios serve as professional credentials for members to showcase their work.

---

## Platform Layers

### 1. Intern Lobby
Pre-commencement space for interns. Interns here have not yet joined the broader community. They can explore mentorship, view projects, and prepare for their transition.

### 2. SyncChat (Community Layer)
Post-commencement community communication hub:
- **Channels**: #general, #announcements, #introductions, #opportunities, #events, and custom channels
- **Direct Messages**: 1:1 private messaging between any community members
- **ICAA HQ**: Pinned announcements, upcoming events, and new member welcomes in a scrollable strip
- **File Attachments**: Upload and share files in messages
- **Presence**: Online/offline/away status with real-time indicators
- **Announcement Archive**: Browse active and past announcements with read/unread tracking

### 3. Collaboration Hub (Work Layer)
Project-based collaboration workspace:
- **Project Discovery**: Browse, filter, and join projects by status and skills
- **Project Creation**: Create projects with title, description, visibility, skills, GitHub/live URLs, and case study fields
- **Join Requests**: Submit and manage join requests; project owners approve/decline
- **Progress Feed**: Post, edit, and delete progress updates per project
- **Project Discussions**: Dedicated discussion threads inside project detail modals (Overview, Activity, Discussion tabs)
- **Team Dashboard**: Team-wide skill coverage, top contributors, achievements, key insights, and activity feed
- **Project Cards**: Show status, team count, update count, 7-day activity mini-bars, member chips

### 4. Mentorship Bridge
End-to-end mentorship matching and session management:
- **Mentor Directory**: Search mentors, view profiles, bios, availability, and session stats
- **Session Requests**: Pick a mentor, set topic/details/date-time, and submit
- **Session Management**: Filter by status (pending/accepted/completed/declined/rescheduled), inline edit, reschedule, delete
- **Skill Verification**: Mentors verify specific skills during session completion (high-weight skill signals)
- **Mentor Leaderboard**: Rankings based on completed sessions
- **Session Chat**: Dedicated chat within individual mentorship sessions

### 5. Skill Tracker (Credential Layer)
Read-only analytics derived from real activity. No manual ratings or gamification:
- **Skill Distribution**: Weighted signals per skill; auto-insight highlights dominant skill or balanced focus
- **Skill Momentum**: Week-over-week change for top skills; shows increases, decreases, or steady progress
- **Activity Sources**: Stacked weekly bars showing which source (projects, updates, mentorship) drove activity
- **Skill Signals**: View all signals with source, weight, and timestamp
- **Peer Validations**: Team members can upvote/endorse skill signals
- **Skill Verifications**: Team member skill claim workflow (verify/challenge)

### 6. Project Portfolio
Public-facing project showcase:
- **Featured Project**: Highlight your best work at the top (manual selection)
- **Case Studies**: Problem, solution, tech stack, outcomes, artifact URL
- **Project Links**: GitHub and live/demo URLs on project cards and detail views
- **Project Metrics**: Activity metrics and team composition per project

### 7. User Profiles
Professional member credential pages:
- **Identity**: Name, role badge, cycle, professional headline
- **Credential Links**: GitHub, LinkedIn, personal site URLs
- **Featured Project**: Manually selected project showcase
- **Skills**: Skill distribution with signal counts and validation status
- **Projects**: Active and completed project list with links
- **Badges**: Earned achievement badges
- **Mentorship Stats**: Sessions completed, residents/interns helped, projects advised (for mentors/residents)
- **Credential Readiness**: Checklist showing profile completeness (headline, links, cycle, projects, case study)

### 8. Admin Dashboard
Platform administration:
- **Overview**: Platform statistics, growth charts, recent activity, alerts
- **Users**: Paginated table with filters (role, status, commenced), search, edit, delete, credential completion percentage
- **Projects**: All projects with status filters, actions
- **HQ Management**: Create/edit/deactivate announcements and events, view read tracking and RSVP rosters
- **Mentorship Analytics**: Session statistics, completion rates, mentor leaderboard
- **Error Tracking**: Logged errors with filters, bulk actions, export
- **System Health**: Database, API, and system status
- **Settings**: Platform config, feature flags, maintenance mode
- **Invitations**: Create, view, revoke invitation-based registrations

---

## Roles and Access

| Role | Access |
|------|--------|
| **Intern** | Intern Lobby, Collaboration Hub, Mentorship Bridge, Skill Tracker, Project Portfolio |
| **Resident** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker |
| **Alumni** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker |
| **Mentor** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker |
| **Admin** | Admin Dashboard (full access), Project Portfolio |

### Commencement Flow
Interns start in the Intern Lobby. When an admin commences an intern, they transition to resident status, gain access to SyncChat, and a welcome message is posted to #introductions.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, Tailwind CSS v4, Recharts, AG Charts, Lucide React |
| Backend | Node.js, Express 5, MySQL 8 |
| State/Auth | React Context + LocalStorage |
| Charts | Recharts, AG Charts Community |
| PDF | jsPDF + jsPDF-AutoTable |
| API Docs | Swagger/OpenAPI |

---

## Architecture: Signal Pipeline

SyncUp uses an A -> B -> C -> D evidence-based signal pipeline:

- **A (Project Context)**: Skills are explicitly defined in `project_skills`. Project metadata `skill_ideas` is informational only and never generates signals.
- **B (Mentorship)**: Mentorship does NOT emit skill signals by default. Only explicit skill verification during session completion generates signals.
- **C (Progress Updates)**: Posting a progress update emits signals for all project skills via `emitSkillSignals`.
- **D (Analytics)**: All skill charts read exclusively from `user_skill_signals` (append-only, single source of truth).

See [architecture.md](architecture.md) for the full pipeline specification.

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles, commencement, cycle, profile links, privacy settings |
| `projects` | Projects with status, visibility, GitHub/live URLs, case study fields |
| `project_members` | User-project membership mapping |
| `project_skills` | Skills associated with projects |
| `project_discussions` | Project-specific discussion threads |
| `project_join_requests` | Join request management |
| `progress_updates` | Progress/status updates on projects |
| `skills` | Master skill catalog |
| `user_skill_signals` | Append-only activity signals (single source of truth) |
| `skill_validations` | Peer upvotes and mentor endorsements |
| `skill_verifications` | Team member skill claim verification |
| `mentorship_sessions` | Scheduled mentorship sessions |
| `mentorship_session_skills` | Skills practiced in sessions |
| `notifications` | In-app notifications |
| `channels` | Chat channels |
| `channel_members` | Channel membership |
| `messages` | Chat messages (channel + DM) |
| `user_presence` | Online/offline status |
| `announcements` | Org-wide announcements |
| `announcement_reads` | Read tracking for announcements |
| `events` | Community events |
| `event_rsvps` | Event RSVPs |
| `badges` | Badge definitions (14+ badges) |
| `user_badges` | Earned badges per user |
| `system_errors` | Error tracking and reporting |
| `platform_settings` | Key-value platform settings |
| `admin_invitations` | Invitation-based registration |

---

## Getting Started

### Prerequisites

- Node.js v20+
- MySQL 8.0+

### Installation

```bash
git clone https://github.com/your-username/SyncUp.git
cd SyncUp

# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
# Edit client/.env and server/.env (see README_client.md and README_server.md)

# Start development servers
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

### Environment Variables

**Client** (`client/.env`):
```
VITE_API_BASE=http://localhost:5000/api
```

**Server** (`server/.env`):
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=syncup_local
PORT=5000
```

---

## Documentation (Legacy Reference)

| Document | Purpose |
|----------|---------|
| [REMAINING_FEATURES.md](REMAINING_FEATURES.md) | Feature roadmap and priority list |
| [REMAINING_UX_POLISH.md](REMAINING_UX_POLISH.md) | UX polish tasks |
| [CODEBASE_CLEANUP_PLAN.md](CODEBASE_CLEANUP_PLAN.md) | Codebase cleanup plan |
| [MENTORSHIP_GUARDRAILS.md](MENTORSHIP_GUARDRAILS.md) | Mentorship system constraints and design rules |
| [ICAA_FINAL_PLAN.md](ICAA_FINAL_PLAN.md) | ICAA production roadmap |
| [ICAA_WORKLOG_2026-05-01.md](ICAA_WORKLOG_2026-05-01.md) | Worklog for 2026-05-01 |
| [archive/](archive/) | Historical session summaries and superseded plans |

**Note:** Files with "icaa" in the name are preserved as requested and not modified.

---

## Platform Layers

### 1. Intern Lobby
Pre-commencement space for interns. Interns here have not yet joined the broader community. They can explore mentorship, view projects, and prepare for their transition.

### 2. SyncChat (Community Layer)
Post-commencement community communication hub:
- **Channels**: #general, #announcements, #introductions, #opportunities, #events, and custom channels
- **Direct Messages**: 1:1 private messaging between any community members
- **ICAA HQ**: Pinned announcements, upcoming events, and new member welcomes in a scrollable strip
- **File Attachments**: Upload and share files in messages
- **Presence**: Online/offline/away status with real-time indicators
- **Announcement Archive**: Browse active and past announcements with read/unread tracking
- **Cohort Chat**: Intern-to-intern messaging within the same cycle (Intern Lobby)

### 3. Collaboration Hub (Work Layer)
Project-based collaboration workspace:
- **Project Discovery**: Browse, filter, and join projects by status and skills
- **Project Creation**: Create projects with title, description, visibility, skills, GitHub/live URLs, and case study fields
- **Join Requests**: Submit and manage join requests; project owners approve/decline
- **Progress Feed**: Post, edit, and delete progress updates per project
- **Project Discussions**: Dedicated discussion threads inside project detail modals
- **Team Dashboard**: Team-wide skill coverage, top contributors, achievements, key insights, and activity feed
- **Project Cards**: Show status, team count, update count, 7-day activity mini-bars, member chips

### 4. Mentorship Bridge
End-to-end mentorship matching and session management:
- **Mentor Directory**: Search mentors, view profiles, bios, availability, and session stats
- **Session Requests**: Pick a mentor, set topic/details/date-time, and submit
- **Session Management**: Filter by status (pending/accepted/completed/declined/rescheduled), inline edit, reschedule, delete
- **Skill Verification**: Mentors verify specific skills during session completion (high-weight skill signals)
- **Mentor Leaderboard**: Rankings based on completed sessions
- **Session Chat**: Dedicated chat within individual mentorship sessions
- **Availability Management**: Mentors manage their available time slots

### 5. Skill Tracker (Credential Layer)
Read-only analytics derived from real activity. No manual ratings or gamification:
- **Skill Distribution**: Weighted signals per skill; auto-insight highlights dominant skill or balanced focus
- **Skill Momentum**: Week-over-week change for top skills; shows increases, decreases, or steady progress
- **Activity Sources**: Stacked weekly bars showing which source (projects, updates, mentorship) drove activity
- **Skill Signals**: View all signals with source, weight, and timestamp
- **Peer Validations**: Team members can upvote/endorse skill signals
- **Skill Verifications**: Team member skill claim workflow (verify/challenge)

### 6. Project Portfolio
Public-facing project showcase:
- **Featured Project**: Highlight your best work at the top (manual selection)
- **Case Studies**: Problem, solution, tech stack, outcomes, artifact URL
- **Project Links**: GitHub and live/demo URLs on project cards and detail views
- **Project Metrics**: Activity metrics and team composition per project

### 7. User Profiles
Professional member credential pages:
- **Identity**: Name, role badge, cycle, professional headline
- **Credential Links**: GitHub, LinkedIn, personal site URLs
- **Featured Project**: Manually selected project showcase
- **Skills**: Skill distribution with signal counts and validation status
- **Projects**: Active and completed project list with links
- **Badges**: Earned achievement badges
- **Mentorship Stats**: Sessions completed, residents/interns helped, projects advised (for mentors/residents)
- **Credential Readiness**: Checklist showing profile completeness

### 8. Member Directory
Community member discovery:
- **Search & Filter**: By name, headline, current title, employer, role, cycle
- **Member Cards**: Avatar, role badge, governance badges, cycle badge, work info, stats
- **Quick Actions**: Chat, view profile, GitHub link
- **Activity Indicators**: Shows who's active in projects or mentorship

### 9. Opportunity Board
Community-driven job and opportunity sharing:
- **Browse Opportunities**: Card-based grid with search and type filtering
- **Post Opportunities**: Alumni and admins can post jobs, internships, apprenticeships, scholarships, events
- **Apply Links**: Direct links to external application URLs
- **Notifications**: Community members notified of new opportunities

### 10. Admin Dashboard
Platform administration:
- **Overview**: Platform statistics, growth charts, recent activity, alerts
- **Users**: Paginated table with filters (role, status, commenced), search, edit, delete, credential completion percentage
- **Projects**: All projects with status filters, actions
- **HQ Management**: Create/edit/deactivate announcements and events, view read tracking and RSVP rosters
- **Mentorship Analytics**: Session statistics, completion rates, mentor leaderboard
- **Governance**: Assign/remove governance positions (President, VP, Treasurer, etc.)
- **Cycles**: Manage intern cohorts/cycles
- **Error Tracking**: Logged errors with filters, bulk actions, export
- **System Health**: Database, API, and system status
- **Settings**: Platform config, feature flags, maintenance mode
- **Invitations**: Create, view, revoke invitation-based registrations

---

## Roles and Access

| Role | Access |
|------|--------|
| **Intern** | Intern Lobby, Collaboration Hub, Mentorship Bridge, Skill Tracker, Project Portfolio |
| **Resident** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker, Member Directory, Opportunity Board |
| **Alumni** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker, Member Directory, Opportunity Board |
| **Mentor** | Collaboration Hub, SyncChat, Mentorship Bridge, Project Portfolio, Skill Tracker, Member Directory, Opportunity Board |
| **Admin** | Admin Dashboard (full access), Project Portfolio |

### Commencement Flow
Interns start in the Intern Lobby. When an admin commences an intern, they transition to resident status, gain access to SyncChat, and a welcome message is posted to #introductions.

---

## Contributors

- **Bonny Makaniankhondo** -- Full-Stack Developer
- **Sofie Garcia** -- Front-End Developer and Research Lead

---

## License

This project is developed as part of an internship collaboration program.
