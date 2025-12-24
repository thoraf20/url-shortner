import Redis from "ioredis";
require("dotenv").config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Redis Client Connected"));

export const redisClient = redis;
