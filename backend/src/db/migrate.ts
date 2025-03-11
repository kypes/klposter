import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import { logger } from '../utils/logger';

/**
 * Run database migrations
 */
export const runMigrations = async () => {
  try {
    logger.info('Running database migrations...');
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    throw new Error('Database migration failed');
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 