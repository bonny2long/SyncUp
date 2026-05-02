Original location: /server/README.md

# SyncUp Backend

Backend API for the SyncUp / ICAA platform, powered by Node.js, Express 5, and MySQL 8.

## Tech Stack

- Node.js v20+ - JavaScript runtime
- Express 5 - Web application framework
- MySQL2 - MySQL client with Promise support
- MSSQL - Microsoft SQL Server client (Azure SQL, installed but not active)
- dotenv - Environment variable management
- CORS - Cross-Origin Resource Sharing
- Helmet - Security headers
- multer - File upload handling
- express-rate-limit - API rate limiting
- express-validator - Request validation
- swagger-jsdoc + swagger-ui-express - API documentation
- axios - HTTP client
- @faker-js/faker - Demo data generation
- Nodemon - Development auto-restart

## Getting Started

### Prerequisites

- Node.js v20 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Installation

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the database connection by creating a `.env` file:

   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=syncup_local
   PORT=5000
   ```

4. Import the database schema:

   ```bash
   mysql -u your_username -p syncup_local < schema/syncup_local.sql
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

| Command       | Description                           |
| ------------- | ------------------------------------- |
| `npm run dev` | Start development server with Nodemon |
| `npm start`   | Start production server               |

## API Documentation

Swagger/OpenAPI documentation is available at:

```
http://localhost:5000/api-docs
```

## Folder Structure

```
server/
├── src/
│   ├── config/          # Configuration
│   │   ├── db.js        # MySQL connection pool
│   │   ├── rateLimit.js # Rate limiting rules
│   │   └── swagger.js   # Swagger API docs config
│   ├── controllers/     # Request handlers (13 files)
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── announcementController.js
│   │   ├── authController.js
│   │   ├── badgeController.js
│   │   ├── chatController.js
│   │   ├── errorController.js
│   │   ├── eventController.js
│   │   ├── mentorshipController.js
│   │   ├── notificationController.js
│   │   ├── progressController.js
│   │   ├── projectsController.js
│   │   ├── skillsController.js
│   │   └── usersController.js
│   ├── routes/          # API route definitions (15 files)
│   ├── services/        # Business logic (4 files)
│   │   ├── skillSignalService.js
│   │   ├── badgeService.js
│   │   ├── checkBadges.js
│   │   └── notificationService.js
│   ├── middleware/
│   │   └── maintenanceMode.js
│   ├── validators/
│   │   └── index.js     # Request validation rules
│   ├── database/        # SQL migration files
│   └── server.js        # Server entry point
├── .env                 # Environment variables (not tracked)
├── uploads/             # Uploaded files (avatars, attachments)
└── package.json         # Project dependencies
```

## Rate Limiting

| Tier       | Limit           | Applied To |
|------------|-----------------|------------|
| General    | 500 req / 15min | Most endpoints |
| Strict     | 100 req / 15min | Sensitive operations |
| Create     | 30 req / 15min  | POST endpoints |
| Search     | 60 req / 1min   | Search endpoints |
| Sensitive  | 20 req / 15min  | Auth endpoints |
| Admin      | 100 req / 15min | Admin operations |

## Database Schema

The application uses the `syncup_local` MySQL database with 20+ tables including:

- **users** - User accounts with roles, commencement, cycle, profile links, privacy settings
- **projects** - Projects with status, visibility, GitHub/live URLs, case study fields
- **project_members** - User-project membership
- **project_skills** - Skills associated with projects
- **project_discussions** - Project-specific discussions
- **project_join_requests** - Join request management
- **progress_updates** - Work logs and skill signal sources
- **skills** - Global skill library
- **user_skill_signals** - Append-only evidence-based growth engine
- **skill_validations** - Peer upvotes and mentor endorsements
- **mentorship_sessions** - Independent mentorship tracking
- **mentorship_session_skills** - Skills practiced in sessions
- **channels / channel_members / messages** - Chat system
- **user_presence** - Online/offline status
- **announcements / announcement_reads** - Org announcements with read tracking
- **events / event_rsvps** - Community events with RSVP
- **badges / user_badges** - Achievement system
- **notifications** - In-app notifications
- **system_errors** - Error tracking
- **platform_settings** - Key-value settings
- **admin_invitations** - Invitation-based registration

## Services

| Service | Purpose |
|---------|---------|
| `skillSignalService.js` | Centralized skill signal emission and momentum calculation |
| `badgeService.js` | Badge eligibility checking and awarding |
| `notificationService.js` | Notification creation and delivery |

## Contributing

1. Create a feature branch from `main`
2. Follow RESTful API design principles
3. Document any new endpoints in TECHNICAL_SUMMARY.md
4. Test thoroughly before submitting a pull request
