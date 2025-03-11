import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Users table schema
 * Stores Discord user information and authentication details
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  discordId: text('discord_id').notNull().unique(),
  username: text('username').notNull(),
  avatar: text('avatar'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  guilds: text('guilds'), // JSON string of user's Discord guilds
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * Posts table schema
 * Stores music release post data and scheduling information
 */
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  releaseDate: text('release_date'),
  spotifyUrl: text('spotify_url'),
  lastfmUrl: text('lastfm_url'),
  imageUrl: text('image_url'),
  description: text('description'),
  trackList: text('track_list'), // JSON string of tracks
  status: text('status').notNull().default('DRAFT'), // DRAFT, SCHEDULED, PUBLISHED, FAILED
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  discordMessageId: text('discord_message_id'),
  discordChannelId: text('discord_channel_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

/**
 * Channels table schema
 * Stores Discord channel information for posting
 */
export const channels = sqliteTable('channels', {
  id: text('id').primaryKey().notNull(),
  guildId: text('guild_id').notNull(),
  name: text('name').notNull(),
  webhookUrl: text('webhook_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}); 