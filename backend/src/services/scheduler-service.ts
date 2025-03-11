import cron from "node-cron";
import { db } from "../db";
import { posts } from "../db/schema";
import { eq, lte, and } from "drizzle-orm";
import { logger } from "../utils/logger";
import { sendDiscordPost } from "./discord-service";

/**
 * Initialize the scheduler
 * Runs every minute to check for posts that need to be published
 */
export const initScheduler = () => {
  // Only run scheduler if not in mock mode
  if (process.env.MOCK_DB === "true") {
    logger.info("Scheduler not initialized in mock mode");
    return;
  }

  logger.info("Initializing post scheduler");

  // Schedule job to run every minute
  cron.schedule("* * * * *", async () => {
    try {
      await processScheduledPosts();
    } catch (error) {
      logger.error("Error in scheduler:", error);
    }
  });
};

/**
 * Process scheduled posts
 * Finds posts that are scheduled to be published and sends them to Discord
 */
export const processScheduledPosts = async () => {
  try {
    // Skip processing in mock mode
    if (process.env.MOCK_DB === "true") {
      logger.debug("Skipping scheduled posts processing in mock mode");
      return;
    }

    const now = new Date();

    // Find posts that are scheduled and due to be published
    const scheduledPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.status, "SCHEDULED"), lte(posts.scheduledFor, now)));

    if (scheduledPosts.length === 0) {
      return;
    }

    logger.info(`Found ${scheduledPosts.length} posts to publish`);

    // Process each post
    for (const post of scheduledPosts) {
      try {
        // Send post to Discord
        const result = await sendDiscordPost(post);

        // Update post status
        await db
          .update(posts)
          .set({
            status: "PUBLISHED",
            publishedAt: now,
            discordMessageId: result.messageId,
            discordChannelId: result.channelId,
            updatedAt: now,
          })
          .where(eq(posts.id, post.id));

        logger.info(`Published post ${post.id} to Discord`);
      } catch (error) {
        logger.error(`Failed to publish post ${post.id}:`, error);

        // Mark post as failed
        await db
          .update(posts)
          .set({
            status: "FAILED",
            updatedAt: now,
          })
          .where(eq(posts.id, post.id));
      }
    }
  } catch (error) {
    logger.error("Error in processScheduledPosts:", error);
  }
};
