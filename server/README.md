# SyncUp Backend

Backend API for the SyncUp platform, powered by Node.js and Express with a MySQL database.

## Tech Stack

- **Node.js v20+** - JavaScript runtime
- **Express 5** - Web application framework
- **MySQL2** - MySQL client with Promise support
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Development auto-restart utility

## API Endpoints

### Users

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/users`     | Retrieve all users       |
| GET    | `/api/users/:id` | Retrieve user by ID      |
| POST   | `/api/users`     | Create a new user        |
| PUT    | `/api/users/:id` | Update an existing user  |
| DELETE | `/api/users/:id` | Delete a user            |

### Projects

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/projects`     | Retrieve all projects       |
| GET    | `/api/projects/:id` | Retrieve project by ID      |
| POST   | `/api/projects`     | Create a new project        |
| PUT    | `/api/projects/:id` | Update an existing project  |
| DELETE | `/api/projects/:id` | Delete a project            |

## Folder Structure

```
server/
├── config/              # Database and application configuration
├── controllers/         # Request handlers and business logic
├── middleware/          # Custom middleware functions
├── models/              # Database models and schemas
├── routes/              # API route definitions
├── utils/               # Utility functions and helpers
├── app.js               # Express application setup
├── server.js            # Server entry point
├── .env                 # Environment variables (not tracked)
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

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with Nodemon    |
| `npm start`     | Start production server                  |
| `npm test`      | Run test suite                           |

## Database Schema

The application uses the `syncup_local` MySQL database with tables for:

- **users** - User accounts and profiles
- **projects** - Collaborative project information
- **skills** - Skill categories and assessments
- **mentorships** - Mentor-mentee relationships
- **reflections** - Progress tracking and personal reflections

## Contributing

1. Create a feature branch from `main`
2. Follow RESTful API design principles
3. Document any new endpoints in this README
4. Test thoroughly before submitting a pull request
