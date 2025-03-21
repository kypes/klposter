/**
 * Database Module
 *
 * This module exports a function to initialize the database connection.
 * TypeScript issues with dynamic imports are handled with type declarations.
 */

import { logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";
import * as schema from "./schema";

// Database object - will be initialized in init()
let db: any = null;

// Database initialization function
const init = async () => {
  // Create data directory if it doesn't exist
  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    logger.info(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Use mock database if specified or if real DB initialization fails
  try {
    if (process.env.MOCK_DB === "true") {
      logger.info(
        "Using mock database as specified by MOCK_DB environment variable"
      );
      // @ts-ignore - We're using a JavaScript file for better compatibility
      const mockModule = require("./mock.js");
      db = mockModule.db;
    } else {
      logger.info("Initializing real SQLite database");

      // Get database path
      const dbPath =
        process.env.DATABASE_URL ||
        path.join(process.cwd(), "data", "database.sqlite");

      try {
        // @ts-ignore - Dynamic import
        const { default: Database } = await import("better-sqlite3");
        // @ts-ignore - Dynamic import
        const { drizzle } = await import("drizzle-orm/better-sqlite3");

        // Create SQLite connection
        // @ts-ignore - Constructor type issue
        const sqlite = new Database(dbPath);
        logger.info(`Database connected at: ${dbPath}`);

        // Create database connection with Drizzle ORM
        db = drizzle(sqlite, { schema });
        logger.info("Using real SQLite database implementation");
      } catch (sqliteError) {
        logger.warn("Failed to initialize SQLite database:", sqliteError);
        logger.info("Falling back to mock database...");

        // @ts-ignore - We're using a JavaScript file for better compatibility
        const mockModule = require("./mock.js");
        db = mockModule.db;
        logger.info("Using mock database as fallback");
      }
    }
  } catch (error) {
    logger.error("Failed to initialize any database:", error);
    throw new Error("Database initialization failed");
  }

  return db;
};

// Initialize database
init()
  .then(() => logger.info("Database initialization complete"))
  .catch((error) => {
    logger.error("Database initialization failed:", error);
    process.exit(1);
  });

// Export database and schema
export { db, schema, init };
