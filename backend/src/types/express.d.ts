import 'express-session';

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