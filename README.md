# SyncUp

**Intern Collaboration and Mentorship Platform**

## Overview

SyncUp is a full-stack web application designed to connect interns, mentors, and alumni for collaboration, skill growth, and real-time feedback. The platform provides a centralized space where interns can discover projects, find mentors, and track their professional development through structured reflections and progress monitoring.

## Key Features

- **Project Discovery**: Browse and join collaborative projects with other interns
- **Mentor Matching**: Connect with experienced mentors and alumni for guidance
- **Skill Tracking**: Monitor personal growth through reflections and skill assessments
- **Real-Time Collaboration**: Work together on projects with built-in communication tools
- **Progress Analytics**: Track development milestones and achievements

## Tech Stack

| Layer             | Technologies                       |
| ----------------- | ---------------------------------- |
| Frontend          | React, Vite, Tailwind CSS          |
| Backend           | Node.js, Express                   |
| Database          | MySQL (local development), Azure SQL (production) |
| Cloud Services    | Azure Cognitive Services, Power BI |
| Version Control   | GitHub                             |

## Project Structure

```
SyncUp/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
├── index.html       # Landing page
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites

- Node.js v20 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/SyncUp.git
   cd SyncUp
   ```

2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```

4. Configure environment variables (see individual README files in `/client` and `/server` directories)

5. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## Contributors

- **Bonny Makaniankhondo** - Full-Stack Developer
- **Sofie Garcia** - Front-End Developer and Research Lead

## License

This project is developed as part of an internship collaboration program.
