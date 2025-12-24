import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../db/redis";

// Global rate limiter
export const globalLimiter = rateLimit({
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
