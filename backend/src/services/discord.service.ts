import axios from 'axios';
import { logger } from '../utils/logger';
import type { Post } from '../types/post';
import type { DiscordEmbed, DiscordWebhookPayload } from '../types/discord';
import { formatAlbumDetails } from '../utils/formatters';

interface DiscordMessage {
  id: string;
  content: string;
  channel_id: string;
}

interface DiscordMessagePayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

export class DiscordService {
  private readonly token: string;
  private readonly baseUrl = 'https://discord.com/api/v10';

  constructor(token: string = process.env.DISCORD_BOT_TOKEN || '') {
    this.token = token;
  }

  private get headers() {
    return {
      'Authorization': `Bot ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Creates a Discord embed from a post
   */
  private createEmbed(post: Post): DiscordEmbed {
    const { albumInfo, description } = post;
    const { title, artist, coverUrl, releaseDate, tracks } = albumInfo;

    return {
      title: `${artist} - ${title}`,
      description: description || '',
      color: 0x7C3AED, // Brand color
      thumbnail: {
        url: coverUrl,
      },
      fields: [
        {
          name: 'Release Date',
          value: new Date(releaseDate).toLocaleDateString(),
          inline: true,
        },
        {
          name: 'Track Count',
          value: tracks.length.toString(),
          inline: true,
        },
        {
          name: 'Tracklist',
          value: formatAlbumDetails(tracks),
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Posted via KLPoster',
      },
    };
  }

  /**
   * Creates the webhook payload for Discord
   */
  private createWebhookPayload(post: Post): DiscordWebhookPayload {
    return {
      username: 'KLPoster',
      avatar_url: process.env.BOT_AVATAR_URL,
      embeds: [this.createEmbed(post)],
    };
  }

  /**
   * Sends a post to Discord via webhook
   */
  async sendPost(post: Post): Promise<boolean> {
    try {
      const payload = this.createWebhookPayload(post);
      logger.info(`Sending post to Discord: ${post.id}`);

      const response = await axios.post(this.baseUrl, payload, {
        headers: this.headers
      });

      if (response.status === 204) {
        logger.info(`Successfully sent post ${post.id} to Discord`);
        return true;
      }

      logger.warn(`Unexpected response status: ${response.status} for post ${post.id}`);
      return false;
    } catch (error) {
      logger.error('Error sending post to Discord:', {
        postId: post.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async sendMessage(channelId: string, content: string | DiscordMessagePayload): Promise<string> {
    try {
      const payload = typeof content === 'string' ? { content } : content;
      const response = await axios.post<DiscordMessage>(
        `${this.baseUrl}/channels/${channelId}/messages`,
        payload,
        { headers: this.headers }
      );

      return response.data.id;
    } catch (error) {
      logger.error('Failed to send Discord message:', error);
      throw error;
    }
  }

  async editMessage(channelId: string, messageId: string, content: string | DiscordMessagePayload): Promise<void> {
    try {
      const payload = typeof content === 'string' ? { content } : content;
      await axios.patch(
        `${this.baseUrl}/channels/${channelId}/messages/${messageId}`,
        payload,
        { headers: this.headers }
      );
    } catch (error) {
      logger.error('Failed to edit Discord message:', error);
      throw error;
    }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/channels/${channelId}/messages/${messageId}`,
        { headers: this.headers }
      );
    } catch (error) {
      logger.error('Failed to delete Discord message:', error);
      throw error;
    }
  }
} 