import { createPost, getPost, updatePost, deletePost, listPosts } from '../../controllers/post';
import { db } from '../../db';
import { logger } from '../../utils/logger';
import { posts } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { createMockRequest, createMockResponse } from '../utils/test-mocks';

// Mock database and logger
jest.mock('../../db', () => {
  // Create a mock database object to use in tests
  const mockDbInstance = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    all: jest.fn()
  };
  
  return {
    db: mockDbInstance
  };
});

// Mock validation result
jest.mock('express-validator', () => ({
  validationResult: jest.fn().mockReturnValue({
    isEmpty: jest.fn().mockReturnValue(true),
    array: jest.fn().mockReturnValue([])
  })
}));

describe('Post Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  
  const mockPost = {
    id: 'mocked-post-id',
    title: 'Mocked Post',
    content: 'Test content',
    userId: 'test-user-id',
    status: 'DRAFT',
    trackList: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementations
    (db.get as jest.Mock).mockResolvedValue(mockPost);
    (db.all as jest.Mock).mockResolvedValue([mockPost]);
    
    // Setup request with authenticated user
    mockRequest = createMockRequest(
      { id: 'mocked-post-id' }, // params
      {}, // query
      { // body
        title: 'Test Post',
        content: 'Test content',
        status: 'DRAFT'
      }
    );
    
    // Add user to the request (simulating authenticated user)
    mockRequest.user = { id: 'test-user-id' };
    
    mockResponse = createMockResponse();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      // Act
      await createPost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalled();
    });
    
    it('should handle validation errors', async () => {
      // Override the validation mock for this test
      const validationMock = require('express-validator');
      validationMock.validationResult.mockReturnValueOnce({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Title is required' }])
      });
      
      // Act
      await createPost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        errors: expect.any(Array)
      }));
    });
    
    it('should handle errors when creating a post', async () => {
      // Arrange
      (db.insert as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      // Act
      await createPost(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Failed to create post'
      }));
    });
  });

  describe('getPost', () => {
    it('should get a post by id when user is the owner', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(mockPost);
      
      // Act
      await getPost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: mockPost.id,
        title: mockPost.title
      }));
    });
    
    it('should return 404 when post does not exist', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await getPost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Post not found'
      }));
    });
    
    it('should return 403 when user is not the owner', async () => {
      // Arrange - post exists but belongs to a different user
      const postFromDifferentUser = { ...mockPost, userId: 'different-user-id' };
      (db.get as jest.Mock).mockResolvedValueOnce(postFromDifferentUser);
      
      // Act
      await getPost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Forbidden')
      }));
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully when user is the owner', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(mockPost);
      
      // Act
      await updatePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalled();
    });
    
    it('should return 404 when post does not exist', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await updatePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Post not found'
      }));
    });
    
    it('should return 403 when user is not the owner', async () => {
      // Arrange
      const postFromDifferentUser = { ...mockPost, userId: 'different-user-id' };
      (db.get as jest.Mock).mockResolvedValueOnce(postFromDifferentUser);
      
      // Act
      await updatePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Forbidden')
      }));
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully when user is the owner', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(mockPost);
      
      // Act
      await deletePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(db.delete).toHaveBeenCalled();
    });
    
    it('should return 404 when post does not exist', async () => {
      // Arrange
      (db.get as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await deletePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Post not found'
      }));
    });
    
    it('should return 403 when user is not the owner', async () => {
      // Arrange
      const postFromDifferentUser = { ...mockPost, userId: 'different-user-id' };
      (db.get as jest.Mock).mockResolvedValueOnce(postFromDifferentUser);
      
      // Act
      await deletePost(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Forbidden')
      }));
    });
  });

  describe('listPosts', () => {
    it('should list all posts for a user', async () => {
      // Arrange
      mockRequest.query = {};
      (db.all as jest.Mock).mockResolvedValueOnce([mockPost]);
      (db.get as jest.Mock).mockResolvedValueOnce({ count: 1 });
      
      // Act
      await listPosts(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        posts: expect.arrayContaining([
          expect.objectContaining({ id: mockPost.id })
        ])
      }));
    });
    
    it('should filter posts by status', async () => {
      // Arrange
      mockRequest.query = { status: 'PUBLISHED' };
      (db.all as jest.Mock).mockResolvedValueOnce([{ ...mockPost, status: 'PUBLISHED' }]);
      (db.get as jest.Mock).mockResolvedValueOnce({ count: 1 });
      
      // Act
      await listPosts(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });
}); 