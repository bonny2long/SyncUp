# SyncUp

**The Intern Collaboration and Mentorship Reflection System**

SyncUp is a full-stack platform designed to connect interns, mentors, and alumni through real-world project collaboration and structured mentorship. Unlike traditional platforms that rely on manual skill logging, SyncUp uses an evidence-based **Skill Signal** pipeline to track professional growth.

---

## The Vision: A Reflection System

SyncUp is built on the philosophy that professional growth should be a mirror of real activity, not a manual checklist.

- **Evidence-Based**: Skills are derived from project work, updates, and verified mentorship.
- **High Integrity**: Guardrails ensure that only relevant, validated activities contribute to skill growth.
- **Decoupled Hubs**: Mentorship and Projects exist as independent but intersecting systems to support diverse career paths.

---

## Key Features (The Three Hubs)

### 1. Collaboration Hub

- **Project Discovery**: Browse and join intern-led projects.
- **Progress Feed**: Post real-time updates with dynamic skill tagging.
- **Team Management**: Collaborative project ownership and membership tracking.

### 2. Mentorship Bridge

- **Mentor Directory**: Connect with experienced mentors and alumni.
- **Independent Sessions**: Request guidance on career, technical, or life leadership.
- **Skill Verification**: Mentors verify technical skills during session completion to provide high-weight signals.

### 3. Skill Tracker

- **Skill Distribution**: Visualize your total skill volume across all activities.
- **Skill Momentum**: Track week-over-week growth and identify your fastest-rising skills.
- **Activity Sources**: See exactly what is driving your growth (Projects vs. Updates vs. Mentorship).

---

## Tech Stack

| Layer          | Technologies                           |
| -------------- | -------------------------------------- |
| **Frontend**   | React 18, Vite, Tailwind CSS, Recharts |
| **Backend**    | Node.js, Express                       |
| **Database**   | MySQL (Local), Azure SQL (Production)  |
| **State/Auth** | React Context + LocalStorage           |

---

## Roadmap Status

- **Phase 1 & 2 (Complete)**: Dynamic Skill Tagging, Mentor Endorsements, and Decoupled Mentorship.
- **Phase 3 (Planning Complete)**: Smart Suggestions, AI-Assisted Tagging, and Career Readiness Dashboard.
- **Phase 4 (Planning Complete)**: Peer Validation (Social Signals) and Team Momentum Analytics.

---

## Project Structure

```
SyncUp/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
├── docs/            # Project documentation (Architecture, Guardrails, Handoff)
└── index.html       # Landing page
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- MySQL 8.0+

### Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/SyncUp.git
   cd SyncUp
   ```

2. **Install Dependencies**:

   ```bash
   # Frontend
   cd client && npm install
   # Backend
   cd ../server && npm install
   ```

3. **Environment Configuration**:
   Configure `.env` files in both `/client` and `/server` (see internal READMEs for details).

4. **Start Development Servers**:
   ```bash
   # Terminal 1 (Backend)
   cd server && npm run dev
   # Terminal 2 (Frontend)
   cd client && npm run dev
   ```

---

## Contributors

- **Bonny Makaniankhondo** - Full-Stack Developer
- **Sofie Garcia** - Front-End Developer and Research Lead

---

## License

This project is developed as part of an internship collaboration program.
