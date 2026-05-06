Original location: /client/README.md

# SyncUp Frontend

Frontend application for the SyncUp / ICAA platform, built with React 19 and Vite 7, styled using Tailwind CSS v4.

## Tech Stack

- **React 19** - UI component library
- **Vite 7** - Build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Recharts** - Charting library
- **AG Charts** - High-performance charting library
- **Lucide React** - Beautiful and consistent icons
- **React Router DOM** - Client-side routing
- **PostCSS** - CSS processing
- **jsPDF + jsPDF-AutoTable** - PDF resume export

## Design System

### Color Palette

| Token                   | Color                     | Usage                |
| ----------------------- | ------------------------- | -------------------- |
| `--color-primary`       | Indigo Blue (#4C5FD5)     | Trust and Primary UI |
| `--color-secondary`     | Electric Purple (#9B5DE5) | Accent and Buttons   |
| `--color-accent`        | Aqua Cyan (#00C2BA)       | Highlights           |
| `--color-neutral-light` | Ghost White (#F5F7FA)     | Background           |
| `--color-neutral-dark`  | Graphite Gray (#2B2D42)   | Text                 |

## Folder Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, and icons
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   ├── ui/          # Generic UI components
│   │   ├── settings/    # Settings page sections
│   │   ├── badges/      # Badge display components
│   │   ├── admin/       # Admin-specific components
│   │   ├── SkillTracker/ # Skill tracking visualizations
│   │   ├── modals/      # Modal dialogs
│   │   └── shared/      # Shared components (ProjectCard, RoleBadge, etc.)
│   ├── context/         # React Context providers
│   │   ├── UserContext.jsx      # Authentication state
│   │   ├── ToastContext.jsx     # Toast notifications
│   │   ├── ThemeContext.jsx     # Theme switching
│   │   └── OnboardingContext.jsx # Onboarding tour state
│   ├── pages/           # Page-level components
│   │   ├── CollaborationHub/ # Project discovery and updates
│   │   ├── MentorshipBridge/ # Mentor directory and sessions
│   │   ├── SkillTracker/ # Skill analytics dashboard
│   │   ├── Chat/        # SyncChat and community features
│   │   ├── Dashboard.jsx # Main overview (hub container)
│   │   ├── AdminDashboard.jsx # Admin panel
│   │   ├── InternLobby.jsx # Intern pre-commencement space
│   │   ├── Login.jsx    # Authentication page
│   │   ├── Register.jsx # Invitation-based registration
│   │   ├── UserProfile.jsx # User profile management
│   │   ├── ProjectPortfolio.jsx # User project showcase
│   │   ├── Settings.jsx # User settings
│   │   └── Maintenance.jsx # Maintenance mode page
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # API utilities and helpers
│   ├── App.jsx          # Root application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles and Tailwind imports
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── postcss.config.js    # PostCSS configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js v20 or higher
- npm or yarn package manager

### Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build locally   |
| `npm run lint`    | Run ESLint for code quality checks |

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_BASE=http://localhost:5000/api
```

## Pages and Routes

### Sidebar Tabs (Main Navigation)

| Route | Component | Access | Sidebar ID |
|-------|-----------|--------|-------------|
| `/admin` | AdminDashboard | Admin only | `admin` |
| `/collaboration` | CollaborationHub | Non-admin only | `collaboration` |
| `/chat` | Chat (SyncChat) | Community members + commenced interns | `chat` |
| `/directory` | MemberDirectory | Community members + admins | `directory` |
| `/opportunities` | OpportunityBoard | Community members + admins | `opportunities` |
| `/mentorship` | MentorshipBridge | Non-admin only | `mentorship` |
| `/portfolio` | ProjectPortfolio | Authenticated | `portfolio` |
| `/lobby` | InternLobby | Interns only (non-admin) | `lobby` |
| `/skills` | SkillTracker | Interns only (non-admin) | `skills` |

### Other Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | HomeRedirect | Redirects to /admin or /collaboration |
| `/login` | Login | Public |
| `/register` | Register | Invitation required |
| `/maintenance` | Maintenance | Public |
| `/profile/:userId` | UserProfile | Authenticated |
| `/settings` | Settings | Authenticated |

See [sidebar-tabs/](sidebar-tabs/) for detailed documentation on each sidebar tab.

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established code style
3. Test thoroughly before submitting a pull request
