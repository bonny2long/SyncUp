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

| Token                   | Color                   | Usage              |
| ----------------------- | ----------------------- | ------------------ |
| `--color-primary`       | Indigo Blue (#4C5FD5)   | Trust and Primary UI |
| `--color-secondary`     | Electric Purple (#9B5DE5) | Accent and Buttons   |
| `--color-accent`        | Aqua Cyan (#00C2BA)     | Highlights         |
| `--color-neutral-light` | Ghost White (#F5F7FA)   | Background         |
| `--color-neutral-dark`  | Graphite Gray (#2B2D42) | Text               |

## Folder Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, and icons
│   ├── components/
│   │   ├── layout/      # Layout components (Header, Footer, Sidebar)
│   │   └── ui/          # Reusable UI components
│   ├── data/            # Static data and constants
│   ├── pages/           # Page-level components
│   ├── App.jsx          # Root application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles and Tailwind imports
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
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

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start development server             |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview production build locally     |
| `npm run lint`    | Run ESLint for code quality checks   |

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established code style
3. Test thoroughly before submitting a pull request
