# SyncUp - Technical Summary

## Project Overview

SyncUp is a full-stack intern collaboration and mentorship platform that tracks professional growth through an evidence-based Skill Signal pipeline. The platform connects interns, mentors, and alumni through project collaboration and structured mentorship sessions.

## Architecture

### Frontend Architecture (React + Vite)

The frontend demonstrates modern React patterns:

- **React 19** with functional components and hooks
- **Vite** for fast development and builds
- **Tailwind CSS** for responsive styling
- **AG Charts and Recharts** for data visualization
- **React Context** for state management
- **React Router** for navigation

### Backend Architecture (Node.js + Express)

- **Express.js** RESTful API
- **MySQL** database with connection pooling
- **Swagger/OpenAPI** for API documentation
- **Express Rate Limiting** for API protection
- **Helmet** for security headers

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('intern', 'mentor', 'admin') NOT NULL,
  bio TEXT,
  profile_pic VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL,
  status ENUM('planned', 'active', 'completed', 'archived', 'seeking_members') DEFAULT 'planned',
  visibility ENUM('public', 'private') DEFAULT 'public',
  start_date DATE,
  end_date DATE,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Project members
CREATE TABLE project_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'contributor', 'collaborator') DEFAULT 'collaborator',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_membership (project_id, user_id)
);

-- Skills catalog
CREATE TABLE skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  UNIQUE KEY unique_skill (skill_name)
);

-- Project skills (explicit skill scope)
CREATE TABLE project_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  skill_id INT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY unique_project_skill (project_id, skill_id)
);

-- User skill signals (append-only, single source of truth)
CREATE TABLE user_skill_signals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  source_type ENUM('project', 'update', 'mentorship') NOT NULL,
  source_id INT NOT NULL,
  signal_type ENUM('joined', 'update', 'completed', 'validated') NOT NULL,
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY unique_signal (user_id, skill_id, source_type, source_id, signal_type)
);

-- Mentorship sessions
CREATE TABLE mentorship_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  intern_id INT NOT NULL,
  mentor_id INT NOT NULL,
  topic VARCHAR(255),
  details TEXT,
  session_focus ENUM('project_support', 'technical_guidance', 'career', 'leadership'),
  scheduled_at DATETIME,
  status ENUM('pending', 'accepted', 'completed', 'declined', 'rescheduled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (intern_id) REFERENCES users(id),
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);

-- Session skills
CREATE TABLE session_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT NOT NULL,
  skill_id INT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES mentorship_sessions(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY unique_session_skill (session_id, skill_id)
);

-- Progress updates
CREATE TABLE progress_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chat channels
CREATE TABLE chat_channels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE chat_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  channel_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES chat_channels(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Direct messages
CREATE TABLE chat_dm_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- User presence
CREATE TABLE chat_presence (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  status ENUM('online', 'away', 'offline') DEFAULT 'offline',
  channel_id INT,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Badges
CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  category ENUM('project', 'mentorship', 'engagement') NOT NULL
);

-- User badges
CREATE TABLE user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  UNIQUE KEY unique_user_badge (user_id, badge_id)
);

-- Notifications
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Skill Signal Pipeline (A -> B -> C -> D)

The core innovation is an evidence-based skill tracking system:

### A - Project Context
Skills must be tied to concrete project scope. Project skills are explicitly defined in project_skills table.

### B - Mentorship Session
Mentorship does NOT emit skill signals by default. Only explicit skill verification during session completion generates signals.

### C - Progress Updates
When a progress update is posted, signals are emitted for all project skills.

### D - Analytics Layer
All skill charts read exclusively from user_skill_signals.

```javascript
// skillSignalService.js - Centralized signal emission
export async function emitSkillSignals({
  userId,
  sourceType,
  sourceId,
  signalType,
  skillIds = [],
  weight = 1,
  connection,
}) {
  // Guardrails: Only one service writes to user_skill_signals
  // Anti-gaming: Check for existing signals before inserting
  // Uniqueness constraint prevents duplicates
}
```

## API Routes

### Authentication
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/logout

### Users
- GET /users
- GET /users/:id/profile
- PUT /users/:id
- POST /users/:id/avatar

### Projects
- GET /projects
- POST /projects
- GET /projects/:id
- PUT /projects/:id
- POST /projects/:id/join
- POST /projects/:id/leave
- POST /projects/:id/skills

### Progress Updates
- GET /progress_updates
- POST /progress_updates

### Mentorship
- GET /mentorship/mentors
- GET /mentorship/sessions
- POST /mentorship/sessions
- POST /mentorship/sessions/:id/complete

### Skills
- GET /skills/user/:id/distribution
- GET /skills/user/:id/momentum
- GET /skills/user/:id/activity
- GET /skills/user/:id/signals

### Chat
- GET /chat/channels
- POST /chat/channels
- GET /chat/channels/:id/messages
- POST /chat/messages

### Badges
- GET /badges
- GET /badges/users/:id

### Admin
- GET /admin/stats
- GET /admin/errors
- GET /admin/health

## Key Features Implemented

1. **Authentication System**: User registration, login, role-based access control
2. **Collaboration Hub**: Project management, team features, progress updates
3. **Mentorship Bridge**: Mentor directory, session management, skill verification
4. **Skill Tracker**: Evidence-based analytics with distribution, momentum, activity charts
5. **Real-Time Chat**: Channels, direct messages, presence system
6. **Badge System**: Achievement tracking and notifications
7. **Admin Dashboard**: User management, analytics, error tracking, platform settings

## Security Features

- Password hashing
- JWT session management
- Rate limiting on API endpoints
- Helmet security headers
- Input validation with express-validator
- SQL injection prevention via parameterized queries

## Skills Demonstrated

- React 19 with hooks and context
- Node.js and Express API development
- MySQL database design with complex relationships
- RESTful API design
- Authentication and authorization
- Real-time features (polling-based)
- Data visualization with AG Charts and Recharts
- Skill tracking system design
- Anti-gaming guardrails
- Admin dashboard development
- File upload handling
- Swagger API documentation
