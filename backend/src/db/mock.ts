/**
 * Mock Database Implementation
 *
 * This module provides a mock implementation of the database for development
 * when native module compilation issues prevent using better-sqlite3.
 */

import { logger } from "../utils/logger";
import * as schema from "./schema";

// Mock database connection
class MockDatabase {
  private data: Record<string, any[]> = {
    users: [],
    posts: [],
    channels: [],
  };

  // Mock query operations
  public select(table: string) {
    return {
      get: () => this.data[table][0] || null,
      all: () => this.data[table],
      where: () => ({ all: () => [], get: () => null }),
    };
  }

  public insert(table: string, data: any) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    this.data[table].push(data);
    return { returning: () => [data] };
  }

  public update(table: string) {
    return {
      set: () => ({
        where: () => ({ execute: () => ({ rowsAffected: 1 }) }),
      }),
    };
  }

  public delete(table: string) {
    return {
      where: () => ({ execute: () => ({ rowsAffected: 1 }) }),
    };
  }

  // Clear all data (for testing)
  public clear() {
    this.data = {
      users: [],
      posts: [],
      channels: [],
    };
  }
}

// Initialize the mock database
const mockDb = new MockDatabase();
logger.info("Using mock database for development");

// Export the mock database as if it were a real Drizzle ORM instance
export const db = {
  select: (field: any) => mockDb.select(field.table),
  insert: (table: any) => ({
    values: (data: any) => mockDb.insert(table.name, data),
  }),
  update: (table: any) => mockDb.update(table.name),
  delete: (table: any) => mockDb.delete(table.name),
  transaction: (fn: Function) => fn(mockDb),
  // Add any other methods needed
};

// Export schema
export { schema };
