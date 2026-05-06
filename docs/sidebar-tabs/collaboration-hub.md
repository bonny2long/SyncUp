# Collaboration Hub

**Route:** `/collaboration`
**Access:** All non-admin users
**Sidebar ID:** `collaboration`

---

## Overview

The Collaboration Hub is the project collaboration workspace where users discover, create, and manage projects. It features project discovery, team management, progress tracking, and a team analytics dashboard.

---

## Features

### Project Management
- Create projects with title, description, GitHub/live URLs, case study fields
- Two visibility modes: "Build in Public" (open sharing) or "Seeking Members" (join request workflow)
- Status workflow: `planned` → `active` → `completed` → `archived` (enforced order)
- Role-based permissions (only owners can change status)

### Project Discovery
- Browse available projects with search and skill filtering
- Filter by skills (populated from active/planned projects)
- Sort by newest, most active, or team size
- Preview project details before joining

### Team Collaboration
- Join/leave projects (with request approval for "seeking" projects)
- View team members and details
- Project discussions with read/post permissions based on membership
- Add skills to projects (auto-creates skill signals for members)

### Progress Tracking
- Activity feed showing user's progress updates
- 7-day activity mini-bar per project
- Filter activity by project

### Join Request System
- Users request to join "seeking" projects
- Project owners review and approve/reject requests
- Notifications sent to owners and users

### Team Dashboard (Analytics)
- Overview metrics: team size, skills tracked, total signals, weekly activity
- Team member contributions and signal counts
- Skill distribution heatmap
- Signal source breakdown (project, update, mentorship)
- Momentum tracking (14-day signal history)
- Top contributors leaderboard
- Team achievements display

---

## Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| My Work / Browse | MyWorkPanel / DiscoverPanel | User's projects or discoverable projects |
| Discover / My Projects | DiscoverProjects | Project discovery with filters |
| Requests | RequestsPanel | Pending join requests for project owners |
| Activity | ActivityPanel | User's progress updates feed |
| Team Analytics | TeamDashboard | Team-wide analytics and insights |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects with metrics |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id/status` | Update project status |
| PUT | `/api/projects/:id/links` | Update project links |
| GET | `/api/projects/:id/skills` | Get project skills |
| GET | `/api/projects/skills` | Get all skills used in projects |
| GET | `/api/projects/user/:userId` | Get user's projects |
| GET | `/api/projects/:id/portfolio-details` | Portfolio details |
| GET | `/api/projects/:id/metrics` | Project metrics |
| GET | `/api/projects/:id/discussions` | Get project discussions |
| POST | `/api/projects/:id/discussions` | Create discussion |
| POST | `/api/projects/:id/join-request` | Submit join request |
| GET | `/api/projects/:id/requests` | Get join requests |
| PUT | `/api/projects/:id/requests/:requestId/approve` | Approve request |
| PUT | `/api/projects/:id/requests/:requestId/reject` | Reject request |
| POST/DELETE | `/api/projects/:id/members` | Add/remove members |
| GET | `/api/projects/:id/team-momentum` | Team momentum analytics |

---

## File Locations

**Client:**
- `client/src/pages/CollaborationHub/CollaborationHub.jsx` - Main hub component
- `client/src/pages/CollaborationHub/MyWorkPanel.jsx` - User's projects
- `client/src/pages/CollaborationHub/DiscoverPanel.jsx` - Project discovery
- `client/src/pages/CollaborationHub/DiscoverProjects.jsx` - Project list
- `client/src/pages/CollaborationHub/ProjectList.jsx` - Detailed project list
- `client/src/pages/CollaborationHub/RequestsPanel.jsx` - Join requests
- `client/src/pages/CollaborationHub/ActivityPanel.jsx` - Activity feed
- `client/src/pages/CollaborationHub/TeamDashboard/TeamDashboard.jsx` - Analytics
- `client/src/pages/CollaborationHub/CreateProjectForm.jsx` - Project creation form
- `client/src/components/shared/ProjectCard.jsx` - Reusable project card
- `client/src/hooks/useProjects.js` - Projects data hook

**Server:**
- `server/src/controllers/projectsController.js` - Project API controllers
- `server/src/routes/projectsRoutes.js` - Project routes
