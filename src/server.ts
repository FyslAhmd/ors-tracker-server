import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import app from "./app";
import { connectDB, appConfig } from "./config";

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(appConfig.port, () => {
      console.log(`
      🚀 Server running on port: ${appConfig.port}
      🔗 API URL: http://localhost:${appConfig.port}/api
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: any) => {
  console.error("❌ UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();
