import express from "express";
import rateLimit from "express-rate-limit";
import v1Router from "./routes"
import { dbClient } from "./db/config";
import { redisClient } from "./db/redis";
import { RedisStore } from "rate-limit-redis";
import { errorHandler } from "./middleware/error";
import "./queues/analyticsQueue"; // Initialize worker

require("dotenv").config();

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - Redis client is compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  message: "Too many requests from this IP, please try again later.",
});

// Stricter limiter for shortening URLs
export const shortenLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 shortening requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - Redis client is compatible
    sendCommand: (...args: string[]) => redisClient.call(...args),
    prefix: "rl-shorten:",
  }),
  message: "Too many URLs created, please wait a minute.",
});

const app = express();
const port = process.env.PORT || 3000
app.use(express.json());

app.use("/v1", globalLimiter, v1Router);
app.use(errorHandler);

dbClient
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err.stack));

app.listen(port, () => console.log(`Server running on port ${port}`));
