import { DiscordService, sendDiscordPost } from '../../services/discord-service';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { db } from '../../db';
import { mockLogger } from '../utils/test-mocks';

// Mock dependencies
jest.mock('axios');
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn()
  }
}));

// Mock logger - this has to come after imports to avoid circular dependencies
jest.mock('../../utils/logger', () => ({
  logger: mockLogger
}));

describe('Discord Service', () => {
  const mockToken = 'mock-token';
  let discordService: DiscordService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DISCORD_BOT_TOKEN = mockToken;
    discordService = new DiscordService();
  });
  
  describe('DiscordService class', () => {
    describe('sendMessage', () => {
      it('should send a message to Discord', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockPayload = { content: 'Test message' };
        const mockResponse = { data: { id: 'message-123' } };
        
        (axios.post as jest.Mock).mockResolvedValue(mockResponse);
        
        // Act
        const result = await discordService.sendMessage(mockChannelId, mockPayload);
        
        // Assert
        expect(result).toBe('message-123');
        expect(axios.post).toHaveBeenCalledWith(
          `https://discord.com/api/v10/channels/${mockChannelId}/messages`,
          mockPayload,
          {
            headers: {
              Authorization: `Bot ${mockToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });
      
      it('should handle errors when sending messages', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockPayload = { content: 'Test message' };
        const mockError = new Error('Discord API error');
        
        (axios.post as jest.Mock).mockRejectedValue(mockError);
        
        // Act & Assert
        await expect(discordService.sendMessage(mockChannelId, mockPayload))
          .rejects.toThrow(mockError);
          
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to send Discord message:',
          mockError
        );
      });
    });
    
    describe('editMessage', () => {
      it('should edit a Discord message', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockMessageId = 'message-123';
        const mockPayload = { content: 'Edited message' };
        
        (axios.patch as jest.Mock).mockResolvedValue({});
        
        // Act
        await discordService.editMessage(mockChannelId, mockMessageId, mockPayload);
        
        // Assert
        expect(axios.patch).toHaveBeenCalledWith(
          `https://discord.com/api/v10/channels/${mockChannelId}/messages/${mockMessageId}`,
          mockPayload,
          {
            headers: {
              Authorization: `Bot ${mockToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });
      
      it('should handle errors when editing messages', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockMessageId = 'message-123';
        const mockPayload = { content: 'Edited message' };
        const mockError = new Error('Discord API error');
        
        (axios.patch as jest.Mock).mockRejectedValue(mockError);
        
        // Act & Assert
        await expect(discordService.editMessage(mockChannelId, mockMessageId, mockPayload))
          .rejects.toThrow(mockError);
          
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to edit Discord message:',
          mockError
        );
      });
    });
    
    describe('deleteMessage', () => {
      it('should delete a Discord message', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockMessageId = 'message-123';
        
        (axios.delete as jest.Mock).mockResolvedValue({});
        
        // Act
        await discordService.deleteMessage(mockChannelId, mockMessageId);
        
        // Assert
        expect(axios.delete).toHaveBeenCalledWith(
          `https://discord.com/api/v10/channels/${mockChannelId}/messages/${mockMessageId}`,
          {
            headers: {
              Authorization: `Bot ${mockToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });
      
      it('should handle errors when deleting messages', async () => {
        // Arrange
        const mockChannelId = 'channel-123';
        const mockMessageId = 'message-123';
        const mockError = new Error('Discord API error');
        
        (axios.delete as jest.Mock).mockRejectedValue(mockError);
        
        // Act & Assert
        await expect(discordService.deleteMessage(mockChannelId, mockMessageId))
          .rejects.toThrow(mockError);
          
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to delete Discord message:',
          mockError
        );
      });
    });
    
    describe('testWebhook', () => {
      it('should test a webhook successfully', async () => {
        // Arrange
        const mockWebhookUrl = 'https://discord.com/api/webhooks/123/abc';
        
        (axios.post as jest.Mock).mockResolvedValue({});
        
        // Act
        const result = await discordService.testWebhook(mockWebhookUrl);
        
        // Assert
        expect(result).toEqual({
          success: true,
          message: expect.stringContaining('successful')
        });
        expect(axios.post).toHaveBeenCalledWith(
          mockWebhookUrl,
          expect.objectContaining({
            embeds: expect.arrayContaining([
              expect.objectContaining({
                title: 'Webhook Test'
              })
            ])
          })
        );
      });
      
      it('should handle errors when testing webhooks', async () => {
        // Arrange
        const mockWebhookUrl = 'https://discord.com/api/webhooks/123/abc';
        const mockError = new Error('Webhook error');
        
        (axios.post as jest.Mock).mockRejectedValue(mockError);
        
        // Act
        const result = await discordService.testWebhook(mockWebhookUrl);
        
        // Assert
        expect(result).toEqual({
          success: false,
          message: expect.stringContaining('failed')
        });
        expect(mockLogger.error).toHaveBeenCalledWith(
          'Webhook test failed:',
          mockError
        );
      });
    });
  });
  
  describe('sendDiscordPost function', () => {
    it('should send a post to Discord via webhook', async () => {
      // Arrange
      const mockPost = {
        id: 'post-123',
        title: 'Test Post',
        description: 'Test description',
        artist: 'Test Artist',
        album: 'Test Album',
        releaseDate: '2023-05-01',
        imageUrl: 'https://example.com/image.jpg',
        spotifyUrl: 'https://open.spotify.com/album/123',
        lastfmUrl: 'https://last.fm/music/Test+Artist/Test+Album',
        trackList: JSON.stringify([
          { name: 'Track 1', duration: '3:45' },
          { name: 'Track 2', duration: '4:30' }
        ]),
        discordChannelId: 'channel-123'
      };
      
      const mockChannel = {
        id: 'channel-123',
        name: 'test-channel',
        webhookUrl: 'https://discord.com/api/webhooks/123/abc'
      };
      
      (db.get as jest.Mock).mockResolvedValue(mockChannel);
      (axios.post as jest.Mock).mockResolvedValue({ data: { id: 'message-123' } });
      
      // Act
      const result = await sendDiscordPost(mockPost);
      
      // Assert
      expect(result).toEqual({
        success: true,
        messageId: 'message-123',
        channelId: 'channel-123'
      });
      expect(axios.post).toHaveBeenCalledWith(
        mockChannel.webhookUrl,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: mockPost.title
            })
          ])
        })
      );
    });
    
    it('should handle missing channel or webhook URL', async () => {
      // Arrange
      const mockPost = { id: 'post-123', title: 'Test Post' };
      
      // Mock no channel found
      (db.get as jest.Mock).mockResolvedValue(null);
      
      // Act & Assert
      await expect(sendDiscordPost(mockPost))
        .rejects.toThrow('Channel not found or webhook URL not configured');
    });
    
    it('should handle errors when sending to Discord', async () => {
      // Arrange
      const mockPost = { 
        id: 'post-123', 
        title: 'Test Post',
        discordChannelId: 'channel-123'
      };
      
      const mockChannel = {
        id: 'channel-123',
        name: 'test-channel',
        webhookUrl: 'https://discord.com/api/webhooks/123/abc'
      };
      
      (db.get as jest.Mock).mockResolvedValue(mockChannel);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Discord API error'));
      
      // Act & Assert
      await expect(sendDiscordPost(mockPost))
        .rejects.toThrow('Failed to send post to Discord');
        
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error sending post to Discord:',
        expect.any(Error)
      );
    });
  });
}); 