// Set environment variables for mock mode
process.env.MOCK_DB = "true";
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "data/database.sqlite";

// Run the setup script using ts-node
require("ts-node").register();
require("./src/db/setup");
