import { body, param, query } from 'express-validator';
import { PostStatus } from '../types/post';

export const createPostValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('artist').trim().notEmpty().withMessage('Artist is required'),
  body('album').trim().notEmpty().withMessage('Album is required'),
  body('releaseDate').optional().isISO8601().withMessage('Release date must be a valid date'),
  body('spotifyUrl').optional().isURL().withMessage('Invalid Spotify URL'),
  body('lastfmUrl').optional().isURL().withMessage('Invalid Last.fm URL'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('description').optional().trim(),
  body('trackList').optional().isArray().withMessage('Track list must be an array'),
  body('trackList.*.name').optional().trim().notEmpty().withMessage('Track name is required'),
  body('trackList.*.duration').optional().matches(/^\d{2}:\d{2}$/).withMessage('Duration must be in MM:SS format'),
  body('trackList.*.position').optional().isInt({ min: 1 }).withMessage('Position must be a positive integer'),
  body('scheduledFor').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
  body('discordChannelId').optional().trim().notEmpty().withMessage('Discord channel ID is required when scheduling'),
];

export const updatePostValidation = [
  param('id').trim().notEmpty().withMessage('Post ID is required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('artist').optional().trim().notEmpty().withMessage('Artist cannot be empty'),
  body('album').optional().trim().notEmpty().withMessage('Album cannot be empty'),
  body('releaseDate').optional().isISO8601().withMessage('Release date must be a valid date'),
  body('spotifyUrl').optional().isURL().withMessage('Invalid Spotify URL'),
  body('lastfmUrl').optional().isURL().withMessage('Invalid Last.fm URL'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('description').optional().trim(),
  body('trackList').optional().isArray().withMessage('Track list must be an array'),
  body('trackList.*.name').optional().trim().notEmpty().withMessage('Track name is required'),
  body('trackList.*.duration').optional().matches(/^\d{2}:\d{2}$/).withMessage('Duration must be in MM:SS format'),
  body('trackList.*.position').optional().isInt({ min: 1 }).withMessage('Position must be a positive integer'),
  body('scheduledFor').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
  body('discordChannelId').optional().trim().notEmpty().withMessage('Discord channel ID is required when scheduling'),
  body('status').optional().isIn(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as PostStatus[])
    .withMessage('Invalid status'),
];

export const getPostValidation = [
  param('id').trim().notEmpty().withMessage('Post ID is required'),
];

export const deletePostValidation = [
  param('id').trim().notEmpty().withMessage('Post ID is required'),
];

export const listPostsValidation = [
  query('status').optional().isIn(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as PostStatus[])
    .withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
]; 