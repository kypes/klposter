// Set environment variables for mock mode
process.env.MOCK_DB = "true";
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "data/database.sqlite";

console.log("Starting test server with mock database...");

// Register ts-node to handle TypeScript files
require("ts-node").register();

// Run the test server
require("./src/test-server");
