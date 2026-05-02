# SyncUp Master Hand-off Document

## 1. Project Vision & Philosophy

SyncUp is a "Reflection System" designed to connect interns, mentors, and alumni. Unlike traditional platforms that rely on manual skill logging or subjective self-reporting, SyncUp derives growth data from **real activity**.

### Core Principles

- **Evidence-Based Growth**: Skills are earned through demonstrated work (projects, updates, mentorship).
- **Integrity First**: Guardrails prevent conceptual drift (e.g., career advice doesn't boost technical skills).
- **Decoupled Hubs**: Mentorship and Projects are independent but intersecting systems.
- **Transparency**: Progress and skill tags are public to build trust and accountability.

---

## 2. System Architecture

SyncUp follows an **A → B → C → D** signal pipeline to ensure data integrity.

- **A (Raw Activity)**: User actions in the Collaboration Hub or Mentorship Bridge.
- **B (Signals)**: Activities emit append-only `user_skill_signals`.
- **C (Aggregation)**: Signals are aggregated by skill, week, and source.
- **D (Analytics)**: Read-only API layer powers the Skill Tracker visualizations.

### Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts.
- **Backend**: Node.js, Express.
- **Database**: MySQL (Local/Azure SQL).
- **State Management**: React Context (`UserContext`) + `localStorage`.

---

## 3. Database Schema

The system relies on a relational schema with 14 tables. The heart of the analytics is the `user_skill_signals` table.

### Key Tables

- **`users`**: Stores interns, mentors, and admins.
- **`projects`**: Core collaboration units with status tracking (`planned`, `active`, etc.).
- **`project_skills`**: Explicit skill scope for each project.
- **`progress_updates`**: Daily/weekly work logs.
- **`mentorship_sessions`**: Person-to-person guidance sessions.
- **`user_skill_signals`**: **The Single Source of Truth** for all skill growth.
- **`skills`**: Global library of technical and soft skills.

---

## 4. Frontend Structure (`/client`)

The frontend is organized into three primary "Hubs" accessible via the Dashboard.

### Collaboration Hub (`/pages/CollaborationHub`)

- **Project List**: Browse, join, and manage projects.
- **Progress Feed**: Post updates with dynamic skill tagging.
- **Project Detail Modal**: Deep dive into project members and history.

### Mentorship Bridge (`/pages/MentorshipBridge`)

- **Mentor Directory**: Search and view mentor profiles/availability.
- **Session Management**: Request, accept, and complete sessions.
- **Skill Verification**: Mentors verify technical skills during session completion.

### Skill Tracker (`/pages/SkillTracker`)

- **Skill Distribution**: Horizontal bar chart of total skill volume.
- **Skill Momentum**: Line chart showing week-over-week growth deltas.
- **Activity Sources**: Stacked bar chart showing where growth is coming from.

---

## 5. Backend Logic (`/server`)

### Controllers

- **`projectsController.js`**: Handles project CRUD and membership.
- **`progressController.js`**: Manages updates and emits signals for tagged skills.
- **`mentorshipController.js`**: Manages the session lifecycle and verification flow.
- **`skillsController.js`**: Handles skill discovery and user distribution data.
- **`analyticsController.js`**: Powers the complex momentum and activity charts.

### Services

- **`skillSignalService.js`**: The **only** authorized write-path for skill signals. It enforces guardrails and ensures uniqueness.

---

## 6. Key Workflows

### Posting a Progress Update

1. User types content and tags skills (e.g., "React").
2. `progressController` inserts the update.
3. `skillSignalService` emits a signal with `weight: 1`.
4. Skill Tracker charts update automatically on the next refresh.

### Completing a Mentorship Session

1. Mentor clicks "Complete" on a technical session.
2. `SkillSelectModal` prompts for specific skills practiced.
3. `mentorshipController` updates status and emits signals with `weight: 3`.

---

## 7. Current Status & Roadmap

### Phase 1 & 2 (Complete)

- Dynamic Skill Tagging in Projects and Updates.
- Mentor Endorsements and weighted verification.
- Full decoupling of Mentorship from Projects.

### Phase 3 (Planning Complete)

- **Smart Suggestions**: Contextual skill chips in the update form.
- **AI-Assisted Tagging**: Content-based tag suggestions (Heuristic/LLM).
- **Career Readiness**: Role-mapping and gap analysis dashboard.

### Phase 4 (Planning Complete)

- **Social Validation**: Peer upvotes on skill tags.
- **Team Momentum**: Aggregate growth views for project leads.
- **Engagement Ladder**: Visualizing mentor participation.

---

## 8. Developer Onboarding

1. **Setup**: `npm install` in both `client/` and `server/`.
2. **Database**: Import the schema and seed users/projects.
3. **Environment**: Set `VITE_API_BASE` in `client/.env`.
4. **Run**: `npm run dev` in both directories.
