import { isAuthenticated } from '../../middleware/auth-middleware';
import { ApiError } from '../../middleware/error-handler';

// Use any types for simplicity in tests to avoid TypeScript issues
describe('Auth Middleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      isAuthenticated: jest.fn()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  it('should call next() if user is authenticated', () => {
    // Arrange
    mockRequest.isAuthenticated.mockReturnValue(true);
    
    // Mock user object
    mockRequest.user = {
      id: 'test-user-id',
      username: 'testuser',
      discordId: 'test-discord-id',
      accessToken: 'test-access-token'
    };
    
    // Act
    isAuthenticated(mockRequest, mockResponse, nextFunction);
    
    // Assert
    expect(mockRequest.isAuthenticated).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should throw ApiError if user is not authenticated', () => {
    // Arrange
    mockRequest.isAuthenticated.mockReturnValue(false);
    
    // Act & Assert
    expect(() => {
      isAuthenticated(mockRequest, mockResponse, nextFunction);
    }).toThrow(ApiError);
    
    expect(mockRequest.isAuthenticated).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should handle session user correctly', () => {
    // Arrange
    mockRequest.isAuthenticated.mockReturnValue(true);
    
    // Simulate user information in request
    mockRequest.user = {
      id: 'test-user-id',
      username: 'testuser',
      discordId: 'test-discord-id',
      accessToken: 'test-access-token'
    };
    
    // Act
    isAuthenticated(mockRequest, mockResponse, nextFunction);
    
    // Assert the session user is accessible
    expect(mockRequest.isAuthenticated).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe('test-user-id');
    expect(nextFunction).toHaveBeenCalled();
  });
}); 