# Mentorship Bridge

**Route:** `/mentorship`
**Access:** All non-admin users
**Sidebar ID:** `mentorship`

---

## Overview

Mentorship Bridge is a comprehensive mentorship platform that connects interns with experienced mentors (alumni, residents) from ICAA. It facilitates structured mentorship through session booking, availability management, skill development tracking, and session chat.

---

## Features

### For Interns (InternView)
- **Find Mentors:** Browse mentors by availability or project association with search
- **Session Requests:** Submit session requests with topic, focus, details, and time slot selection
- **My Requests:** View pending, accepted, and declined session requests
- **Session History:** View completed sessions
- **Skill Tracking:** See skills practiced in completed sessions

### For Mentors (MentorView)
- **Incoming Requests:** Review and accept/decline pending session requests
- **My Sessions:** Manage accepted/active sessions with status updates
- **Availability Management:** Add/remove available time slots for mentorship
- **Session History:** View past completed sessions
- **Leaderboard:** View mentor rankings based on completed sessions
- **Encouragement:** Send encouragement messages to interns

### Session Focus Types
- **Project Support** - Help with active projects
- **Technical Guidance** - Technical skill development
- **Career Guidance** - Career advice and planning
- **Life and Leadership** - Personal development
- **Alumni Advice** - Insights from alumni experience

### Session Status Flow
```
pending → accepted → completed
pending → declined
accepted → rescheduled
```

### Skill Verification System
- **Technical sessions** (project_support, technical_guidance) generate skill signals when completed
- Skill signals have a **weight of 3** (higher than other activities)
- Skills are stored via `user_skill_signals` table linked to session source
- **SkillSelectModal:** Mentors select skills practiced during session completion
- Interns can see practiced skills on completed session cards

### Badge System
- Mentors receive a **"mentor" badge** after completing **3 mentorship sessions**
- Badge check occurs on session completion via `checkAndAwardMentorBadge()`

### Notification System
Automatic notifications are sent for:
- New session requests (to mentor)
- Session accepted (to intern)
- Session declined (to intern)
- Session completed (to intern)

### Session Chat
- Dedicated chat within individual mentorship sessions
- Session-specific messaging between mentor and intern
- File attachment support

---

## API Endpoints

### Mentor Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/mentorship/mentors` | Get all mentors (role: mentor, alumni, resident) |
| GET | `/api/mentorship/mentors/available` | Get mentors with available time slots |
| GET | `/api/mentorship/mentor/:id/details` | Get mentor profile with availability and session stats |
| GET | `/api/mentorship/mentors/project` | Get mentors attached to projects |

### Session Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/mentorship/sessions` | Get all sessions (optional mentor_id filter) |
| POST | `/api/mentorship/sessions` | Create a new session request |
| PUT | `/api/mentorship/sessions/:id` | Update session status (accept/decline/complete) |
| PUT | `/api/mentorship/sessions/:id/details` | Update session topic/details/date |
| PUT | `/api/mentorship/sessions/:id/reschedule` | Reschedule session |
| DELETE | `/api/mentorship/sessions/:id` | Delete a session |
| GET | `/api/mentorship/sessions/:id/skills` | Get skills practiced in a session |
| GET | `/api/mentorship/sessions/intern/:internId` | Get sessions for a specific intern |
| GET | `/api/mentorship/sessions/mentor/:mentorId` | Get sessions for a specific mentor |

### Availability Endpoints
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/mentorship/mentors/:id/availability` | Get mentor's available time slots |
| POST | `/api/mentorship/mentors/:id/availability` | Add a new availability slot |
| DELETE | `/api/mentorship/availability/:slotId` | Remove an availability slot |

### Skill Endpoints (for session skill verification)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/skills/:signalId/validate` | Add validation (upvote/endorsement) |
| GET | `/api/skills/user/:userId/signals` | Get user's received validations |

---

## File Locations

### Frontend
| File | Path |
|------|------|
| Main Page | `client/src/pages/MentorshipBridge/MentorshipBridge.jsx` |
| InternView | `client/src/pages/MentorshipBridge/InternView/InternView.jsx` |
| MentorView | `client/src/pages/MentorshipBridge/MentorView/MentorView.jsx` |
| FindMentors | `client/src/pages/MentorshipBridge/InternView/FindMentors.jsx` |
| MyRequests | `client/src/pages/MentorshipBridge/InternView/MyRequests.jsx` |
| SessionHistory (Intern) | `client/src/pages/MentorshipBridge/InternView/SessionHistory.jsx` |
| RequestSessionModal | `client/src/pages/MentorshipBridge/InternView/RequestSessionModal.jsx` |
| IncomingRequests | `client/src/pages/MentorshipBridge/MentorView/IncomingRequests.jsx` |
| MySessions | `client/src/pages/MentorshipBridge/MentorView/MySessions.jsx` |
| AvailabilityManager | `client/src/pages/MentorshipBridge/MentorView/AvailabilityManager.jsx` |
| MentorshipHistory | `client/src/pages/MentorshipBridge/MentorView/MentorshipHistory.jsx` |
| MentorLeaderboard | `client/src/pages/MentorshipBridge/MentorView/MentorLeaderboard.jsx` |
| MentorCard | `client/src/components/MentorshipBridge/MentorCard.jsx` |
| SessionCard | `client/src/components/MentorshipBridge/SessionCard.jsx` |
| MentorProfileModal | `client/src/components/MentorshipBridge/MentorProfileModal.jsx` |
| SkillSelectModal | `client/src/components/MentorshipBridge/SkillSelectModal.jsx` |
| SessionChat | `client/src/components/MentorshipBridge/SessionChat.jsx` |

### Backend
| File | Path |
|------|------|
| Controller | `server/src/controllers/mentorshipController.js` |
| Routes | `server/src/routes/mentorshipRoutes.js` |
| Skill Signal Service | `server/src/services/skillSignalService.js` |
| Badge Service | `server/src/services/badgeService.js` |
| Notification Service | `server/src/services/notificationService.js` |

---

## Implementation Details

### Security Features
1. **Slot validation:** Before booking, verifies the time slot exists in `mentor_availability`
2. **Double-booking prevention:** Checks for existing sessions at the same time
3. **Role-based access:** Only mentors/alumni/residents can manage availability
4. **Intern session isolation:** Interns can only see their own sessions
5. **Booked slot removal:** Once a slot is requested, it's hidden from availability display

### Availability Management
- Mentors post available time slots (date + time)
- Slots are automatically hidden once booked
- Slots can only be removed if not yet booked
- Interns see only available (unbooked) slots when requesting sessions

### Database Tables
- `users` - User information with roles
- `mentor_availability` - Mentor available time slots
- `mentorship_sessions` - Session records with status
- `mentorship_session_skills` - Skills practiced in sessions
- `user_skill_signals` - Skills from sessions (source_type='mentorship')
- `badges` and `user_badges` - Badge system
- `notifications` - System notifications

---

## Key Design Decisions

- **Mentorship is decoupled from projects:** Sessions can have project context but don't require it
- **Skill signals only from technical sessions:** Only `project_support` and `technical_guidance` focuses generate skill signals
- **Explicit skill selection:** Mentors must explicitly select skills during session completion
- **Weighted scoring:** Mentorship skills have weight=3 (vs. project=1, update=2)
- **Status-based UI:** Different tabs and components for interns vs. mentors
