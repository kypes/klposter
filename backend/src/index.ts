import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { setupPassport } from './config/passport';
import { authRoutes } from './routes/auth-routes';
import postRoutes from './routes/post-routes';
import { musicApiRoutes } from './routes/music-api-routes';
import albumRoutes from './routes/album.routes';
import { errorHandler } from './middleware/error-handler';
import { initScheduler } from './services/scheduler-service';
import { runMigrations } from './db/migrate';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Run database migrations
runMigrations()
  .then(() => {
    // Middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:4321',
      credentials: true
    }));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Session configuration
    app.use(session({
      secret: process.env.SESSION_SECRET || 'dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());
    setupPassport();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/music', musicApiRoutes);
    app.use('/api/albums', albumRoutes);

    // Health check endpoint
    app.get('/api/health', (req: express.Request, res: express.Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Error handling middleware
    app.use(errorHandler);

    // Initialize scheduler
    initScheduler();

    // Start server
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

export default app; 