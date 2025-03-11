# KLPoster <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0"/>

<div align="center">
  
![KLPoster Logo](https://via.placeholder.com/150x150.png?text=KL)

**A modern web application for Kingdom Leaks Discord community to create, schedule, and publish music release posts to Discord channels.**

[![Discord](https://img.shields.io/discord/123456789?color=5865F2&logo=discord&logoColor=white&label=Kingdom%20Leaks)](https://discord.gg/EAR6Yyg3)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)

</div>

## ✨ Features

- **Discord Integration** - Seamless OAuth authentication with Discord
- **Music API Integration** - Aggregate music data from Spotify and Last.fm
- **Post Scheduling** - Create and schedule posts for automatic publishing
- **Live Preview** - Real-time Discord embed preview while creating posts
- **Mobile-friendly** - Responsive Progressive Web App (PWA) interface
- **Mock Database** - Simplified development with mock database support

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
        <li>Passport.js</li>
        <li>Node-cron</li>
        <li>TypeScript</li>
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
      </ul>
    </td>
    <td>
      <ul>
        <li>Git</li>
        <li>Node.js</li>
        <li>npm</li>
        <li>Cloudflare Pages</li>
        <li>Cloudflare Workers</li>
        <li>Cloudflare D1</li>
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
   node setup-mock-db.js
   ```

2. Run the test server:

   ```bash
   node run-test-server.js
   ```

   Or run the full server with mock database:

   ```bash
   node run-with-mock.js
   ```

3. Access the health endpoint to verify the server is running:

   ```
   http://localhost:3000/api/health
   ```

#### Production Backend

For production with better-sqlite3:

1. Install Visual Studio 2022 Build Tools with C++ desktop development workload
2. Run the standard development server:

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
