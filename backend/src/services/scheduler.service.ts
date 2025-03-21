import { db } from '../db';
import { posts } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { sendDiscordMessage } from './discord';
import { logger } from '../utils/logger';

interface DiscordEmbed {
  title: string;
  description: string;
  fields: {
    name: string;
    value: string;
    inline: boolean;
  }[];
  thumbnail?: {
    url: string;
  };
  color: number;
  timestamp: string;
  footer: {
    text: string;
  };
}

export class SchedulerService {
  constructor() {}

  private formatEmbed(post: any): DiscordEmbed {
    const fields = [];

    if (post.artist && post.title) {
      fields.push({
        name: 'Album',
        value: `${post.artist} - ${post.title}`,
        inline: true,
      });
    }

    if (post.releaseDate) {
      fields.push({
        name: 'Release Date',
        value: post.releaseDate,
        inline: true,
      });
    }

    if (post.spotifyUrl) {
      fields.push({
        name: 'Spotify',
        value: post.spotifyUrl,
        inline: true,
      });
    }

    if (post.trackList) {
      fields.push({
        name: 'Track List',
        value: post.trackList,
        inline: false,
      });
    }

    const embed: DiscordEmbed = {
      title: 'New Album Release',
      description: post.description || '',
      fields,
      thumbnail: post.imageUrl ? { url: post.imageUrl } : undefined,
      color: 0x1DB954, // Spotify green
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Kingdom Leaks Bot',
      },
    };

    return embed;
  }

  /**
   * Checks for and processes any posts that are due to be published
   */
  async processScheduledPosts(): Promise<void> {
    try {
      const now = new Date();
      const scheduledPosts = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.status, 'scheduled'),
            lt(posts.scheduledFor, now)
          )
        );

      logger.info(`Found ${scheduledPosts.length} posts to process`);

      for (const post of scheduledPosts) {
        try {
          if (!post.discordChannelId) {
            logger.error(`Post ${post.id} has no Discord channel ID`);
            continue;
          }

          const embed = this.formatEmbed(post);
          const messageId = await sendDiscordMessage(post.discordChannelId, { embeds: [embed] });

          await db
            .update(posts)
            .set({
              status: 'posted',
              discordMessageId: messageId,
              postedAt: now,
            })
            .where(eq(posts.id, post.id));

          logger.info(`Successfully posted ${post.id} to Discord`);
        } catch (error) {
          logger.error(`Failed to process post ${post.id}:`, error);

          await db
            .update(posts)
            .set({
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(posts.id, post.id));
        }
      }
    } catch (error) {
      logger.error('Failed to process scheduled posts:', error);
      throw error;
    }
  }
} 