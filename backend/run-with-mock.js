// Set environment variables for mock mode
process.env.MOCK_DB = "true";
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "data/database.sqlite";

console.log("Starting server with mock database...");

// Start the server using ts-node-dev
require("ts-node-dev").main(["--respawn", "--transpile-only", "src/index.ts"]);
