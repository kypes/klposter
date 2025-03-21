import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to check if the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    logger.warn('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
} 