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
    const messageId = response.data.id;
    
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