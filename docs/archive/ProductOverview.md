# SyncUp Product Overview

Audience: new collaborators. Focused on the three live hubs (Collaboration Hub, Mentorship Bridge, Skill Tracker). System Health is a developer-only panel and is excluded here.

## What SyncUp Does
- Connects interns, mentors, and alumni around real projects, structured mentorship, and transparent growth signals.
- Replaces subjective self-reporting with evidence from project activity, progress updates, and mentorship sessions.
- Provides an at-a-glance dashboard for engagement health and individual momentum without requiring manual score keeping.

## The Three Hubs

### Collaboration Hub
Purpose: keep project work visible and easy to join.
- Metrics panel: active projects, updates posted this week, total team members across projects, and a quick mentor-engagement ladder (top 3 mentors by completed vs. total sessions).
- Project list: shows description, status (planned/active/completed/archived) with inline updates, last update date, update count, team count, and member chips. 7-day activity mini-bars visualize recent updates per project. Double-click opens a detail modal with status controls, join/leave, members, and recent updates.
- Membership: interns can join/leave projects; counts, member chips, and status are optimistically updated while API calls complete.
- Progress feed: post updates (per-project filter), edit/delete your own updates, and filter the feed by selecting a project from the list. A pill at the top reminds you when a project filter is active with a “Show All Updates” reset.

### Mentorship Bridge
Purpose: match interns to mentors and run sessions end-to-end.
- Mentor directory: two tabs (Available, Project mentors), search by name/email, and profile modal with bio, role, availability slots, and session stats (total/completed/accepted/pending).
- Session requests: pick a mentor, set topic/details/date-time, and submit; success and error states are surfaced in-line.
- Session management: list sessions with status filter chips (all/pending/accepted/completed/declined/rescheduled). Inline edit topic/details/time, reschedule, and delete. Status actions (accept/complete/decline) are limited to the assigned mentor or admins. Rescheduled sessions surface the new time in-line.

### Skill Tracker
Purpose: read-only growth analytics derived from real activity (projects, updates, mentorship). No manual ratings or gamification.
- Skill Distribution: weighted signals per skill; auto-insight highlights the dominant skill if it exceeds 25% of activity, otherwise notes balanced focus.
- Skill Momentum: week-over-week change for the top five skills; emphasizes direction (increases/decreases/steady) rather than totals and generates short insights (e.g., biggest riser vs. slowdown).
- Activity Sources: stacked weekly bars showing which source (projects, updates, mentorship) drove activity; insight calls out the dominant source in the latest week.

## Roles and Guardrails
- Roles observed in UI logic: intern, mentor, admin. Mentors/admins can accept/complete/decline sessions; interns request and edit their own sessions.
- Project membership and status changes require a signed-in user; UI is optimistic but falls back if the server rejects.
- Progress updates default to project ID 1 if no project is selected (dev seed data); in production ensure a valid project is selected.

## Data and API Shape (for developers)
- Projects: `/projects`, `/projects/:id/status`, `/projects/:id/members` (join/leave), analytics endpoints for active projects, weekly updates, mentor engagement.
- Progress updates: `/progress_updates` (list/create), `/progress_updates/:id` (update/delete), optional `project_id` filter.
- Mentorship: mentor lists (`/mentorship/mentors`, `/mentorship/mentors/available`, `/mentorship/mentors/project`, `/mentorship/mentor/:id/details`), sessions (`/mentorship/sessions` with optional `mentor_id` filter, plus update/reschedule/delete routes).
- Skills: `/skills/user/:id/distribution`, `/momentum`, `/activity` feed the three charts; signals are derived from projects, updates, and mentorship.
- Frontend stack: React 18 + Vite 7 + Tailwind v4; backend: Node/Express with MySQL; API base configurable via `VITE_API_BASE`.

## Quick Onboarding for a New Developer
- Clone and install: `npm install` in `client/` and `server/`.
- Run locally: `npm run dev` in both `client/` (Vite) and `server/` (Nodemon). Set API base via `client/.env` (`VITE_API_BASE=http://localhost:5000/api`).
- Seed useful test data: projects, progress updates, mentors, and sessions will light up the three hubs; Skill Tracker charts need activity data to render insights.
- Entry points: `client/src/pages/Dashboard.jsx` wires the hubs; per-hub logic lives in `client/src/pages/{CollaborationHub|MentorshipBridge|SkillTracker}` and shared UI in `client/src/components/`.
