# Opportunity Board

**Route:** `/opportunities`
**Access:** Community members (residents, alumni) + admins
**Sidebar ID:** `opportunities`

---

## Overview

The Opportunity Board is a community-driven job and opportunity sharing platform. Alumni and admins can post structured opportunities (jobs, internships, apprenticeships, scholarships, events) for community members to discover and apply to.

---

## Features

### For Viewers (Residents, Alumni)
- **Browse Opportunities:** View all active opportunities in a card-based grid
- **Search:** Filter by title, company, description, or author name
- **Type Filtering:** Filter by type (Full Time, Part Time, Contract, Internship, Apprenticeship, Scholarship, Event)
- **Apply Links:** Direct "Apply" buttons linking to external URLs
- **Author Info:** See who posted each opportunity with role badge and cycle information

### For Posters (Alumni and Admins Only)
- **Post Opportunities:** Create new posts with:
  - Title (required, max 200 chars)
  - Company/Organization (required, max 200 chars)
  - Type (dropdown with 7 types)
  - Description (optional, max 500 chars)
  - Apply URL (optional, must be valid http/https)
- **Delete Own Posts:** Authors can delete their own opportunities
- **Admin Override:** Admins can delete any opportunity

### Additional Features
- **Statistics Display:** Count of open posts, filtered results, and opportunity types
- **Real-time Refresh:** Manual refresh button to reload opportunities
- **Empty State:** Friendly empty state with call-to-action for first-time posters
- **Notifications:** All residents and alumni receive notifications when new opportunities are posted
- **Role-based Messaging:** Non-posting users see explanation that only alumni/admins can post

---

## Opportunity Types

| Type | Value |
|------|-------|
| Full Time | `full_time` |
| Part Time | `part_time` |
| Contract | `contract` |
| Internship | `internship` |
| Apprenticeship | `apprenticeship` |
| Scholarship | `scholarship` |
| Event | `event` |

---

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/opportunities` | List all active opportunities | Community members + admins |
| POST | `/api/opportunities` | Create new opportunity | Alumni and admins only |
| DELETE | `/api/opportunities/:id` | Soft-delete an opportunity | Author or admin |

---

## File Locations

**Client:**
- `client/src/pages/Opportunities/OpportunityBoard.jsx` - Main component
- `client/src/utils/api.js` - API functions (`fetchOpportunities`, `createOpportunity`, `deleteOpportunity`)

**Server:**
- `server/src/controllers/opportunitiesController.js` - API controllers
- `server/src/routes/opportunitiesRoutes.js` - API routes
- `server/src/database/opportunities.sql` - Database schema

---

## Database Schema

**Table:** `opportunities`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY AUTO_INCREMENT |
| `author_id` | INT | NOT NULL, FK to users(id) |
| `title` | VARCHAR(200) | NOT NULL |
| `company` | VARCHAR(200) | NOT NULL |
| `type` | ENUM | 'full_time','part_time','contract','internship','apprenticeship','scholarship','event' |
| `description` | VARCHAR(500) | NULL allowed |
| `apply_url` | VARCHAR(500) | NULL allowed |
| `is_active` | BOOLEAN | DEFAULT TRUE (soft delete flag) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

---

## Implementation Details

- **Soft Deletes:** Opportunities are not removed from DB, only marked `is_active = FALSE`
- **URL Validation:** Apply URLs must be valid http/https
- **Notification Integration:** `notifyOpportunityAudience()` sends notifications to all residents and alumni when new opportunities are posted
- **Settings Integration:** Users can toggle opportunity notifications (`notify_opportunities` preference)
