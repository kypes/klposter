// Set environment variables for mock mode
process.env.MOCK_DB = "true";
process.env.NODE_ENV = "development";
process.env.DATABASE_URL = "data/database.sqlite";

console.log("Starting server with mock database...");

// Start the server using ts-node
const { spawn } = require("child_process");

// Use child_process.spawn to run ts-node-dev as a separate process
const tsNodeDev = spawn(
  "npx",
  ["ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"],
  { stdio: "inherit", shell: true }
);

// Handle process errors
tsNodeDev.on("error", (error) => {
  console.error("Failed to start ts-node-dev:", error);
  process.exit(1);
});

// Forward the exit code
tsNodeDev.on("close", (code) => {
  process.exit(code);
});
