 
const app = require("./app");
const env = require("./config/env");
const {
  checkDatabaseConnection,
  closeDatabase
} = require("./config/db");

let server;

async function startServer() {
  try {
    await checkDatabaseConnection();

    console.log("PostgreSQL connected successfully");

    server = app.listen(env.port, () => {
      console.log(
        `Transparent Fund Ledger API running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      try {
        await closeDatabase();
        console.log("Database connection closed");
        process.exit(0);
      } catch (error) {
        console.error("Error while closing database:", error);
        process.exit(1);
      }
    });
  } else {
    await closeDatabase();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();