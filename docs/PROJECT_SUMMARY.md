# SyncUp - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [API Architecture](#api-architecture)
6. [Database Schema](#database-schema)
7. [Signal Pipeline Architecture](#signal-pipeline-architecture)
8. [System Components](#system-components)

---

## Project Overview

SyncUp is a full-stack SaaS platform designed to connect interns, mentors, and alumni through real-world project collaboration and structured mentorship programs. The platform replaces subjective self-reporting with evidence-based skill tracking through an innovative "Skill Signal" pipeline that derives skills from actual project work, progress updates, and verified mentorship sessions.

The platform is built on the philosophy that professional growth should be a mirror of real activity, not a manual checklist. Every skill displayed in the system is backed by verifiable evidence from the user's actions within the platform.

---

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4
- **Charts**: AG Charts, Recharts
- **Icons**: Lucide React
- **State Management**: React Context + LocalStorage
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js
- **Database**: MySQL 8.0+ (Local development), Azure SQL (Production)
- **File Storage**: Local filesystem with static serving

### Development Tools
- **API Documentation**: Swagger/OpenAPI
- **Error Handling**: Custom error logging service
- **Rate Limiting**: Express rate limiter
- **Validation**: Custom validators

---

## Core Features

### 1. Authentication System

The platform provides a complete authentication system with:

- **User Registration**: New users can register with email, name, password, and role selection (intern, mentor)
- **User Login**: Secure login with session management
- **Password Management**: Password validation and secure storage
- **Role-Based Access Control**: Different features and permissions based on user role

### 2. Collaboration Hub

The Collaboration Hub is the central workspace for project-based collaboration:

#### Project Management
- **Create Projects**: Interns can create new projects with title, description, visibility (public/seeking members), and required skills
- **Project Discovery**: Browse and filter available projects by status and skill requirements
- **Project Status**: Projects can be in states including planned, active, completed, archived, and seeking_members
- **Project Details**: View comprehensive project information including team members, skills required, and activity history

#### Team Features
- **Join Requests**: Request to join projects; owners can approve or decline requests
- **Team Analytics**: View team-wide skill distribution and momentum for active projects
- **Member Management**: Project owners can manage team membership
- **Team Activity Feed**: Real-time updates on team contributions

#### Progress Updates
- **Post Updates**: Share progress on projects with rich text content
- **Activity Feed**: View all progress updates with project filtering
- **Edit/Delete**: Manage your own updates
- **Skill Tagging**: Updates are automatically linked to project skills

#### Project Requests Panel
- **Incoming Requests**: View and manage join requests to your projects
- **Request Actions**: Accept or decline join requests
- **Request Status Tracking**: Monitor pending, accepted, and declined requests

### 3. Mentorship Bridge

A comprehensive mentorship matching and session management system:

#### For Interns
- **Mentor Directory**: Browse available mentors with search and filtering
- **Profile Cards**: View mentor bios, roles, availability, and session statistics
- **Request Sessions**: Request mentorship sessions with topic, details, and preferred datetime
- **Session Management**: View, edit, reschedule, or cancel your session requests
- **Session History**: Access complete history of past mentorship sessions

#### For Mentors
- **Incoming Requests**: View pending session requests from interns
- **Accept/Decline**: Accept or decline session requests
- **Session Management**: View and manage accepted sessions
- **Mark Complete**: Complete sessions with optional skill verification
- **Mentor Leaderboard**: View mentor rankings based on completed sessions

#### Session Features
- **Session Status Tracking**: pending, accepted, completed, declined, rescheduled
- **Rescheduling**: Request and handle session time changes
- **Skill Verification**: Mentors can verify specific skills during session completion (provides high-weight skill signals)

### 4. Skill Tracker

An evidence-based skill analytics dashboard:

#### Skill Distribution
- **Visual Chart**: Pie/donut chart showing skill distribution by weight
- **Weighted Signals**: Skills are weighted based on source (project, update, mentorship)
- **Auto-Insights**: System highlights dominant skills (>25% threshold) or balanced focus

#### Skill Momentum
- **Week-over-Week Tracking**: Track skill growth over time
- **Top 5 Skills**: Focus on the user's top 5 skills
- **Growth Indicators**: Show increases, decreases, or steady progress
- **Automated Insights**: Generate insights like "biggest riser" or "slowdown"

#### Activity Sources
- **Source Breakdown**: Stacked bar charts showing Projects vs Updates vs Mentorship
- **Weekly Activity**: Visual representation of weekly activity by source
- **Dominant Source**: Identify which activity type is driving growth

#### Validated Signals
- **Mentor-Verified Skills**: Skills verified by mentors during sessions carry higher weight
- **Signal History**: View all skill signals with source and verification status

### 5. Real-Time Chat System

A Slack-inspired messaging platform:

#### Channels
- **Create Channels**: Create new public channels for team communication
- **Channel List**: Browse and join existing channels
- **Real-Time Messaging**: Send and receive messages in channel context

#### Direct Messages
- **One-on-One Chat**: Private messaging between users
- **User List**: Browse available users to start conversations
- **Presence Status**: See online/away/offline status

#### Messaging Features
- **File Attachments**: Upload and share files in messages
- **Image Support**: Special handling for image attachments
- **Message Timestamps**: Relative time display (now, minutes, hours, dates)
- **Real-Time Updates**: Polling every 5 seconds for new messages

#### Presence System
- **Online Status**: Track user online/away/offline status
- **Project Grouping**: Group users by their projects
- **Auto-Status Updates**: Presence updates when switching channels

### 6. User Profiles

Comprehensive user profile management:

#### Profile Information
- **Basic Info**: Name, email, role
- **Bio**: Personal biography/description
- **Avatar**: Profile picture upload
- **Profile Editing**: Edit name, bio, and avatar

#### Profile Sections
- **Projects**: List of projects the user is involved in
- **Skills**: Skills with signal counts and validation status
- **Badges**: Achievement badges earned through activity

#### Skill Validations
- **Validation System**: Mentors can validate user skills
- **Validation UI**: Add or remove skill validations
- **Validation Indicators**: Show which skills are mentor-verified

### 7. Badge System

Gamification and achievement tracking:

#### Badge Categories
- **Project Badges**: Achievements related to project participation
- **Mentorship Badges**: Achievements related to mentorship activities
- **Engagement Badges**: Achievements related to platform engagement

#### Badge Features
- **Badge Display**: Grid view of earned badges
- **Badge Details**: Badge name, description, icon, and earned date
- **Badge Notifications**: Real-time notifications when badges are earned
- **Badge Service**: Automated badge checking and awarding

### 8. Notifications System

Real-time notification delivery:

- **Session Notifications**: Mentorship session updates
- **Project Notifications**: Join request and project activity
- **Badge Notifications**: Achievement unlocks
- **Notification Service**: Centralized notification handling

### 9. Admin Dashboard

Comprehensive administration panel:

#### Overview Tab
- **Platform Statistics**: Total users, projects, mentors, sessions
- **Activity Charts**: Platform growth over last 30 days
- **Recent Activity**: Latest platform updates
- **Alerts**: Items needing attention (pending requests, open errors)

#### Users Management
- **User List**: Paginated table of all users
- **Filters**: Filter by role (intern, mentor, admin) and status (active/inactive)
- **Search**: Search users by name, email, or role
- **User Actions**: Edit user, delete user, change role

#### Projects Management
- **Project List**: All platform projects with status
- **Status Filters**: Filter by project status
- **Project Actions**: Delete project, update status

#### Mentorship Analytics
- **Session Statistics**: Completed vs pending sessions
- **Completion Rate**: Percentage of completed sessions
- **Mentor Leaderboard**: Ranking of mentors by performance

#### Chat Administration
- **Full Chat Access**: Admin can monitor chat functionality

#### Error Tracking
- **Error List**: All logged errors with pagination
- **Error Filters**: Filter by status (open/resolved) and type
- **Error Details**: View full error information including stack traces
- **Bulk Actions**: Select multiple errors for bulk status updates or deletion
- **Export**: Export errors to CSV or JSON

#### System Health
- **Health Status**: Database, API, and overall system status
- **Server Metrics**: CPU, memory usage indicators
- **Response Times**: API response time monitoring

#### Settings
- **Platform Configuration**: Platform name, support email, timezone
- **Feature Flags**: Enable/disable mentorship, project discovery, leaderboards
- **Maintenance Mode**: Toggle platform maintenance mode with custom message

#### Invitation System
- **Create Invitations**: Generate email invitations for new users
- **Invitation Links**: Copy invitation links for sharing
- **Invitation Management**: View, revoke pending invitations
- **Invitation Status**: Track pending, accepted, expired invitations

---

## User Roles and Permissions

### Intern
- Create and manage projects
- Browse and join projects
- Post progress updates
- Request mentorship sessions
- View and edit own profile
- Earn badges through activity

### Mentor
- Browse and join projects as senior contributor
- Accept/decline mentorship session requests
- Complete sessions with skill verification
- View mentor leaderboard
- View and edit own profile

### Admin
- Full access to Admin Dashboard
- Manage all users (edit, delete, change roles)
- Manage all projects
- View all mentorship sessions
- Access chat monitoring
- Manage error tracking
- Configure platform settings
- Manage invitations
- Toggle maintenance mode

---

## API Architecture

### Authentication Routes (`/api/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Users Routes (`/api/users`)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `GET /users/:id/profile` - Get user profile with projects and skills
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/avatar` - Upload avatar

### Projects Routes (`/api/projects`)
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `PUT /projects/:id/status` - Update project status
- `POST /projects/:id/join` - Request to join project
- `POST /projects/:id/leave` - Leave project
- `GET /projects/:id/members` - Get project members
- `POST /projects/:id/skills` - Add skills to project

### Progress Updates Routes (`/api/progress_updates`)
- `GET /progress_updates` - List updates (with optional project filter)
- `POST /progress_updates` - Create update
- `PUT /progress_updates/:id` - Update update
- `DELETE /progress_updates/:id` - Delete update

### Mentorship Routes (`/api/mentorship`)
- `GET /mentorship/mentors` - List mentors
- `GET /mentorship/mentors/available` - List available mentors
- `GET /mentorship/mentor/:id/details` - Get mentor details
- `GET /mentorship/sessions` - List sessions (with optional mentor filter)
- `POST /mentorship/sessions` - Create session request
- `PUT /mentorship/sessions/:id` - Update session
- `DELETE /mentorship/sessions/:id` - Delete session
- `POST /mentorship/sessions/:id/complete` - Complete session

### Skills Routes (`/api/skills`)
- `GET /skills` - List all skills
- `GET /skills/user/:id/distribution` - Get user skill distribution
- `GET /skills/user/:id/momentum` - Get user skill momentum
- `GET /skills/user/:id/activity` - Get user skill activity
- `GET /skills/user/:id/signals` - Get user skill signals
- `GET /skills/user/:id/validated` - Get validated signals

### Chat Routes (`/api/chat`)
- `GET /chat/channels` - List channels
- `POST /chat/channels` - Create channel
- `GET /chat/channels/:id/messages` - Get channel messages
- `GET /chat/dm/:userId` - Get DM messages
- `POST /chat/messages` - Send message
- `GET /chat/presence/:userId` - Get presence
- `POST /chat/presence` - Update presence
- `GET /chat/dm-users/:userId` - Get DM users
- `POST /chat/upload` - Upload file

### Badges Routes (`/api/badges`)
- `GET /badges` - List all badges
- `GET /badges/users/:id` - Get user badges

### Notifications Routes (`/api/notifications`)
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read

### Analytics Routes (`/api/analytics`)
- `GET /analytics/active-projects` - Active projects analytics
- `GET /analytics/platform-stats` - Platform statistics
- `GET /analytics/growth` - Growth statistics

### Admin Routes (`/api/admin`)
- `GET /admin/stats` - Admin statistics
- `GET /admin/active-sessions` - Active session count
- `GET /admin/errors` - List errors
- `GET /admin/errors/stats` - Error statistics
- `PUT /admin/errors/:id/status` - Update error status
- `DELETE /admin/errors/:id` - Delete error
- `GET /admin/health` - System health
- `GET /admin/invitations` - List invitations
- `POST /admin/invitations` - Create invitation
- `DELETE /admin/invitations/:id` - Revoke invitation
- `GET /admin/settings` - Get settings
- `PUT /admin/settings` - Update settings

### Error Routes (`/api/errors`)
- `POST /errors` - Log error (client-side)

### Health Routes (`/api/health`)
- `GET /health` - Health check endpoint

### Upload Routes (`/api/upload`)
- `POST /upload` - Handle file uploads

---

## Database Schema

### Core Tables

#### users
- id, email, password_hash, name, role, bio, profile_pic, is_active, created_at, updated_at

#### projects
- id, title, description, owner_id, status, visibility, created_at, updated_at

#### project_members
- id, project_id, user_id, role, joined_at

#### project_skills
- id, project_id, skill_id

#### progress_updates
- id, project_id, user_id, content, created_at, updated_at

#### skills
- id, skill_name, category

#### user_skill_signals (append-only)
- id, user_id, skill_id, source_type, source_id, signal_type, weight, created_at

#### mentorship_sessions
- id, intern_id, mentor_id, topic, details, scheduled_at, status, created_at, updated_at

#### session_skills
- id, session_id, skill_id

#### chat_channels
- id, name, created_at

#### chat_messages
- id, channel_id, sender_id, content, file_url, file_name, created_at

#### chat_dm_messages
- id, user1_id, user2_id, sender_id, content, file_url, file_name, created_at

#### chat_presence
- id, user_id, status, channel_id, last_seen

#### badges
- id, name, description, icon, category

#### user_badges
- id, user_id, badge_id, earned_at

#### notifications
- id, user_id, type, title, message, is_read, created_at

#### invitations
- id, email, token, expires_at, created_at

#### errors
- id, error_type, message, stack, page_url, user_agent, status, created_at, resolved_at

#### platform_settings
- id, key, value

---

## Signal Pipeline Architecture

### The A -> B -> C -> D Pipeline

SyncUp uses an evidence-based signal pipeline to derive skills:

#### A - Project Context
- Skills must be tied to concrete project scope
- Project skills are explicitly defined in project_skills table
- Project metadata (skill_ideas) is informational only and does NOT generate signals

#### B - Mentorship Session
- Mentorship does NOT emit skill signals by default
- Only explicit skill verification during session completion generates signals
- This prevents mentorship from being a loophole for skill inflation

#### C - Progress Updates
- When a progress update is posted, signals are emitted for all project skills
- Each update creates signals with weight based on signal_type (joined, update, completed)
- If no project_skills exist, no signals are emitted

#### D - Analytics Layer
- All skill charts read exclusively from user_skill_signals
- Distribution, Momentum, and Activity are derived from signals
- No direct writes to aggregated tables

### Signal Types and Weights
- **joined**: Weight for joining a project (higher weight)
- **update**: Weight for posting progress updates
- **completed**: Weight for completing project milestones
- **validated**: Higher weight for mentor-verified skills

### Guardrails
- Only the skillSignalService can write to user_skill_signals
- All controllers must use emitSkillSignals function
- Append-only design prevents data drift
- Uniqueness constraints prevent duplicate signals

---

## System Components

### Frontend Components

#### Layout
- **Sidebar**: Main navigation sidebar with collapsible sections
- **Navbar**: Top navigation with user menu and notifications

#### Collaboration Hub
- **CreateProjectForm**: Form for creating new projects
- **MyWorkPanel**: User's active projects display
- **DiscoverPanel**: Project discovery and browsing
- **ActivityPanel**: Progress updates feed
- **RequestsPanel**: Join request management
- **TeamDashboard**: Team analytics with charts
- **JoinProjectModal**: Join request submission
- **ProjectDetailModal**: Full project details view

#### Mentorship Bridge
- **FindMentors**: Mentor directory with search
- **RequestSessionModal**: Session request form
- **MyRequests**: Intern's session requests
- **SessionHistory**: Past sessions list
- **IncomingRequests**: Mentor's pending requests
- **MySessions**: Mentor's accepted sessions
- **MentorLeaderboard**: Mentor rankings

#### Skill Tracker
- **SkillTrackerSection**: Main skill analytics dashboard
- **SkillDistributionChart**: Pie chart of skills
- **SkillMomentumChart**: Line chart of growth
- **ActivitySourceChart**: Stacked bar chart

#### Chat
- **ChannelList**: Left sidebar with channels and DMs
- **ChatWindow**: Main messaging area
- **MessageList**: Message display with avatars
- **MessageInput**: Text input with file upload
- **MemberList**: Right sidebar with online users

#### Profile
- **ProfileHeader**: User info and avatar
- **ProfileProjects**: User's projects
- **ProfileSkills**: Skills with validations
- **BadgeGrid**: Achievement display

#### Admin
- **StatCard**: Dashboard statistics
- **UserTable**: User management table
- **ProjectTable**: Project management table
- **ErrorTable**: Error tracking table
- **InvitationPanel**: Invitation management

### Backend Services

#### Controllers
- usersController
- projectsController
- progressController
- skillsController
- mentorshipController
- chatController
- badgeController
- notificationController
- analyticsController
- errorsController

#### Services
- skillSignalService: Emit and manage skill signals
- badgeService: Check and award badges
- notificationService: Send notifications

#### Middleware
- maintenanceMode: Platform maintenance toggle

---

## Development Status

### Completed Features
- Full authentication system
- Collaboration Hub with projects and updates
- Mentorship Bridge with session management
- Skill Tracker with evidence-based analytics
- Real-time chat system
- User profiles with badges and validations
- Admin dashboard with full management
- Error tracking and logging
- Invitation system
- Notification system
- Platform settings and maintenance mode

### Known Limitations
- Local file storage (production would use cloud storage)
- Polling-based real-time (production would use WebSockets)
- No email notifications (would integrate with email service in production)

---

## Getting Started

### Prerequisites
- Node.js v20+
- MySQL 8.0+

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/SyncUp.git
cd SyncUp

# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
# Edit client/.env and server/.env files

# Start development servers
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

### Environment Variables
- `VITE_API_BASE` - Backend API URL (client)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database config (server)
- `JWT_SECRET` - Authentication secret (server)

---

## Contributors
- Bonny Makaniankhondo - Full-Stack Developer
- Sofie Garcia - Front-End Developer and Research Lead

---

## License
This project is developed as part of an internship collaboration program.
