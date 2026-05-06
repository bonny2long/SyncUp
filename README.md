# SyncUp / ICAA

Intern collaboration, mentorship, and professional community platform with evidence-based skill tracking.

## Quick Start

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment (see docs/README.md)
# Edit client/.env and server/.env

# Start development servers
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

## Platform Layers

### Sidebar Navigation Tabs

| Tab | Route | Access | Description |
|-----|--------|--------|-------------|
| **Admin Dashboard** | `/admin` | Admin only | Platform management and settings |
| **Collaboration Hub** | `/collaboration` | Non-admin users | Project collaboration workspace |
| **SyncChat** | `/chat` | Community members + commenced interns | Community chat and messaging |
| **Member Directory** | `/directory` | Community members + admins | Browse member profiles |
| **Opportunity Board** | `/opportunities` | Community members + admins | Job and opportunity sharing |
| **Mentorship Bridge** | `/mentorship` | Non-admin users | Mentorship session management |
| **Project Portfolio** | `/portfolio` | All authenticated | Professional project showcase |
| **Intern Lobby** | `/lobby` | Interns only | Pre-commencement space |
| **Skill Tracker** | `/skills` | Interns only | Evidence-based skill analytics |

See [docs/sidebar-tabs/](docs/sidebar-tabs/) for detailed documentation on each tab.

## Core Features

- **Intern Lobby and Commencement System** - Pre-commencement space with cohort chat
- **SyncChat** - Community chat with channels, DMs, and ICAA HQ strip
- **Collaboration Hub** - Project discovery, team management, discussions, case studies
- **Mentorship Bridge** - Session booking, skill verification, mentor leaderboard
- **Evidence-Based Skill Tracking** - Read-only analytics from real work activities
- **Project Portfolio** - Professional showcase with case studies
- **Member Directory** - Community member discovery with governance badges
- **Opportunity Board** - Job and opportunity sharing for community
- **Badge Achievements** - Automated badge awards for milestones
- **Admin Dashboard** - Full platform management and settings
- **Invitation-Based Registration** - Secure onboarding system

## Documentation

See [docs/README.md](docs/README.md) for the full documentation index and getting started guide.

### Key Documentation
| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Product overview, architecture, and setup |
| [docs/sidebar-tabs/](docs/sidebar-tabs/) | One doc per sidebar tab (9 tabs) |
| [docs/TECHNICAL_SUMMARY.md](docs/TECHNICAL_SUMMARY.md) | API endpoints and schema reference |
| [docs/architecture.md](docs/architecture.md) | Skill Signal pipeline (A->B->C->D) |
| [docs/CHAT_SYSTEM.md](docs/CHAT_SYSTEM.md) | SyncChat system documentation |
| [docs/README_client.md](docs/README_client.md) | Frontend setup and development |
| [docs/README_server.md](docs/README_server.md) | Backend setup and development |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, Tailwind CSS v4, Recharts, AG Charts, Lucide React |
| Backend | Node.js, Express 5, MySQL 8 (Azure SQL in production) |
| State/Auth | React Context + LocalStorage |
| Charts | Recharts, AG Charts Community |
| PDF | jsPDF + jsPDF-AutoTable |
| API Docs | Swagger/OpenAPI |
