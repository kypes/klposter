import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Setup Passport with Discord OAuth strategy
 */
export const setupPassport = () => {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).get();
      done(null, user || undefined);
    } catch (error) {
      logger.error('Error deserializing user:', error);
      done(error, undefined);
    }
  });

  // Configure Discord strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback',
        scope: ['identify', 'guilds'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists in our database
          let user = await db.select().from(users).where(eq(users.discordId, profile.id)).get();

          // If user doesn't exist, create a new one
          if (!user) {
            const newUser = {
              discordId: profile.id,
              username: profile.username,
              avatar: profile.avatar,
              accessToken,
              refreshToken,
              guilds: JSON.stringify(profile.guilds || []),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Insert new user into database
            const result = await db.insert(users).values(newUser).returning();
            user = result[0];
            
            logger.info(`New user created: ${profile.username} (${profile.id})`);
          } else {
            // Update existing user
            await db
              .update(users)
              .set({
                username: profile.username,
                avatar: profile.avatar,
                accessToken,
                refreshToken,
                guilds: JSON.stringify(profile.guilds || []),
                updatedAt: new Date(),
              })
              .where(eq(users.discordId, profile.id));
              
            logger.info(`User updated: ${profile.username} (${profile.id})`);
          }

          return done(null, user);
        } catch (error) {
          logger.error('Error in Discord authentication:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
}; 