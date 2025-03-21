import * as schedulerController from '../../controllers/scheduler-controller';
import { db } from '../../db';
import { posts } from '../../db/schema';
import { logger } from '../../utils/logger';
import { mockLogger } from '../utils/test-mocks';
import { createMockRequest, createMockResponse } from '../utils/test-mocks';

// Mock database
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    all: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis()
  }
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: mockLogger
}));

describe('Scheduler Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  
  const mockPost = {
    id: 'post-123',
    title: 'Test Post',
    content: 'Test content',
    userId: 'test-user-id',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = createMockRequest(
      { id: mockPost.id }, // params
      {}, // query
      { // body
        scheduledFor: new Date(Date.now() + 86400000).toISOString() // tomorrow
      }
    );
    
    // Add user to the request (simulating authenticated user)
    mockRequest.user = { id: 'test-user-id' };
    
    mockResponse = createMockResponse();
    
    // Setup default db mock responses
    (db.get as jest.Mock).mockResolvedValue(mockPost);
    (db.all as jest.Mock).mockResolvedValue([mockPost]);
  });
  
  describe('schedulePostPublication', () => {
    it('should schedule a post for publication', async () => {
      // Act
      await schedulerController.schedulePostPublication(mockRequest, mockResponse);
      
      // Assert
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'SCHEDULED',
        scheduledFor: expect.any(Date)
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('scheduled')
      }));
    });
    
    it('should require authentication', async () => {
      // Arrange - remove user from request
      mockRequest.user = null;
      
      // Act
      await schedulerController.schedulePostPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(db.update).not.toHaveBeenCalled();
    });
    
    it('should handle non-existent post', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValue(null);
      
      // Act
      await schedulerController.schedulePostPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('not found')
      }));
    });
    
    it('should verify post ownership', async () => {
      // Arrange - post exists but belongs to a different user
      const postFromDifferentUser = { ...mockPost, userId: 'different-user-id' };
      (db.get as jest.Mock).mockResolvedValue(postFromDifferentUser);
      
      // Act
      await schedulerController.schedulePostPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('not authorized')
      }));
    });
    
    it('should require a scheduledFor date', async () => {
      // Arrange
      mockRequest.body = {}; // No scheduledFor provided
      
      // Act
      await schedulerController.schedulePostPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('scheduledFor')
      }));
    });
  });
  
  describe('cancelScheduledPublication', () => {
    it('should cancel a scheduled post', async () => {
      // Arrange
      const scheduledPost = { ...mockPost, status: 'SCHEDULED' };
      (db.get as jest.Mock).mockResolvedValue(scheduledPost);
      
      // Act
      await schedulerController.cancelScheduledPublication(mockRequest, mockResponse);
      
      // Assert
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'DRAFT',
        scheduledFor: null
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should handle non-existent post', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValue(null);
      
      // Act
      await schedulerController.cancelScheduledPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
    
    it('should verify post ownership', async () => {
      // Arrange - post exists but belongs to a different user
      const postFromDifferentUser = { ...mockPost, userId: 'different-user-id' };
      (db.get as jest.Mock).mockResolvedValue(postFromDifferentUser);
      
      // Act
      await schedulerController.cancelScheduledPublication(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
  
  describe('listScheduledPosts', () => {
    it('should list all scheduled posts for a user', async () => {
      // Arrange
      const scheduledPosts = [
        { ...mockPost, status: 'SCHEDULED', scheduledFor: new Date() },
        { ...mockPost, id: 'post-456', status: 'SCHEDULED', scheduledFor: new Date() }
      ];
      (db.all as jest.Mock).mockResolvedValue(scheduledPosts);
      
      // Act
      await schedulerController.listScheduledPosts(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        posts: expect.arrayContaining([
          expect.objectContaining({ id: scheduledPosts[0].id }),
          expect.objectContaining({ id: scheduledPosts[1].id })
        ])
      }));
    });
    
    it('should require authentication', async () => {
      // Arrange - remove user from request
      mockRequest.user = null;
      
      // Act
      await schedulerController.listScheduledPosts(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
    
    it('should handle database errors', async () => {
      // Arrange
      (db.all as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await schedulerController.listScheduledPosts(mockRequest, mockResponse);
      
      // Assert
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
}); 