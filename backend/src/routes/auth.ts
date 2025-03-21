import express from 'express';
import passport from 'passport';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/auth/discord
 * @desc    Initiate Discord OAuth flow
 * @access  Public
 */
router.get('/discord', passport.authenticate('discord'));

/**
 * @route   GET /api/auth/discord/callback
 * @desc    Discord OAuth callback
 * @access  Public
 */
router.get(
  '/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/login',
    successRedirect: '/dashboard',
  })
);

/**
 * @route   GET /api/auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.json({ message: 'Successfully logged out' });
  });
});

export default router; 