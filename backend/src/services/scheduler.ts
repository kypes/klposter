import cron from 'node-cron';
import { db } from '../db';
import { posts } from '../db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { PostStatus } from '../types/post';
import { logger } from '../utils/logger';
import { sendDiscordMessage } from './discord';

/**
 * Check for and process scheduled posts
 */
async function processScheduledPosts() {
  try {
    // Get all scheduled posts that are due
    const now = new Date();
    const scheduledPosts = await db.select()
      .from(posts)
      .where(
        and(
          eq(posts.status, 'SCHEDULED'),
          lte(posts.scheduledFor!, now)
        )
      )
      .all();

    logger.info(`Found ${scheduledPosts.length} posts to process`);

    // Process each post
    for (const post of scheduledPosts) {
      try {
        // Parse trackList from JSON
        const trackList = post.trackList ? JSON.parse(post.trackList) : null;

        // Create Discord embed
        const embed = {
          title: post.title,
          description: post.description || '',
          fields: [
            { name: 'Artist', value: post.artist, inline: true },
            { name: 'Album', value: post.album, inline: true },
            { name: 'Release Date', value: post.releaseDate || 'N/A', inline: true },
          ],
          thumbnail: post.imageUrl ? { url: post.imageUrl } : undefined,
          color: 0x00ff00, // Green color
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Posted by Kingdom Leaks Bot',
          },
        };

        // Add track list if available
        if (trackList && Array.isArray(trackList)) {
          const trackListText = trackList
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(track => `${track.position || '-'}. ${track.name} ${track.duration ? `(${track.duration})` : ''}`)
            .join('\n');

          if (trackListText) {
            embed.fields.push({ name: 'Track List', value: trackListText, inline: false });
          }
        }

        // Add links if available
        const links = [];
        if (post.spotifyUrl) links.push(`[Spotify](${post.spotifyUrl})`);
        if (post.lastfmUrl) links.push(`[Last.fm](${post.lastfmUrl})`);
        if (links.length > 0) {
          embed.fields.push({ name: 'Links', value: links.join(' | '), inline: false });
        }

        // Send to Discord
        const messageId = await sendDiscordMessage(post.discordChannelId!, { embeds: [embed] });

        // Update post status
        await db.update(posts)
          .set({
            status: 'PUBLISHED' as PostStatus,
            publishedAt: now,
            discordMessageId: messageId,
            updatedAt: now,
          })
          .where(eq(posts.id, post.id));

        logger.info(`Successfully published post ${post.id} to Discord`);
      } catch (error) {
        logger.error(`Failed to process post ${post.id}:`, error);

        // Mark post as failed
        await db.update(posts)
          .set({
            status: 'FAILED' as PostStatus,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, post.id));
      }
    }
  } catch (error) {
    logger.error('Error processing scheduled posts:', error);
  }
}

/**
 * Initialize the scheduler
 */
export function initScheduler() {
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    logger.info('Scheduler is disabled');
    return;
  }

  // Run every minute
  const task = cron.schedule('* * * * *', async () => {
    logger.debug('Running scheduled post check');
    await processScheduledPosts();
  });

  task.start();
  logger.info('Post scheduler initialized');

  return task;
} 