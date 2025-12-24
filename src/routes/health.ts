import { Router } from "express";
import { dbClient } from "../db/config";
import { redisClient } from "../db/redis";

const router = Router();

router.get("/liveness", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/readiness", async (req, res) => {
  try {
    await dbClient.query("SELECT 1");
    
    await redisClient.ping();

    res.status(200).json({ 
      status: "ready",
      checks: {
        database: "connected",
        redis: "connected"
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: "unavailable",
      error: error instanceof Error ? error.message : "Internal Error"
    });
  }
});

export default router;
