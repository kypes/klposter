/**
 * Mock Database Implementation
 *
 * This module provides a mock implementation of the database for development
 * when native module compilation issues prevent using better-sqlite3.
 */

const logger = require("../utils/logger").logger;
const schema = require("./schema");

// Mock database connection
class MockDatabase {
  constructor() {
    this.data = {
      users: [],
      posts: [],
      channels: [],
    };
  }

  // Mock query operations
  select(table) {
    return {
      get: () => this.data[table][0] || null,
      all: () => this.data[table],
      where: () => ({ all: () => [], get: () => null }),
    };
  }

  insert(table, data) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    this.data[table].push(data);
    return { returning: () => [data] };
  }

  update(table) {
    return {
      set: () => ({
        where: () => ({ execute: () => ({ rowsAffected: 1 }) }),
      }),
    };
  }

  delete(table) {
    return {
      where: () => ({ execute: () => ({ rowsAffected: 1 }) }),
    };
  }

  // Clear all data (for testing)
  clear() {
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
const db = {
  select: (field) => mockDb.select(field.table),
  insert: (table) => ({ values: (data) => mockDb.insert(table.name, data) }),
  update: (table) => mockDb.update(table.name),
  delete: (table) => mockDb.delete(table.name),
  transaction: (fn) => fn(mockDb),
  // Add any other methods needed
};

// Export database and schema
module.exports = { db, schema };
