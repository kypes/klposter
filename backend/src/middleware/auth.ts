import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized - Please log in' });
};

/**
 * Middleware to check if user belongs to the required Discord guild
 */
export const isGuildMember = (guildId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.guilds) {
      return res.status(401).json({ error: 'Unauthorized - No guild data available' });
    }

    const guilds = JSON.parse(req.user.guilds);
    const isMember = guilds.some((guild: any) => guild.id === guildId);

    if (isMember) {
      return next();
    }

    res.status(403).json({ error: 'Forbidden - You must be a member of the required Discord server' });
  };
};

/**
 * Middleware to check if user has required Discord role
 */
export const hasRole = (guildId: string, roleId: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.guilds) {
      return res.status(401).json({ error: 'Unauthorized - No guild data available' });
    }

    const guilds = JSON.parse(req.user.guilds);
    const guild = guilds.find((g: any) => g.id === guildId);

    if (!guild) {
      return res.status(403).json({ error: 'Forbidden - You must be a member of the required Discord server' });
    }

    // Check if user has the required role
    const hasRequiredRole = guild.roles?.includes(roleId);
    if (hasRequiredRole) {
      return next();
    }

    res.status(403).json({ error: 'Forbidden - You do not have the required role' });
  };
}; 