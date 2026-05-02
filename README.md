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

## Features

- Intern Lobby and Commencement System
- SyncChat with ICAA HQ (announcements, events, welcomes)
- Project collaboration with team management, discussions, and case studies
- Mentorship session booking, tracking, and skill verification
- Evidence-based skill tracking with peer validations
- Project Portfolio with GitHub/live URLs
- Professional profile credential pages
- Badge achievements system
- Admin dashboard with HQ management
- Invitation-based registration

## Documentation

See [docs/README.md](docs/README.md) for the full documentation index and getting started guide.

Key docs:
- [docs/README.md](docs/README.md) - Product overview, architecture, and setup
- [docs/TECHNICAL_SUMMARY.md](docs/TECHNICAL_SUMMARY.md) - API endpoints and schema reference
- [docs/architecture.md](docs/architecture.md) - Skill Signal pipeline specification
- [docs/ICAA_FINAL_PLAN.md](docs/ICAA_FINAL_PLAN.md) - ICAA production roadmap
- [docs/MENTORSHIP_GUARDRAILS.md](docs/MENTORSHIP_GUARDRAILS.md) - Design constraints

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS v4
- Node.js + Express 5
- MySQL 8 (Azure SQL in production)
