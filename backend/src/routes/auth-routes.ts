import express from 'express';
import passport from 'passport';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/error-handler';
import { isAuthenticated } from '../middleware/auth-middleware';

const router = express.Router();

/**
 * @route   GET /api/auth/discord
 * @desc    Initiate Discord OAuth flow
 * @access  Public
 */
router.get('/discord', passport.authenticate('discord', {
  scope: ['identify', 'guilds']
}));

/**
 * @route   GET /api/auth/discord/callback
 * @desc    Handle Discord OAuth callback
 * @access  Public
 */
router.get('/discord/callback', 
  passport.authenticate('discord', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:4321'}/login?error=auth_failed` 
  }),
  (req, res) => {
    logger.info(`User authenticated: ${req.user?.username || 'Unknown'}`);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:4321'}/dashboard`);
  }
);

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', isAuthenticated, (req, res) => {
  const username = req.user?.username || 'Unknown';
  
  req.logout((err) => {
    if (err) {
      logger.error(`Logout error for user ${username}:`, err);
      throw new ApiError(500, 'Error during logout');
    }
    
    logger.info(`User logged out: ${username}`);
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user', isAuthenticated, (req, res) => {
  // Return user info without sensitive data
  const user = req.user;
  
  if (!user) {
    throw new ApiError(401, 'User not authenticated');
  }
  
  // Remove sensitive information
  const safeUser = {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    discordId: user.discordId,
    guilds: user.guilds ? JSON.parse(user.guilds) : [],
  };
  
  res.status(200).json(safeUser);
});

export const authRoutes = router; 