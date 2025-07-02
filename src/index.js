import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { httpServer } from "./app.js";
import logger from "./logger/winston.logger.js";

// Load environment variables
dotenv.config({ path: "./.env" });

// Validate required environment variables
const PORT = process.env.PORT || 8080;
if (!process.env.MONGODB_URI) {
  logger.error("❌ MONGODB_URI is not set in environment variables.");
  process.exit(1);
}

let server;

// Start the HTTP server
// This function initializes the server and listens on the specified port
const startServer = () => {
  server = httpServer.listen(PORT, () => {
    logger.info(
      `🚀 Server started in ${process.env.NODE_ENV || "development"} mode`
    );
    logger.info(`📑 Docs: http://localhost:${PORT}`);
    logger.info(`⚙️  Listening on port: ${PORT}`);
  });

  server.on("error", (err) => {
    logger.error("❌ Server error:", err);
    process.exit(1);
  });
};

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info("🛑 Server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle uncaught exceptions and unhandled rejections
const startApp = async () => {
  try {
    // Connect to the database
    logger.info("🔗 Connecting to the database...");
    await connectDB();
    logger.info("✅ Database connected.");
    startServer();
  } catch (error) {
    logger.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Start the application
startApp().catch((error) => {
  logger.error("❌ Unexpected startup error:", error);
  process.exit(1);
});
