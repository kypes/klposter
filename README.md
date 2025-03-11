# KLPoster <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0"/>

<div align="center">
  
![KLPoster Logo](https://kingdom-leaks.com/img/ripsuit.png)

**A modern web application for Kingdom Leaks Discord community to create, schedule, and publish music release posts to Discord channels.**

[![Discord](https://img.shields.io/discord/123456789?color=5865F2&logo=discord&logoColor=white&label=Kingdom%20Leaks)](https://discord.gg/EAR6Yyg3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Astro](https://img.shields.io/badge/Astro-latest-ff5a03?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-latest-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-latest-61DAFB?logo=react&logoColor=white)](https://react.dev/)

</div>

## ✨ Features

- **Discord Integration** - Seamless OAuth authentication with Discord
- **Music API Integration** - Aggregate music data from Spotify and Last.fm
- **Post Scheduling** - Create and schedule posts for automatic publishing
- **Live Preview** - Real-time Discord embed preview while creating posts
- **Mobile-friendly** - Responsive Progressive Web App (PWA) interface
- **Mock Database** - Development without native module dependencies:
  - In-memory JavaScript implementation of SQLite/Drizzle
  - Conditional activation based on environment variables
  - Test server with health endpoints for verification
  - Windows compatibility without Visual Studio build tools

## 🚀 Tech Stack

<table>
  <tr>
    <td align="center"><strong>Backend</strong></td>
    <td align="center"><strong>Frontend</strong></td>
    <td align="center"><strong>DevOps</strong></td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>Express.js</li>
        <li>Drizzle ORM</li>
        <li>SQLite/better-sqlite3</li>
        <li>Passport.js (Discord OAuth)</li>
        <li>Node-cron</li>
        <li>Winston (Logging)</li>
        <li>Express Middleware:
          <ul>
            <li>Helmet (Security)</li>
            <li>CORS</li>
            <li>Morgan (HTTP Logging)</li>
            <li>Express Validator</li>
          </ul>
        </li>
        <li>TypeScript</li>
        <li>Axios</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Astro</li>
        <li>React</li>
        <li>TailwindCSS</li>
        <li>DaisyUI</li>
        <li>Lucide Icons</li>
        <li>TypeScript</li>
        <li>React Hook Form</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Git</li>
        <li>Node.js</li>
        <li>npm</li>
        <li>Environment Management:
          <ul>
            <li>dotenv</li>
            <li>Mock database mode</li>
          </ul>
        </li>
        <li>Deployment Options:
          <ul>
            <li>Cloudflare Pages</li>
            <li>Cloudflare Workers</li>
            <li>Cloudflare D1</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## 📂 Project Structure

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
│   ├── .env.mock      # Environment variables for mock mode
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
│   ├── astro.config.mjs # Astro configuration
│   ├── package.json   # Dependencies and scripts
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── tsconfig.json  # TypeScript configuration
│
├── docs/              # Documentation
└── tasks/             # Task definitions
```

## 🌟 About Kingdom Leaks

Kingdom Leaks is a vibrant community dedicated to music enthusiasts, providing the latest information about music releases across various genres. The community thrives on Discord, where members can discuss and share their passion for music.

[Join our Discord community!](https://discord.gg/EAR6Yyg3)

## 🚦 Getting Started

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
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables by creating `.env` files based on examples.

### Development

#### Backend with Mock Database

For development without native module dependencies:

1. Set up the mock database:

   ```bash
   cd backend
   node setup-mock-db.js
   ```

2. Run the test server (minimal implementation with just the health endpoint):

   ```bash
   node run-test-server.js
   ```

   Or run the full server with mock database:

   ```bash
   node run-with-mock.js
   ```

3. Access the health endpoint to verify the server is running:

   ```
   http://localhost:3000/api/health        # Main health endpoint
   http://localhost:3000/api/music/health  # Music API health endpoint
   ```

4. Server logs are available in:

   ```
   backend/logs/all.log    # All log messages
   backend/logs/error.log  # Error messages only
   ```

5. Troubleshooting:
   - If you see "ts-node-dev is not a function" errors, run `npm install -g ts-node-dev ts-node`
   - For scheduler errors, ensure environment variable MOCK_DB is set to "true"
   - For permissions errors, try running with administrator privileges

#### Production Backend

For production with better-sqlite3:

1. Install Visual Studio 2022 Build Tools with C++ desktop development workload
2. Run the database setup and migrations:

   ```bash
   cd backend
   npm run db:setup
   npm run db:migrate
   ```

3. Run the standard development server:

   ```bash
   npm run dev
   ```

#### Frontend

Start the frontend development server:

```bash
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:4321`

## 🧪 API Testing

You can test the backend API endpoints using tools like Postman, curl, or PowerShell:

### Public Endpoints

These endpoints don't require authentication:

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:3000/api/health" | Select-Object -ExpandProperty Content

# Music API health check
Invoke-WebRequest -Uri "http://localhost:3000/api/music/health" | Select-Object -ExpandProperty Content
```

### Protected Endpoints

These endpoints require authentication. You'll get a 401 Unauthorized response without valid authentication:

```powershell
# Try to access posts (will return 401)
try {
  Invoke-WebRequest -Uri "http://localhost:3000/api/posts"
} catch {
  Write-Host "Status code:" $_.Exception.Response.StatusCode
}

# Try to search Spotify (will return 401)
try {
  Invoke-WebRequest -Uri "http://localhost:3000/api/music/spotify/search?q=TestQuery"
} catch {
  Write-Host "Status code:" $_.Exception.Response.StatusCode
}
```

For full API testing with authentication, you'll need to:

1. Configure Discord OAuth credentials in your `.env` file
2. Log in through the frontend or use a tool that supports OAuth flows
3. Include the session cookie in your requests

## 🚀 Deployment

The application can be deployed using:

- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers with D1 database

Alternatively, deploy to a VPS with Nginx as a reverse proxy:

1. Build the frontend and backend
2. Configure Nginx
3. Use PM2 to manage the server process

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Kingdom Leaks Community](https://discord.gg/EAR6Yyg3) for inspiration and support
- All the open-source libraries and frameworks that made this project possible
