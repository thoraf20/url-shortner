import express from "express";
require("dotenv").config();

import v1Router from "./routes"
import healthRouter from "./routes/health";
import { dbClient, closeDb } from "./db/config";
import { closeRedis } from "./db/redis";
import { errorHandler } from "./middleware/error";
import { globalLimiter } from "./middleware/rateLimiter";
import logger from "./utils/logger";
import pinoHttp from "pino-http";
import { stopAnalyticsWorker } from "./queues/analyticsQueue"; 
import { setupSwagger } from "./utils/swagger";

const app = express();
const port = process.env.PORT || 3000

setupSwagger(app);

app.use(pinoHttp({ logger }));

app.use(express.json());

app.use("/health", healthRouter);
app.use("/v1", globalLimiter, v1Router);
app.use(errorHandler);


dbClient
  .connect()
  .then(() => logger.info("Connected to the database"))
  .catch((err) => logger.error({ err }, "Database connection error"));

const server = app.listen(port, () => logger.info(`Server running on port ${port}`));

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  // Stop receiving new requests
  server.close(() => {
    logger.info("HTTP server closed.");
  });

  try {
    // Stop worker (don't accept new jobs, wait for current ones)
    await stopAnalyticsWorker();
    
    await closeDb();
    await closeRedis();

    logger.info("Graceful shutdown completed. Exiting.");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));


