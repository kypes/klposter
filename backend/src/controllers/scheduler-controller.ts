import { Request, Response } from 'express';
import { db } from '../db';
import { posts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { initScheduler } from '../services/scheduler-service';

/**
 * Schedule a post for publication
 */
export const schedulePostPublication = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { publishAt } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate publishAt date
    if (!publishAt) {
      return res.status(400).json({ error: 'Publish date is required' });
    }
    
    const publishDate = new Date(publishAt);
    if (isNaN(publishDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please provide a valid date.' });
    }
    
    if (publishDate <= new Date()) {
      return res.status(400).json({ error: 'Publish date must be a future date' });
    }

    // Get the post to verify ownership
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, postId))
      .execute();

    if (!post.length) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post[0].userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to schedule this post' });
    }

    // Schedule the post
    await db.update(posts)
      .set({
        status: 'SCHEDULED',
        scheduledFor: publishDate
      })
      .where(eq(posts.id, postId))
      .execute();

    return res.status(200).json({
      id: postId,
      message: 'Post scheduled successfully',
      publishAt: publishDate
    });
  } catch (error) {
    logger.error('Error scheduling post:', error);
    return res.status(500).json({ error: 'Error scheduling post for publication' });
  }
};

/**
 * Cancel a scheduled post publication
 */
export const cancelScheduledPublication = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the post with schedule info
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, postId))
      .execute();

    if (!post.length) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post[0].userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to cancel this scheduled post' });
    }

    // Check if post is scheduled
    if (post[0].status !== 'SCHEDULED' || !post[0].scheduledFor) {
      return res.status(400).json({ error: 'This post is not scheduled for publication' });
    }

    // Cancel the scheduled post
    await db.update(posts)
      .set({
        status: 'DRAFT',
        scheduledFor: null
      })
      .where(eq(posts.id, postId))
      .execute();

    return res.status(200).json({
      message: 'Scheduled publication successfully canceled'
    });
  } catch (error) {
    logger.error('Error canceling scheduled post:', error);
    return res.status(500).json({ error: 'Error canceling scheduled post' });
  }
};

/**
 * List all scheduled posts for the current user
 */
export const listScheduledPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all scheduled posts for the user
    const scheduledPosts = await db.select()
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          eq(posts.status, 'SCHEDULED')
        )
      )
      .execute();

    return res.status(200).json(scheduledPosts);
  } catch (error) {
    logger.error('Error listing scheduled posts:', error);
    return res.status(500).json({ error: 'Error listing scheduled posts' });
  }
}; 