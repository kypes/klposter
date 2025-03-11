# KLPoster - Discord Music Release Web App

A web application for creating, scheduling, and publishing music release posts to Discord channels. It aggregates music data from external APIs (Spotify and Last.fm) and leverages Discord's interactive features.

## Features

- Discord OAuth authentication
- Music release post creation with data from Spotify and Last.fm
- Post scheduling and automatic publishing
- Live Discord embed preview
- Mobile-responsive PWA interface

## Tech Stack

### Backend

- Express (Node.js)
- Passport & passport-discord for authentication
- node-cron for scheduling
- Drizzle ORM with SQLite
- TypeScript

### Frontend

- Astro for static site generation
- React for interactive components
- Tailwind CSS with DaisyUI for styling
- Lucide icons
- TypeScript

## Project Structure

```
klposter/
├── backend/           # Express API server
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── db/        # Database models and migrations
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   ├── types/     # TypeScript type definitions
│   │   ├── utils/     # Utility functions
│   │   └── index.ts   # Entry point
│   ├── .env.example   # Environment variables template
│   ├── package.json   # Dependencies and scripts
│   └── tsconfig.json  # TypeScript configuration
│
├── frontend/          # Astro + React frontend
│   ├── public/        # Static assets
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── layouts/   # Page layouts
│   │   ├── pages/     # Astro pages
│   │   ├── styles/    # Global styles
│   │   └── utils/     # Utility functions
│   ├── .env.example   # Environment variables template
│   ├── astro.config.mjs # Astro configuration
│   ├── package.json   # Dependencies and scripts
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── tsconfig.json  # TypeScript configuration
│
├── docs/              # Documentation
└── tasks/             # Task definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Discord application credentials
- Spotify API credentials
- Last.fm API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/klposter.git
   cd klposter
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   cp .env.example .env  # Copy and configure environment variables
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env  # Copy and configure environment variables
   ```

4. Configure environment variables:
   - Set up Discord OAuth credentials
   - Configure Spotify and Last.fm API keys
   - Set database path and other required variables

### Development

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:4321`

## Deployment

The application can be deployed on a VPS with Nginx as a reverse proxy:

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:

   ```bash
   cd backend
   npm run build
   ```

3. Configure Nginx to serve the static frontend files and proxy API requests to the Express server.

4. Use a process manager like PM2 to keep the backend server running.

## License

[MIT License](LICENSE)
