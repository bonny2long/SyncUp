# Project Portfolio

**Route:** `/portfolio`
**Access:** All authenticated users
**Sidebar ID:** `portfolio`

---

## Overview

Project Portfolio is a professional showcase page that displays completed and active projects with emphasis on case studies, outcomes, and professional presentation. It serves as a "community showcase" for displaying work that tells the story behind each project. Users can feature their best work, and the page is linked from user profiles.

---

## Features

### Featured Project Section
- Displays a suggested or manually featured project at the top with:
  - Project title, description, and status
  - Case study sections: Problem, Solution, Outcomes
  - Tech stack as tags
  - Team size, skill count, and status badges
  - External links: GitHub, Live URL, Artifact URL
  - "View Details" button

### Project Grid
- Responsive grid layout (1-4 columns based on screen size)
- Uses `ProjectCard` component with `variant="portfolio"` for compact display
- Each card shows:
  - Project title (truncated)
  - Status badge with color coding (planned/active/completed/archived)
  - Case study indicator badge
  - Stats in one line: team size, update count, skill count
  - Quick links to GitHub, Live URL, Artifact (if available)

### Filtering & Sorting
- **Status Filter:** All Projects, Planned, Active, Completed, Archived
- **Sort Options:**
  - Most Recent
  - Most Skills
  - Most Updates
  - Largest Team

### Pagination
- "Load More" button loading 12 projects at a time
- Smooth user experience with incremental loading

### Project Detail Modal
- Opens when a project is clicked
- Fetches comprehensive portfolio details via `/api/projects/:id/portfolio-details`
- Tabs within modal:
  - **Overview:** Case study, team members, skills
  - **Activity:** Progress updates, mentorship sessions
  - **Discussion:** Project discussions
- Skill metrics and recent updates displayed

### Empty State
- Directs users to Collaboration Hub to create projects
- Friendly message with call-to-action

---

## How It Differs from Collaboration Hub

| Aspect | **Project Portfolio** | **Collaboration Hub** |
|--------|----------------------|----------------------|
| **Purpose** | Showcase completed/active work with case studies | Manage active collaboration, join/create projects |
| **Layout** | Single-column with featured project + grid | Two-column layout with multiple tabs |
| **Project Card Variant** | `variant="portfolio"` - Compact with stats only | `variant="collaboration"` - More detailed with descriptions |
| **Featured Content** | Featured project section with case study highlights | No featured section; uses stats cards at top |
| **Case Study Emphasis** | Central feature - shows Problem/Solution/Outcomes/Tech Stack | Available in modal but not prominently displayed |
| **Project Creation** | Not available - directs to Collaboration Hub | Primary feature with `CreateProjectForm` |
| **Join Requests** | Not handled (view-only for portfolio) | Core feature with `JoinProjectModal`, `RequestsPanel` |
| **Team Analytics** | Not included | Dedicated tab with `TeamDashboard` component |
| **Target User Action** | **Viewing/showcasing** work | **Managing/collaborating** on work |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/projects` | Get all projects with aggregated data (team size, skill count, update count, team members) |
| GET | `/api/projects/user/:userId` | Get user's projects (owned or member) |
| GET | `/api/projects/:id/portfolio-details` | **Key portfolio endpoint** - Returns project details + team + skills + metrics + updates + sessions |
| GET | `/api/projects/:id/skills` | Get skills associated with a project |
| GET | `/api/projects/:id/metrics` | Get aggregated project metrics |
| PUT | `/api/projects/:id/links` | Update project links (GitHub, Live URL, case study fields) |
| GET | `/api/projects/:id/discussions` | Get project discussions |
| POST | `/api/projects/:id/discussions` | Create project discussion |
| PUT/DELETE | `/api/projects/:id/discussions/:discussionId` | Update/delete discussion |

### Portfolio Details Response Structure
```json
{
  "project": { "id": 1, "title": "...", "status": "completed", ... },
  "team": [ { "id": 1, "name": "John", "role": "intern" }, ... ],
  "skills": [ { "id": 1, "skill_name": "React", "category": "Frontend" }, ... ],
  "skillMetrics": [ { "skill_id": 1, "signal_count": 6, "total_weight": 11.45 }, ... ],
  "updates": [ { "id": 1, "content": "...", "created_at": "..." }, ... ],
  "sessions": [ { "id": 1, "topic": "...", "status": "completed" }, ... ]
}
```

---

## Case Study Data Structure

Stored in the `projects` table:

| Column | Description |
|--------|-------------|
| `case_study_problem` | Text description of problem solved |
| `case_study_solution` | Text description of solution built |
| `case_study_tech_stack` | Comma-separated tech stack |
| `case_study_outcomes` | Text description of outcomes/impact |
| `case_study_artifact_url` | URL to demo video, docs, screenshots |

---

## Featured Project Logic

The featured project is determined by:
1. **Manually featured:** User's `featured_project_id` in the database
2. **Completed with case study:** Highest priority auto-selection
3. **Any with case study:** Projects that have case study content
4. **Completed project:** Any completed project
5. **Active project:** Any active project
6. **First project:** Fallback to first project in the list

Users can feature a project via `handleFeatureProject()` which updates `users.featured_project_id`.

---

## File Locations

### Frontend
| File | Path |
|------|------|
| Main Page | `client/src/pages/ProjectPortfolio.jsx` |
| ProjectCard | `client/src/components/shared/ProjectCard.jsx` |
| ProjectDetailModal | `client/src/components/modals/ProjectDetailModal.jsx` |
| useProjects Hook | `client/src/hooks/useProjects.js` |
| EmptyState | `client/src/components/brand/EmptyState.jsx` |
| SkeletonLoader | `client/src/components/shared/SkeletonLoader.jsx` |

### Backend
| File | Path |
|------|------|
| Controller | `server/src/controllers/projectsController.js` |
| Routes | `server/src/routes/projectsRoutes.js` |

---

## Implementation Details

- **Data Flow:** `ProjectPortfolio.jsx` uses `useProjects(user?.id)` hook which filters `myProjects` (projects where user is a member)
- **Filtering:** Projects filtered by status and sorted by selected criteria
- **Portfolio Details:** Modal fetches from `/api/projects/:id/portfolio-details` with `fetchPortfolioDetails=true`
- **Featured on Profile:** Featured project displayed on user's public profile page
- **Theme Support:** Adapts to dark/light mode via Tailwind CSS
- **Lazy Loading:** Project grid uses "Load More" pattern for performance
