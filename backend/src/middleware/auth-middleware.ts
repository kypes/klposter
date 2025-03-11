import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error-handler';

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  throw new ApiError(401, 'Authentication required');
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    throw new ApiError(401, 'Authentication required');
  }
  
  // Check if user has admin role in their guilds
  const user = req.user as any;
  const guilds = user.guilds ? JSON.parse(user.guilds) : [];
  
  // Check if user has admin permission in the target guild
  const targetGuildId = process.env.DISCORD_GUILD_ID;
  const isGuildAdmin = guilds.some((guild: any) => 
    guild.id === targetGuildId && 
    (guild.permissions & 0x8) === 0x8 // Check for ADMINISTRATOR permission
  );
  
  if (isGuildAdmin) {
    return next();
  }
  
  throw new ApiError(403, 'Admin permission required');
}; 