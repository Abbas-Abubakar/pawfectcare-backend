import app from "./app.js";
import { connectDB } from "./src/config/db.js"
import { env } from "./src/config/env.js";
import { startReminderJobs } from "./src/jobs/reminderScheduler.js";


const startServer = async () => {
  try{
    await connectDB()

    const server = app.listen(env.port, () => {
      startReminderJobs();
      console.log(`Server is running on port: ${env.port}`)
      console.log(`Environment: ${env.nodeEnv}`)
    })

    process.on("unhandledRejection", (error) => {
      console.error(error.name, error.message);
      console.error("Unhandled Rejection! Shutting down...");
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error) => {
      console.error(error.name, error.message);
      console.error("Uncaught Exception! Shutting down...");
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

startServer()