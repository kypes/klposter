import { configureDiscordWebhook, testDiscordWebhook, removeDiscordWebhook } from '../../controllers/discord-controller';
import { createMockRequest, createMockResponse, mockUser } from '../utils/test-mocks';
import { logger } from '../../utils/logger';
import { db } from '../../db';
import { userSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';
import * as discordController from '../../controllers/discord-controller';
import { DiscordService } from '../../services/discord-service';
import { mockLogger } from '../utils/test-mocks';

// Mock the actual modules before importing
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock DiscordService
jest.mock('../../services/discord-service', () => {
  // Create a mock implementation that can be accessed and verified in tests
  const mockTestWebhook = jest.fn().mockResolvedValue({ 
    success: true, 
    message: 'Test successful'
  });
  
  return { 
    DiscordService: jest.fn().mockImplementation(() => ({
      testWebhook: mockTestWebhook
    }))
  };
});

// Mock database
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis()
  }
}));

describe('Discord Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = createMockRequest(
      {}, // params
      {}, // query
      { // body
        webhookUrl: 'https://discord.com/api/webhooks/123/abc',
        name: 'Test Channel'
      }
    );
    
    mockRequest.user = { id: 'test-user-id' };
    mockResponse = createMockResponse();
  });
  
  describe('configureDiscordWebhook', () => {
    it('should configure a Discord webhook URL', async () => {
      // Arrange
      mockRequest.body = { webhookUrl: 'https://discord.com/api/webhooks/123456789/token' };
      
      // Act
      await configureDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(db.insert).toHaveBeenCalledWith(userSettings);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('successfully configured')
      }));
    });
    
    it('should return 400 if webhookUrl is missing', async () => {
      // Arrange
      mockRequest.body = {};
      
      // Act
      await configureDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Webhook URL is required')
      }));
    });
    
    it('should return 400 if webhookUrl is invalid', async () => {
      // Arrange
      mockRequest.body = { webhookUrl: 'invalid-url' };
      
      // Act
      await configureDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid Discord webhook URL')
      }));
    });
    
    it('should handle database errors', async () => {
      // Arrange
      mockRequest.body = { webhookUrl: 'https://discord.com/api/webhooks/123456789/token' };
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      // Act
      await configureDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error configuring Discord webhook')
      }));
    });
  });
  
  describe('testWebhook', () => {
    it('should test a webhook successfully', async () => {
      // Act
      await discordController.testWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
      // Verify the service was called with the correct parameters
      const discordServiceInstance = new DiscordService();
      expect(discordServiceInstance.testWebhook).toHaveBeenCalledWith(
        mockRequest.body.webhookUrl
      );
    });
    
    it('should handle missing webhook URL', async () => {
      // Arrange
      mockRequest.body.webhookUrl = undefined;
      
      // Act
      await discordController.testWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('required')
      }));
    });
    
    it('should handle errors during webhook testing', async () => {
      // Arrange - mock the testWebhook method to throw an error
      const discordServiceInstance = new DiscordService();
      (discordServiceInstance.testWebhook as jest.Mock).mockRejectedValueOnce(
        new Error('Test error')
      );
      
      // Act
      await discordController.testWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('webhook')
      }));
    });
  });
  
  describe('removeDiscordWebhook', () => {
    it('should remove a Discord webhook successfully', async () => {
      // Arrange
      // Mock to check if webhook exists
      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue([
          { userId: mockUser.id, settingKey: 'discord_webhook', settingValue: 'https://discord.com/api/webhooks/123456789/token' }
        ])
      });
      
      // Act
      await removeDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(db.delete).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('successfully removed')
      }));
    });
    
    it('should return 404 if no webhook is configured', async () => {
      // Arrange
      // Mock to return no webhook URLs
      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue([])
      });
      
      // Act
      await removeDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('No Discord webhook configured')
      }));
    });
    
    it('should handle database errors when removing', async () => {
      // Arrange
      // Mock to check if webhook exists
      (db.select as jest.Mock).mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue([
          { userId: mockUser.id, settingKey: 'discord_webhook', settingValue: 'https://discord.com/api/webhooks/123456789/token' }
        ])
      });
      
      // Mock delete operation to fail
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      // Act
      await removeDiscordWebhook(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error removing Discord webhook')
      }));
    });
  });
}); 