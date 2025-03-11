# High-Level Technical Architecture

## Overview

The high-level technical architecture for the Discord Music Release Web App. The application is designed to enable members of a Discord Community to create, schedule, and publish music release posts to Discord channels. It aggregates music data from external APIs (Spotify and Last.fm) and leverages Discord’s interactive features. The application is built using a modern, resource-efficient tech stack.

## Tech Stack

- **Backend:**

  - **Express (Node.js):** Provides a lightweight RESTful API server.
  - **Passport & passport-discord:** Handles Discord OAuth authentication.
  - **node-cron:** Schedules tasks (e.g., publishing posts).
  - **Drizzle ORM:** Offers a type-safe, lightweight ORM to interact with the SQLite database.
  - **SQLite:** A file-based database for data storage in low-resource environments.

- **Frontend:**

  - **Astro:** Generates a static-first, performant Progressive Web App (PWA) with support for partial hydration.
  - **React:** Powers interactive components (dashboard, multi-step forms, live preview).
  - **Tailwind CSS:** Provides a utility-first CSS framework for a modern, responsive UI.

- **External APIs:**
  - **Spotify API & Last.fm API:** Fetches music release and album details.
  - **Discord API/Webhooks:** Enables authentication and messaging features (including interactive elements).

## Architecture Components

### 1. Frontend

- **Astro Static Site:**  
  The core of the frontend is built with Astro, which generates fast, SEO-friendly static pages. Astro serves as the entry point to the application and delivers the PWA assets (service worker, manifest, etc.).

- **Interactive Components:**  
  React is used to build dynamic parts of the application such as the dashboard, multi-step post creation wizard, and live Discord embed preview. These components are “islands” embedded within Astro pages.

- **Styling:**  
  Tailwind CSS provides a responsive, utility-first styling framework that allows for rapid UI development and customization.

- **Local Storage & Auto-Save:**  
  The frontend uses local storage to auto-save user input (e.g., draft post data) to prevent data loss in the event of an unexpected page refresh.

### 2. Backend API

- **Express Server:**  
  The Express server exposes RESTful API endpoints for:

  - User authentication and Discord OAuth integration.
  - CRUD operations for posts.
  - Scheduling logic for posting releases.
  - Integration with external APIs (Spotify and Last.fm).

- **Authentication:**  
  Discord OAuth is implemented using Passport and the `passport-discord` strategy, ensuring only members of the designated Discord guild can access the application.

- **Task Scheduling:**  
  A node-cron-based scheduler periodically checks the database for scheduled posts. When a post’s scheduled time arrives, the scheduler dispatches the post to the appropriate Discord channel via API calls or webhooks.

- **External Integrations:**  
  The backend integrates with the Spotify and Last.fm APIs to enrich post data (album details, tracklist, cover art) and with the Discord API to send interactive messages.

### 3. Database

- **SQLite:**  
  The application uses SQLite as a lightweight, file-based database. This choice minimizes resource usage on low-spec VPS deployments while providing sufficient performance for the app’s requirements.

- **Drizzle ORM:**  
  Drizzle ORM is used to provide a type-safe and minimal abstraction layer over SQLite. It handles database interactions for user accounts, posts, and scheduling data.

### 4. Deployment & Operations

- **VPS Deployment:**  
  The app is deployed on a low-spec VPS, leveraging Nginx as a reverse proxy and static file server. Nginx serves the Astro-generated static assets while proxying API requests to the Express server.

- **Process Management:**  
  A process manager (e.g., PM2) is used to ensure the Express server and scheduled tasks run reliably, with automatic recovery in case of failures.

- **CI/CD & Version Control:**  
  The project is hosted on GitHub, with continuous integration (CI) pipelines set up (using GitHub Actions or similar) to automate testing and deployment. The architecture encourages community contributions by following clear modular design patterns and providing comprehensive documentation.

## Security Considerations

- **API Keys & Sensitive Data:**  
  All sensitive data (API keys, OAuth secrets, database credentials) are stored in environment variables and are not exposed in the source code.

- **Authentication & Authorization:**  
  Only verified Discord users who belong to the specified guild are allowed access. Role-based access control (e.g., ADMIN vs. POSTER) is implemented to restrict certain operations.

- **HTTP Headers & CORS:**  
  Security libraries (e.g., Helmet) are integrated into the Express server to set appropriate HTTP headers and protect against common web vulnerabilities. CORS settings ensure secure cross-origin interactions.

## Conclusion

We're creating a responsive, resource-efficient web app. It supports rich functionality, including Discord authentication, scheduling, live embed previews, and integration with external music data APIs, making it well-suited for a community-driven Discord music release tool.
