import { ApiError, errorHandler } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';

// Use any types for simplicity in tests
describe('Error Handler', () => {
  describe('ApiError class', () => {
    it('should create an instance with correct properties', () => {
      // Arrange & Act
      const error = new ApiError(400, 'Test error');
      
      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ApiError');
    });
    
    it('should set name and capture stack trace', () => {
      // Arrange & Act
      const error = new ApiError(500, 'Server error');
      
      // Assert
      expect(error.name).toBe('ApiError');
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('errorHandler Middleware', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: jest.Mock;
    
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Setup mock request and response
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      mockNext = jest.fn();
    });
    
    it('should handle ApiError and return appropriate status code', () => {
      // Arrange
      const apiError = new ApiError(400, 'Test API error');
      
      // Act
      errorHandler(apiError, mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('ApiError'));
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 400,
        message: 'Test API error'
      });
    });
    
    it('should handle generic Error and return 500 status code', () => {
      // Arrange
      const genericError = new Error('Test generic error');
      
      // Act
      errorHandler(genericError, mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error'));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: 500,
        message: 'Internal server error'
      });
    });
    
    it('should log stack trace if available', () => {
      // Arrange
      const error = new Error('Test error with stack');
      error.stack = 'Test stack trace';
      
      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);
      
      // Assert
      expect(logger.debug).toHaveBeenCalledWith(error.stack);
    });
  });
}); 