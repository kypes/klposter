import dotenv from 'dotenv';
import { beforeAll, afterAll, jest, beforeEach } from '@jest/globals';
import { mockLogger } from './utils/test-mocks';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock logger - ensure consistent mocking across all tests
jest.mock('../utils/logger', () => ({
  logger: mockLogger
}));

// Mock external services
jest.mock('../services/spotify.service');

// Mock passport for auth testing
jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => (req: any, res: any, next: any) => {
    next();
  })
}));

// Mock session for authentication tests
jest.mock('express-session', () => {
  return () => (req: any, res: any, next: any) => {
    req.session = {
      user: {
        id: 'test-user-id',
        discordId: 'test-discord-id',
        username: 'testuser',
        discriminator: '1234',
        avatar: 'test-avatar',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token'
      }
    };
    next();
  };
});

// Configure Jest to reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset all mock implementations to ensure clean state
  (Object.keys(mockLogger) as Array<keyof typeof mockLogger>).forEach(key => {
    mockLogger[key].mockClear();
  });
});

// Global test setup
beforeAll(() => {
  // Setup test database connection
  process.env.DATABASE_URL = ':memory:';
  
  // Set mock mode for services
  process.env.MOCK_DB = 'true';
  
  // Ensure logger methods are properly mocked
  console.log('Jest global setup complete');
});

// Global test teardown
afterAll(() => {
  // Close any open connections
  console.log('Jest global teardown complete');
}); 