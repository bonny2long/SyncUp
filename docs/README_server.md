Original location: /server/README.md

# SyncUp Backend

Backend API for the SyncUp platform, powered by Node.js and Express with a MySQL database.

## Tech Stack

- Node.js v20+ - JavaScript runtime
- Express 5 - Web application framework
- MySQL2 - MySQL client with Promise support
- MSSQL - Microsoft SQL Server client (Azure SQL support)
- dotenv - Environment variable management
- CORS - Cross-Origin Resource Sharing
- axios - Promise based HTTP client
- faker - Generate massive amounts of fake data
- Nodemon - Development auto-restart utility

## API Endpoints

### Users

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/api/users`     | Retrieve all users      |
| GET    | `/api/users/:id` | Retrieve user by ID     |
| POST   | `/api/users`     | Create a new user       |
| PUT    | `/api/users/:id` | Update an existing user |
| DELETE | `/api/users/:id` | Delete a user           |

### Projects

| Method | Endpoint            | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/api/projects`     | Retrieve all projects      |
| GET    | `/api/projects/:id` | Retrieve project by ID     |
| POST   | `/api/projects`     | Create a new project       |
| PUT    | `/api/projects/:id` | Update an existing project |
| DELETE | `/api/projects/:id` | Delete a project           |

### Analytics

| Method | Endpoint                    | Description                           |
| ------ | --------------------------- | ------------------------------------- |
| GET    | `/api/analytics/top-skills` | Get top skills distribution and trend |

### Health

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| GET    | `/api/health` | Check API health status |

## Folder Structure

```
server/
├── src/
│   ├── config/          # Database configuration (db.js)
│   ├── controllers/     # Request handlers
│   │   ├── analyticsController.js
│   │   ├── mentorshipController.js
│   │   ├── progressController.js
│   │   ├── projectsController.js
│   │   ├── skillsController.js
│   │   └── usersController.js
│   ├── routes/          # API route definitions
│   │   ├── analyticsRoutes.js
│   │   ├── healthRoute.js
│   │   ├── mentorshipRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── projectsRoutes.js
│   │   ├── skillsRoutes.js
│   │   └── usersRoutes.js
│   ├── services/        # Business logic
│   │   ├── skillSignalService.js
│   │   └── __tests__/   # Service tests
│   ├── server.js        # Server entry point
│   └── debug_*.js       # Debugging utilities
├── .env                 # Environment variables (not tracked)
├── check_db.js          # Database connectivity check
└── package.json         # Project dependencies
```

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
   # For Azure SQL (MSSQL)
   # DB_SERVER=your_server.database.windows.net
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
| `npm test`    | Run test suite                        |

## Database Schema

The application uses the `syncup_local` MySQL database with tables for:

- **users** - User accounts and profiles
- **projects** - Collaborative project information
- **skills** - Global skill library
- **mentorship_sessions** - Independent mentorship tracking
- **progress_updates** - Work logs and skill signal sources
- **user_skill_signals** - The evidence-based growth engine

## Contributing

1. Create a feature branch from `main`
2. Follow RESTful API design principles
3. Document any new endpoints in this README
4. Test thoroughly before submitting a pull request
