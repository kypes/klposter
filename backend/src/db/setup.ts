/**
 * Database setup script
 * 
 * This script sets up the SQLite database and runs migrations
 * It uses the filesystem functions to ensure directories exist
 * and then calls the migrate function to apply migrations
 */

import { runMigrations } from './migrate';
import { logger } from '../utils/logger';

/**
 * Initialize the database and run migrations
 */
export const setupDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database setup...');
    
    // Run migrations to create tables
    await runMigrations();
    
    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw new Error('Failed to set up database');
  }
};

// Script startup logic - TypeScript ignores
// @ts-ignore
if (typeof require !== 'undefined' && require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info('Setup complete, exiting successfully');
      // @ts-ignore
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Setup failed:', error);
      // @ts-ignore
      process.exit(1);
    });
} 