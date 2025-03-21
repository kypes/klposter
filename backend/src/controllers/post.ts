import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { db } from '../db';
import { posts } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CreatePostDto, UpdatePostDto, PostStatus } from '../types/post';
import { logger } from '../utils/logger';

/**
 * Create a new post
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postData: CreatePostDto = req.body;
    const userId = req.user!.id;

    const post = {
      id: crypto.randomUUID(),
      userId,
      ...postData,
      trackList: postData.trackList ? JSON.stringify(postData.trackList) : null,
      status: 'DRAFT' as PostStatus,
      scheduledFor: postData.scheduledFor ? new Date(postData.scheduledFor) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(posts).values(post);
    
    // Return created post with parsed trackList
    const createdPost = await db.select().from(posts).where(eq(posts.id, post.id)).get();
    return res.status(201).json({
      ...createdPost,
      trackList: createdPost.trackList ? JSON.parse(createdPost.trackList) : null,
    });
  } catch (error) {
    logger.error('Error creating post:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Get a post by ID
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const post = await db.select().from(posts).where(eq(posts.id, id)).get();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user has access to this post
    if (post.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden - You do not have access to this post' });
    }

    return res.json({
      ...post,
      trackList: post.trackList ? JSON.parse(post.trackList) : null,
    });
  } catch (error) {
    logger.error('Error getting post:', error);
    return res.status(500).json({ error: 'Failed to get post' });
  }
};

/**
 * Update a post
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData: UpdatePostDto = req.body;
    const userId = req.user!.id;

    // Check if post exists and belongs to user
    const existingPost = await db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (existingPost.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden - You do not have access to this post' });
    }

    // Prepare update data
    const updateValues = {
      ...updateData,
      trackList: updateData.trackList ? JSON.stringify(updateData.trackList) : undefined,
      scheduledFor: updateData.scheduledFor ? new Date(updateData.scheduledFor) : undefined,
      updatedAt: new Date(),
    };

    await db.update(posts)
      .set(updateValues)
      .where(eq(posts.id, id));

    // Return updated post
    const updatedPost = await db.select().from(posts).where(eq(posts.id, id)).get();
    return res.json({
      ...updatedPost,
      trackList: updatedPost.trackList ? JSON.parse(updatedPost.trackList) : null,
    });
  } catch (error) {
    logger.error('Error updating post:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
};

/**
 * Delete a post
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user!.id;

    // Check if post exists and belongs to user
    const existingPost = await db.select().from(posts).where(eq(posts.id, id)).get();
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (existingPost.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden - You do not have access to this post' });
    }

    await db.delete(posts).where(eq(posts.id, id));
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting post:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};

/**
 * List posts with pagination and filtering
 */
export const listPosts = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user!.id;
    const status = req.query.status as PostStatus | undefined;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(posts.userId, userId)];
    if (status) {
      conditions.push(eq(posts.status, status));
    }

    // Get total count for pagination
    const totalCount = await db.select({ count: posts.id })
      .from(posts)
      .where(and(...conditions))
      .get();

    // Get paginated posts
    const postsList = await db.select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Parse trackList for each post
    const formattedPosts = postsList.map((post: typeof posts.$inferSelect) => ({
      ...post,
      trackList: post.trackList ? JSON.parse(post.trackList) : null,
    }));

    return res.json({
      posts: formattedPosts,
      pagination: {
        total: totalCount?.count || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount?.count || 0) / limit),
      },
    });
  } catch (error) {
    logger.error('Error listing posts:', error);
    return res.status(500).json({ error: 'Failed to list posts' });
  }
}; 