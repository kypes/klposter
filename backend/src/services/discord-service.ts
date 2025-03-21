import axios from 'axios';
import { logger } from '../utils/logger';
import { db } from '../db';
import { channels } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Interface for Discord embed
 */
interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  image?: { url: string };
  thumbnail?: { url: string };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

/**
 * Interface for Discord webhook payload
 */
interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
}

/**
 * Interface for post result
 */
interface PostResult {
  success: boolean;
  messageId: string;
  channelId: string;
}

/**
 * Interface for Discord message
 */
interface DiscordMessage {
  id: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Interface for Discord message payload
 */
interface DiscordMessagePayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Send a post to Discord via webhook
 */
export const sendDiscordPost = async (post: any): Promise<PostResult> => {
  try {
    // Get channel information
    const channel = await db
      .select()
      .from(channels)
      .where(eq(channels.id, post.discordChannelId || process.env.DEFAULT_CHANNEL_ID))
      .get();
    
    if (!channel || !channel.webhookUrl) {
      throw new Error('Channel not found or webhook URL not configured');
    }
    
    // Parse track list if available
    const trackList = post.trackList ? JSON.parse(post.trackList) : [];
    
    // Create embed
    const embed: DiscordEmbed = {
      title: post.title,
      description: post.description || '',
      color: 0x1DB954, // Spotify green
      timestamp: new Date().toISOString(),
      url: post.spotifyUrl || post.lastfmUrl,
      image: post.imageUrl ? { url: post.imageUrl } : undefined,
      author: {
        name: post.artist,
      },
      fields: [
        {
          name: 'Album',
          value: post.album,
          inline: true
        },
        {
          name: 'Release Date',
          value: post.releaseDate || 'Unknown',
          inline: true
        }
      ],
      footer: {
        text: 'Posted via KLPoster'
      }
    };
    
    // Add track list if available
    if (trackList.length > 0) {
      embed.fields?.push({
        name: 'Track List',
        value: trackList.map((track: any, index: number) => 
          `${index + 1}. ${track.name} (${track.duration || '?'})`
        ).join('\n').substring(0, 1024) // Discord field value limit
      });
    }
    
    // Add links if available
    const links = [];
    if (post.spotifyUrl) links.push(`[Spotify](${post.spotifyUrl})`);
    if (post.lastfmUrl) links.push(`[Last.fm](${post.lastfmUrl})`);
    
    if (links.length > 0) {
      embed.fields?.push({
        name: 'Links',
        value: links.join(' | ')
      });
    }
    
    // Create webhook payload
    const payload: DiscordWebhookPayload = {
      username: 'Music Release Bot',
      embeds: [embed]
    };
    
    // Send to Discord
    const response = await axios.post(channel.webhookUrl, payload);
    
    // Extract message ID from response
    const messageId = (response.data as DiscordMessage).id;
    
    return {
      success: true,
      messageId,
      channelId: channel.id
    };
  } catch (error) {
    logger.error('Error sending post to Discord:', error);
    throw new Error('Failed to send post to Discord');
  }
};

export class DiscordService {
  private readonly token: string;

  constructor(token: string = process.env.DISCORD_BOT_TOKEN || '') {
    this.token = token;
  }

  /**
   * Test a Discord webhook by sending a test message
   * @param webhookUrl The Discord webhook URL to test
   * @returns Object indicating success or failure
   */
  async testWebhook(webhookUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!webhookUrl) {
        throw new Error('Webhook URL is required');
      }

      const testEmbed: DiscordEmbed = {
        title: 'Webhook Test',
        description: 'This is a test message from KLPoster',
        color: 0x5865F2, // Discord blue
        timestamp: new Date().toISOString(),
        footer: {
          text: 'KLPoster Webhook Test'
        }
      };

      const payload: DiscordWebhookPayload = {
        username: 'KLPoster Test',
        embeds: [testEmbed]
      };

      // Send test message to webhook
      await axios.post(webhookUrl, payload);

      return {
        success: true,
        message: 'Webhook test successful! Check your Discord channel for the test message.'
      };
    } catch (error) {
      logger.error('Webhook test failed:', error);
      return {
        success: false,
        message: 'Webhook test failed. Please check the URL and try again.'
      };
    }
  }

  async sendMessage(channelId: string, payload: DiscordMessagePayload): Promise<string> {
    try {
      const response = await axios.post<DiscordMessage>(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bot ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return (response.data as DiscordMessage).id;
    } catch (error) {
      logger.error('Failed to send Discord message:', error);
      throw error;
    }
  }

  async editMessage(
    channelId: string,
    messageId: string,
    payload: DiscordMessagePayload
  ): Promise<void> {
    try {
      await axios.patch<DiscordMessage>(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        payload,
        {
          headers: {
            Authorization: `Bot ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      logger.error('Failed to edit Discord message:', error);
      throw error;
    }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    try {
      await axios.delete(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bot ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      logger.error('Failed to delete Discord message:', error);
      throw error;
    }
  }
} 