import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { join } from 'path';
import { logger } from '../utils/logger';
import * as schema from './schema';

// Get database path from environment variable or use default
const dbPath = process.env.DATABASE_URL || join(process.cwd(), 'data', 'database.sqlite');

// Ensure the database directory exists
try {
  const sqlite = new Database(dbPath);
  
  // Create database connection with Drizzle ORM
  export const db = drizzle(sqlite, { schema });
  
  logger.info(`Database connected at: ${dbPath}`);
} catch (error) {
  logger.error('Failed to connect to database:', error);
  throw new Error('Database connection failed');
} 