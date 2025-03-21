import axios from 'axios';
import { logger } from '../utils/logger';

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

interface DiscordMessage {
  id: string;
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

interface DiscordMessagePayload {
  content?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Send a message to a Discord channel using webhooks
 */
export async function sendDiscordMessage(channelId: string, payload: DiscordMessagePayload): Promise<string> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('Discord bot token not found in environment variables');
  }

  try {
    const response = await axios.post<DiscordMessage>(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.id;
  } catch (error) {
    logger.error('Failed to send Discord message:', error);
    throw error;
  }
}

export async function editDiscordMessage(
  channelId: string,
  messageId: string,
  payload: DiscordMessagePayload
): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('Discord bot token not found in environment variables');
  }

  try {
    await axios.patch<DiscordMessage>(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      payload,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error('Failed to edit Discord message:', error);
    throw error;
  }
}

export async function deleteDiscordMessage(channelId: string, messageId: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('Discord bot token not found in environment variables');
  }

  try {
    await axios.delete(
      `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error('Failed to delete Discord message:', error);
    throw error;
  }
} 