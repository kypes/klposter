import { Request, Response } from 'express';
import { DiscordService } from '../services/discord-service';
import { db } from '../db';
import { userSettings } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Create instance of DiscordService
const discordService = new DiscordService();

/**
 * Configure a Discord webhook URL for the current user
 */
export const configureDiscordWebhook = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Simple validation for Discord webhook URL format
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ error: 'Invalid Discord webhook URL' });
    }

    // Store the webhook URL in user settings
    const result = await db.insert(userSettings)
      .values({
        userId,
        settingKey: 'discord_webhook',
        settingValue: webhookUrl
      })
      .onConflictDoUpdate({
        target: [userSettings.userId, userSettings.settingKey],
        set: {
          settingValue: webhookUrl
        }
      })
      .returning()
      .execute();

    return res.status(200).json({
      message: 'Discord webhook successfully configured',
      setting: result[0]
    });
  } catch (error) {
    logger.error('Error configuring Discord webhook:', error);
    return res.status(500).json({ error: 'Error configuring Discord webhook' });
  }
};

/**
 * Test the configured Discord webhook
 */
export const testDiscordWebhook = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get the user's webhook URL
    const settings = await db.select()
      .from(userSettings)
      .where(
        and(
          eq(userSettings.userId, userId),
          eq(userSettings.settingKey, 'discord_webhook')
        )
      )
      .execute();

    if (!settings.length) {
      return res.status(404).json({ error: 'No Discord webhook configured' });
    }

    const webhookUrl = settings[0].settingValue;

    // Test the webhook
    const result = await discordService.testWebhook(webhookUrl);

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error testing Discord webhook:', error);
    return res.status(500).json({ error: 'Error testing Discord webhook' });
  }
};

/**
 * Remove a Discord webhook configuration
 */
export const removeDiscordWebhook = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Check if webhook exists
    const settings = await db.select()
      .from(userSettings)
      .where(
        and(
          eq(userSettings.userId, userId),
          eq(userSettings.settingKey, 'discord_webhook')
        )
      )
      .execute();

    if (!settings.length) {
      return res.status(404).json({ error: 'No Discord webhook configured' });
    }

    // Delete the webhook setting
    await db.delete(userSettings)
      .where(
        and(
          eq(userSettings.userId, userId),
          eq(userSettings.settingKey, 'discord_webhook')
        )
      )
      .execute();

    return res.status(200).json({
      message: 'Discord webhook successfully removed'
    });
  } catch (error) {
    logger.error('Error removing Discord webhook:', error);
    return res.status(500).json({ error: 'Error removing Discord webhook' });
  }
}; 