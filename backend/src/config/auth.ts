import { Strategy as DiscordStrategy } from 'passport-discord';
import passport from 'passport';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Define the user type for TypeScript
declare global {
  namespace Express {
    interface User {
      id: string;
      discordId: string;
      username: string;
      avatar?: string;
      accessToken: string;
      refreshToken?: string;
      guilds?: string;
    }
  }
}

export const initializePassport = () => {
  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).get();
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Discord Strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: process.env.DISCORD_CALLBACK_URL!,
        scope: ['identify', 'guilds'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await db.select().from(users).where(eq(users.discordId, profile.id)).get();

          if (!user) {
            // Create new user
            const newUser = {
              id: crypto.randomUUID(),
              discordId: profile.id,
              username: profile.username,
              avatar: profile.avatar,
              accessToken,
              refreshToken,
              guilds: JSON.stringify(profile.guilds),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await db.insert(users).values(newUser);
            user = newUser;
          } else {
            // Update existing user
            const updatedUser = {
              username: profile.username,
              avatar: profile.avatar,
              accessToken,
              refreshToken,
              guilds: JSON.stringify(profile.guilds),
              updatedAt: new Date(),
            };

            await db.update(users)
              .set(updatedUser)
              .where(eq(users.discordId, profile.id));

            user = { ...user, ...updatedUser };
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}; 