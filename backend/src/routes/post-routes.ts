import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { isAuthenticated } from '../middleware/auth-middleware';
import { ApiError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import { db } from '../db';
import { posts } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Validate request body
 */
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, `Validation error: ${errors.array()[0].msg}`);
  }
  next();
};

/**
 * @route   GET /api/posts
 * @desc    Get all posts for the authenticated user
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(posts.createdAt);
    
    res.status(200).json(userPosts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    throw new ApiError(500, 'Failed to fetch posts');
  }
});

/**
 * @route   GET /api/posts/:id
 * @desc    Get a post by ID
 * @access  Private
 */
router.get('/:id', 
  isAuthenticated,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = (req.user as any).id;
      
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .get();
      
      if (!post) {
        throw new ApiError(404, 'Post not found');
      }
      
      // Ensure user owns the post
      if (post.userId !== userId) {
        throw new ApiError(403, 'Not authorized to access this post');
      }
      
      res.status(200).json(post);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error fetching post:', error);
      throw new ApiError(500, 'Failed to fetch post');
    }
  }
);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/',
  isAuthenticated,
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('artist').isString().notEmpty().withMessage('Artist is required'),
    body('album').isString().notEmpty().withMessage('Album is required'),
    body('releaseDate').optional().isString(),
    body('spotifyUrl').optional().isURL().withMessage('Invalid Spotify URL'),
    body('lastfmUrl').optional().isURL().withMessage('Invalid Last.fm URL'),
    body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
    body('description').optional().isString(),
    body('trackList').optional().isArray(),
    body('scheduledFor').optional().isISO8601().withMessage('Invalid date format')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const {
        title,
        artist,
        album,
        releaseDate,
        spotifyUrl,
        lastfmUrl,
        imageUrl,
        description,
        trackList,
        scheduledFor
      } = req.body;
      
      const now = new Date();
      const newPost = {
        id: uuidv4(),
        userId,
        title,
        artist,
        album,
        releaseDate,
        spotifyUrl,
        lastfmUrl,
        imageUrl,
        description,
        trackList: trackList ? JSON.stringify(trackList) : null,
        status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await db.insert(posts).values(newPost).returning();
      
      logger.info(`Post created: ${result[0].id} by user ${userId}`);
      res.status(201).json(result[0]);
    } catch (error) {
      logger.error('Error creating post:', error);
      throw new ApiError(500, 'Failed to create post');
    }
  }
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put('/:id',
  isAuthenticated,
  [
    param('id').isString().notEmpty(),
    body('title').optional().isString().notEmpty(),
    body('artist').optional().isString().notEmpty(),
    body('album').optional().isString().notEmpty(),
    body('releaseDate').optional().isString(),
    body('spotifyUrl').optional().isURL().withMessage('Invalid Spotify URL'),
    body('lastfmUrl').optional().isURL().withMessage('Invalid Last.fm URL'),
    body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
    body('description').optional().isString(),
    body('trackList').optional().isArray(),
    body('scheduledFor').optional().isISO8601().withMessage('Invalid date format')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = (req.user as any).id;
      
      // Check if post exists and belongs to user
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .get();
      
      if (!existingPost) {
        throw new ApiError(404, 'Post not found');
      }
      
      if (existingPost.userId !== userId) {
        throw new ApiError(403, 'Not authorized to update this post');
      }
      
      // Prepare update data
      const updateData: any = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Handle track list if provided
      if (updateData.trackList) {
        updateData.trackList = JSON.stringify(updateData.trackList);
      }
      
      // Handle scheduled date if provided
      if (updateData.scheduledFor) {
        updateData.scheduledFor = new Date(updateData.scheduledFor);
        updateData.status = 'SCHEDULED';
      }
      
      // Update post
      const result = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, postId))
        .returning();
      
      logger.info(`Post updated: ${postId} by user ${userId}`);
      res.status(200).json(result[0]);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error updating post:', error);
      throw new ApiError(500, 'Failed to update post');
    }
  }
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete('/:id',
  isAuthenticated,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = (req.user as any).id;
      
      // Check if post exists and belongs to user
      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .get();
      
      if (!existingPost) {
        throw new ApiError(404, 'Post not found');
      }
      
      if (existingPost.userId !== userId) {
        throw new ApiError(403, 'Not authorized to delete this post');
      }
      
      // Delete post
      await db
        .delete(posts)
        .where(eq(posts.id, postId));
      
      logger.info(`Post deleted: ${postId} by user ${userId}`);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error deleting post:', error);
      throw new ApiError(500, 'Failed to delete post');
    }
  }
);

export const postRoutes = router; 