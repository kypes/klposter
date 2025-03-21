import express from 'express';
import albumRoutes from '../routes/album.routes';

declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      discordId: string;
      username: string;
      discriminator: string;
      avatar: string;
      accessToken: string;
      refreshToken: string;
    };
  }
}

const app = express();

// Middleware
app.use(express.json());

// Mock authentication middleware for testing
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // @ts-ignore - Mocking session for tests
  req.session = {
    user: {
      id: 'test-user-id',
      discordId: 'test-discord-id',
      username: 'testuser',
      discriminator: '1234',
      avatar: 'test-avatar',
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token'
    }
  };
  next();
});

// Routes
app.use('/api/albums', albumRoutes);

export default app; 