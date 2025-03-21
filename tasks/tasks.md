# Current Sprint Tasks

---

## APP-001: Project Setup & Repository Initialization

**Status:** Complete ✅  
**Priority:** Critical  
**Dependencies:** None

### Requirements

- Initialize Git repository and set up a basic folder structure
- Configure separate folders for the backend (Express) and frontend (Astro)
- Create initial `package.json` files for both projects
- Setup environment variable files (`.env`) for API keys, database URL, etc.

### Acceptance Criteria

1. Git repository is initialized and pushed to GitHub ✅
2. Project structure is organized with `/backend` and `/frontend` directories ✅
3. Basic `package.json` files exist and can install dependencies ✅

### Technical Notes

- Use a monorepo structure or separate repos as needed
- Ensure common code conventions (ESLint, Prettier) are configured

---

## APP-002: Database Setup with SQLite & Drizzle ORM

**Status:** Complete ✅
**Priority:** Critical  
**Dependencies:** APP-001

### Requirements

- Setup SQLite database file in a secure location
- Integrate Drizzle ORM in the backend project
- Define and implement initial database models for `User` and `Post`

### Acceptance Criteria

1. SQLite database file is created and accessible by the backend ✅
2. Drizzle ORM is installed and configured in the project ✅
3. Database schema for Users and Posts is fully defined and migrated ✅

### Technical Notes

- Write migrations or setup scripts to initialize the database schema
- Ensure models include fields for Discord authentication, post details, and scheduling

## APP-003: Mock Database Development

**Status:** Complete ✅
**Priority:** High  
**Dependencies:** APP-002

### Requirements

- Create a mock database implementation for development environments
- Implement conditional database loading based on environment variables
- Create scripts to run the application with mock database

### Acceptance Criteria

1. Mock database implementation exists and mimics the real database interface ✅
2. Application can run without requiring native module compilation ✅
3. Development scripts work correctly on Windows environments ✅

### Technical Notes

- Use JavaScript modules for compatibility
- Ensure error handling is consistent between real and mock implementations
- Document the mock database approach in the README

---

## APP-004: Implement User Authentication via Discord OAuth

**Status:** Complete ✅
**Priority:** High  
**Dependencies:** APP-001, APP-002

### Requirements

- Integrate Passport and passport-discord strategy in the Express backend
- Implement login endpoints and callback handling
- Store authenticated user data in the database with necessary Discord info (ID, guild, roles)

### Acceptance Criteria

1. Users can authenticate using their Discord account
2. Authenticated user details are stored in the SQLite database
3. Access control based on Discord guild membership and roles is enforced

### Technical Notes

- Use Passport middleware in Express
- Test authentication flow locally and log output for debugging

---

## APP-005: Build Express API Endpoints (CRUD for Posts)

**Status:** Complete ✅
**Priority:** High  
**Dependencies:** APP-002, APP-003

### Requirements

- Create RESTful endpoints for creating, reading, updating, and deleting posts
- Validate incoming request data with express-validator
- Ensure endpoints are secured (only authenticated users can create/edit posts)

### Acceptance Criteria

1. All CRUD operations for posts are functional and tested
2. Data validation and error handling are implemented ✅
3. Endpoints follow REST conventions and return appropriate status codes ✅

### Technical Notes

- Structure API routes under `/api` in the Express project ✅
- Log request/response for troubleshooting ✅

---

## APP-006: Implement Scheduling with node-cron

**Status:** Complete ✅  
**Priority:** High  
**Dependencies:** APP-004

### Requirements

- Integrate node-cron to periodically check for posts scheduled to be published ✅
- Create a service that queries the database for scheduled posts and sends them to Discord via webhooks ✅
- Update post status after successful dispatch ✅

### Acceptance Criteria

1. The scheduler runs at regular intervals (e.g., every minute) ✅
2. Scheduled posts are automatically sent to Discord when their time arrives ✅
3. Post status is updated to "PUBLISHED" after successful dispatch ✅

### Technical Notes

- Log scheduler activity for monitoring ✅
- Test with a few dummy scheduled posts ✅
- Properly handle mock database mode ✅

---

## APP-007: Develop Astro Frontend Shell with Tailwind CSS ✅

**Status**: Complete

**Requirements**:
- ✅ Set up Astro project with TypeScript support
- ✅ Configure Tailwind CSS and necessary plugins
- ✅ Create responsive layout component
- ✅ Implement basic pages (Home, Login, Dashboard, New Post)
- ✅ Add navigation and footer components
- ✅ Style with Tailwind CSS classes

