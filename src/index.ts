import express from "express";
require("dotenv").config();

import v1Router from "./routes"
import { dbClient } from "./db/config";
import { errorHandler } from "./middleware/error";
import { globalLimiter } from "./middleware/rateLimiter";
import logger from "./utils/logger";
import pinoHttp from "pino-http";
import "./queues/analyticsQueue"; // Initialize worker


const app = express();
const port = process.env.PORT || 3000

app.use(pinoHttp({ logger }));
app.use(express.json());

app.use("/v1", globalLimiter, v1Router);
app.use(errorHandler);

dbClient
  .connect()
  .then(() => logger.info("Connected to the database"))
  .catch((err) => logger.error({ err }, "Database connection error"));

app.listen(port, () => logger.info(`Server running on port ${port}`));

