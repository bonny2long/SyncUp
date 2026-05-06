# Member Directory

**Route:** `/directory`
**Access:** Community members (residents, alumni, mentors) + admins
**Sidebar ID:** `directory`

---

## Overview

The Member Directory allows community members to discover and connect with other iCAA members. It displays a searchable, filterable grid of member profiles with role badges, governance positions, and quick action buttons.

---

## Features

### Search Functionality
- Search by name, headline, current title, or current employer
- Real-time filtering as the user types

### Role-Based Filtering
- All roles (default view)
- Residents (current program participants)
- Alumni (graduated members)
- Mentors

### Cycle Filtering
- Filter by iCAA cycles (dynamically populated from user data)
- Browse specific cohort/cycle members

### Member Cards
Each member card displays:
- **Avatar:** Profile picture with fallback to initials
- **Name:** Linked to individual profile page (`/profile/:id`)
- **Role Badge:** Color-coded by role (Alumni=Red, Resident=Red tint, Intern=Neutral)
- **Governance Badges:** Leadership roles (President, VP, Treasurer, Secretary, Parliamentarian, Tech Lead, Tech Member)
- **Cycle Badge:** Shows which cycle the member belongs to
- **Headline:** Member's professional headline
- **Current Work:** Displays "Title at Employer" format
- **Stats:** Project count and completed mentorship sessions
- **Activity Indicators:**
  - "Active in community project work" if project_count > 0
  - "Mentorship contributor" if completed_mentor_sessions > 0
- **Quick Actions:**
  - Chat button (links to `/chat?user=:id`)
  - View Profile button (links to `/p/:id`)
  - GitHub link (if github_url exists)

### Empty State
- Friendly empty state with helpful message and iCAA branded graphic when no members match filters

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/directory` | List directory members with filters (role, cycle, search) |

**Query Parameters:**
- `role` - Filter by role (resident, alumni, mentor)
- `cycle` - Filter by cycle name
- `search` - Search term for name, headline, title, or employer

---

## File Locations

**Client:**
- `client/src/pages/Directory/MemberDirectory.jsx` - Main directory component
- `client/src/components/shared/RoleBadge.jsx` - Role badge component
- `client/src/components/shared/GovernanceBadge.jsx` - Governance badge component
- `client/src/utils/api.js` - API functions (`fetchMemberDirectory`)

**Server:**
- `server/src/controllers/usersController.js` - Directory endpoint (lines 190-279)
- `server/src/routes/usersRoutes.js` - User routes

---

## Implementation Details

### Access Control
- Only returns users with roles: resident, alumni, mentor
- Only shows active users (`is_active IS NULL OR is_active != FALSE`)
- Sorting: By role order (alumni, resident, mentor), then cycle, then name

### Data Returned per Member
- Basic info: id, name, role, cycle, headline, profile_pic
- Work info: current_title, current_employer
- Social links: github_url, linkedin_url, personal_site_url
- Governance positions (via GROUP_CONCAT subquery)
- Project count (via subquery)
- Completed mentor sessions count (via subquery)
