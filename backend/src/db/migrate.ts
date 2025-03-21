import { db, init } from "./index";
import { logger } from "../utils/logger";

/**
 * Run database migrations
 */
export const runMigrations = async () => {
  try {
    logger.info("Running database migrations...");

    // Ensure database is initialized
    await init();

    if (process.env.MOCK_DB === "true") {
      logger.info("Using mock database - migrations not needed");
      return;
    }

    // Try to import the migrator
    try {
      // @ts-ignore - Dynamic import
      const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");

      // Run migrations
      await migrate(db, { migrationsFolder: "./drizzle" });

      logger.info("Database migrations completed successfully");
    } catch (error) {
      logger.warn("Failed to run migrations:", error);
      if (process.env.NODE_ENV !== "production") {
        logger.info("Development environment - continuing without migrations");
      } else {
        throw new Error("Migration failed in production environment");
      }
    }
  } catch (error) {
    logger.error("Database migration failed:", error);
    throw new Error("Database migration failed");
  }
};

// Run migrations if this file is executed directly
// @ts-ignore
if (typeof require !== "undefined" && require.main === module) {
  runMigrations()
    .then(() => {
      logger.info("Migrations complete, exiting successfully");
      // @ts-ignore
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Migration failed:", error);
      // @ts-ignore
      process.exit(1);
    });
}
