Original location: /client/README.md

# SyncUp Frontend

Frontend application for the SyncUp platform, built with React and Vite, styled using Tailwind CSS v4.

## Tech Stack

- **React 18** - UI component library
- **Vite 7** - Build tool and development server
- **Tailwind CSS v4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefix automation

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
│   │   ├── ProjectPortfolio/ # Project-specific components
│   │   ├── SkillTracker/ # Skill tracking visualizations
│   │   ├── modals/      # Modal dialogs
│   │   ├── shared/      # Shared components (SkillMultiSelect)
│   │   └── HealthStatus.jsx # Backend health indicator
│   ├── context/         # React Context (UserContext)
│   ├── pages/           # Page-level components
│   │   ├── CollaborationHub/ # Project discovery and updates
│   │   ├── MentorshipBridge/ # Mentor directory and sessions
│   │   ├── SkillTracker/ # Skill analytics dashboard
│   │   ├── Dashboard.jsx # Main overview
│   │   ├── Login.jsx    # Authentication page
│   │   └── ProjectPortfolio.jsx # User project showcase
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

Create a `.env` file in the client directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established code style
3. Test thoroughly before submitting a pull request