**Technical Notes**:
- Used Astro's official React integration
- Configured Tailwind CSS with forms, typography, and aspect-ratio plugins
- Implemented responsive design patterns
- Created reusable layout component
- Added Discord-themed styling

---

## APP-008: Integrate React Components into Astro for Interactivity

**Status:** Complete  
**Priority:** High  
**Dependencies:** APP-006

### Requirements

- Add interactive components (multi-step wizard, live Discord embed preview, auto-save forms) using React within Astro
- Implement state management for form data (using hooks and local storage)

### Acceptance Criteria

1. Interactive React components are embedded in Astro pages ("islands")
2. Live preview updates as users input post data
3. Auto-save functionality saves draft data in local storage

### Technical Notes

- Consider using react-hook-form for form management
- Use lodash.debounce for efficient auto-save

---

## APP-009: External API Integrations (Spotify & Last.fm)

**Status:** Complete
**Priority:** Medium  
**Dependencies:** APP-004

### Requirements

- Create modules in the Express backend to interact with Spotify and Last.fm APIs
- Fetch album and track details to autofill post data based on user queries
- Handle API responses and errors gracefully

### Acceptance Criteria

1. External API calls return valid data for album lookups
2. Relevant music data is populated in the post creation form
3. Fallbacks are implemented in case of API failures ✅

### Technical Notes

- Use Axios for HTTP requests ✅
- Secure API keys in environment variables ✅

---

## APP-010: Implement Discord Webhook Integration for Posting

**Status:** Complete 
**Priority:** Medium  
**Dependencies:** APP-003, APP-004, APP-005

### Requirements

- Create functionality in the Express backend to send post data to Discord channels via webhooks
- Support interactive message components if required
- Log responses from Discord for debugging

### Acceptance Criteria

1. Posts are successfully dispatched to Discord channels
2. The Discord embed reflects live preview data from the post
3. Errors from Discord API are properly handled and logged

### Technical Notes

- Use Discord's webhook documentation to format messages
- Consider interactive components if supported by Discord

---

## APP-011: PWA Enhancements & Frontend Polish

**Status:** Complete 
**Priority:** Medium  
**Dependencies:** APP-006, APP-007

### Requirements

- Configure Astro for Progressive Web App capabilities (service worker, manifest)
- Optimize UI/UX for mobile responsiveness
- Finalize styles and component interactions with Tailwind CSS

### Acceptance Criteria

1. The app is installable as a PWA with an offline fallback
2. UI is fully responsive across devices
3. All interactive components have polished user experiences

### Technical Notes

- Use an Astro PWA plugin if available
- Test on multiple devices for responsiveness

---

## APP-012: Testing, CI/CD, and Production Readiness

**Status:** Complete ✅  
**Priority:** High  
**Dependencies:** APP-001 through APP-011

### Requirements

- Implement comprehensive testing for both backend and frontend
- Set up continuous integration and deployment pipelines
- Ensure production readiness with proper monitoring and security

### Acceptance Criteria

1. Backend unit tests are implemented with Jest and Supertest ✅
2. Frontend component tests are set up with Vitest and Testing Library ✅
3. GitHub Actions workflows for CI/CD are configured ✅
4. Security scanning and vulnerability checks are integrated ✅
5. Production deployment process is automated ✅
6. Error monitoring and logging are implemented ✅

### Technical Notes

- Backend tests cover API endpoints, controllers, and services
- Frontend tests focus on component rendering and user interactions
- CI pipeline runs tests, linting, and security checks
- CD pipeline automates deployment to VPS
- Discord notifications for deployment status
- Coverage reports uploaded to Codecov

### Implementation Details

1. Testing Infrastructure:
   - Backend: Jest + Supertest for API testing
   - Frontend: Vitest + Testing Library
   - Coverage thresholds set to 80%

2. CI/CD Pipeline:
   - GitHub Actions workflows for:
     - Continuous Integration (ci.yml)
     - Deployment (deploy.yml)
   - Automated testing on pull requests
   - Security scanning with Snyk

3. Production Deployment:
   - Automated deployment to VPS
   - PM2 for process management
   - Nginx configuration
   - Discord notifications

4. Monitoring & Security:
   - Error logging with Winston
   - Security headers with Helmet
   - Rate limiting
   - CORS configuration

---
