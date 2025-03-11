import express from "express";
import { logger } from "./utils/logger";
import { db, init } from "./db/index";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize database
init()
  .then(() => {
    // Health check endpoint
    app.get("/api/health", (req: express.Request, res: express.Response) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        mockDb: process.env.MOCK_DB === "true",
      });
    });

    // Start server
    app.listen(port, () => {
      logger.info(`Test server running on port ${port}`);
      logger.info(`Using mock database: ${process.env.MOCK_DB === "true"}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to start test server:", error);
    process.exit(1);
  });
