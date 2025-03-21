import * as schedulerService from '../../services/scheduler-service';
import { db } from '../../db';
import { sendDiscordPost } from '../../services/discord-service';
import { logger } from '../../utils/logger';
import cron from 'node-cron';
import { mockLogger } from '../utils/test-mocks';

// Mock dependencies
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    all: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    get: jest.fn()
  }
}));
jest.mock('../../services/discord-service', () => ({
  sendDiscordPost: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-message-id',
    channelId: 'mock-channel-id'
  })
}));

// Mock logger - this has to come after imports to avoid circular dependencies
jest.mock('../../utils/logger', () => ({
  logger: mockLogger
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn((expression, callback) => {
    // Store the callback for testing
    (global as any).cronCallback = callback;
    return {
      start: jest.fn(),
      stop: jest.fn()
    };
  })
}));

describe('Scheduler Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.MOCK_DB = 'false';
  });
  
  describe('initScheduler', () => {
    it('should initialize cron job if not in mock mode', () => {
      // Act
      schedulerService.initScheduler();
      
      // Assert
      expect(cron.schedule).toHaveBeenCalledWith(
        '* * * * *',
        expect.any(Function)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Initializing post scheduler');
    });
    
    it('should not initialize cron job in mock mode', () => {
      // Arrange
      process.env.MOCK_DB = 'true';
      
      // Act
      schedulerService.initScheduler();
      
      // Assert
      expect(cron.schedule).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Scheduler not initialized in mock mode');
    });
  });
  
  describe('processScheduledPosts', () => {
    it('should process scheduled posts and update their status', async () => {
      // Arrange
      const mockScheduledPosts = [
        { id: 1, title: 'Test Post 1', status: 'SCHEDULED' },
        { id: 2, title: 'Test Post 2', status: 'SCHEDULED' }
      ];
      
      // Mock database queries
      (db.all as jest.Mock).mockResolvedValue(mockScheduledPosts);
      
      // Act
      await schedulerService.processScheduledPosts();
      
      // Assert
      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(sendDiscordPost).toHaveBeenCalledTimes(2);
      expect(db.update).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Found 2 posts to publish'));
    });
    
    it('should skip processing in mock mode', async () => {
      // Arrange
      process.env.MOCK_DB = 'true';
      
      // Act
      await schedulerService.processScheduledPosts();
      
      // Assert
      expect(db.select).not.toHaveBeenCalled();
      expect(sendDiscordPost).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Skipping scheduled posts'));
    });
    
    it('should handle errors when processing posts', async () => {
      // Arrange
      const mockError = new Error('Database error');
      (db.select as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      
      // Act
      await schedulerService.processScheduledPosts();
      
      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in processScheduledPosts:',
        mockError
      );
    });
    
    it('should handle errors when sending to Discord', async () => {
      // Arrange
      const mockScheduledPosts = [
        { id: 1, title: 'Test Post 1', status: 'SCHEDULED' }
      ];
      
      // Mock database queries
      (db.all as jest.Mock).mockResolvedValue(mockScheduledPosts);
      
      // Mock Discord error
      const mockError = new Error('Discord error');
      (sendDiscordPost as jest.Mock).mockRejectedValue(mockError);
      
      // Act
      await schedulerService.processScheduledPosts();
      
      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to publish post'),
        mockError
      );
      expect(db.update).toHaveBeenCalledWith(expect.any(Object));
      expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'FAILED'
      }));
    });
  });
  
  describe('cron job', () => {
    it('should call processScheduledPosts when cron job fires', async () => {
      // Arrange
      const processSpy = jest.spyOn(schedulerService, 'processScheduledPosts');
      schedulerService.initScheduler();
      
      // Act - simulate cron job firing
      await (global as any).cronCallback();
      
      // Assert
      expect(processSpy).toHaveBeenCalled();
    });
    
    it('should handle errors in the cron job', async () => {
      // Arrange
      const mockError = new Error('Process error');
      jest.spyOn(schedulerService, 'processScheduledPosts').mockRejectedValue(mockError);
      schedulerService.initScheduler();
      
      // Act - simulate cron job firing
      await (global as any).cronCallback();
      
      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error in scheduler:',
        mockError
      );
    });
  });
}); 