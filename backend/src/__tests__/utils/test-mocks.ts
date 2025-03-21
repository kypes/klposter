import { jest } from '@jest/globals';

/**
 * Common test mocks for reuse across all tests
 */

// Mock logger
export const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn()
};

// Mock database with simpler implementation that avoids TypeScript errors
export const mockDb = {
  // Basic mock implementations that can be overridden in specific tests
  insert: jest.fn(),
  select: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  from: jest.fn(),
  where: jest.fn(),
  execute: jest.fn()
};

/**
 * Mock user for authentication tests
 */
export const mockUser = {
  id: 'test-user-123',
  displayName: 'Test User',
  username: 'testuser',
  provider: 'google',
  emails: [{ value: 'test@example.com' }],
  photos: [{ value: 'https://example.com/photo.jpg' }]
};

/**
 * Helper function to create a mock request
 */
export function createMockRequest(params = {}, query = {}, body = {}) {
  return {
    params,
    query,
    body,
    user: null,
    session: {},
    headers: {},
    get: jest.fn((headerName: string) => undefined)
  };
}

/**
 * Helper function to create a mock response
 */
export function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
}

/**
 * Function to apply common mocks in tests
 */
export function setupCommonMocks() {
  // Mock logger
  jest.mock('../../utils/logger', () => ({
    logger: mockLogger
  }));
  
  // Mock database
  jest.mock('../../db', () => ({
    db: mockDb
  }));
} 