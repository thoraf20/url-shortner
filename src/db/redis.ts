import Redis from "ioredis";
import logger from "../utils/logger";
require("dotenv").config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on("error", (err) => logger.error({ err }, "Redis Client Error"));
redis.on("connect", () => logger.info("Redis Client Connected"));

export const redisClient = redis;

