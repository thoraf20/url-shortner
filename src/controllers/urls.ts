import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { dbClient } from "../db/config";
import { redisClient } from "../db/redis";
import { analyticsQueue } from "../queues/analyticsQueue";

export const generateShortUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { longUrl, customAlias, expiresAt } = req.body;
    
    if (customAlias) {
      const { rows } = await dbClient.query(
        "SELECT * FROM urls WHERE short_code = $1",
        [customAlias]
      );
      if (rows.length && rows[0].expires_at > new Date()) {
        res.status(409).json({ error: `Custom alias ${customAlias} already in use and active` });
        return;
      }
    }

    const shortCode = customAlias || nanoid(6);
    if (!expiresAt) {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const { rows } = await dbClient.query(
      "INSERT INTO urls (short_code, long_url, expires_at) VALUES ($1, $2, $3) RETURNING *",
      [shortCode, longUrl, expiresAt]
    );

    const cacheKey = `url:${shortCode}`;
    const ttl = expiresAt 
      ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      : 7 * 24 * 60 * 60;

    if (ttl > 0) {
      await redisClient.set(cacheKey, JSON.stringify(rows[0]), "EX", ttl);
    }

    res.status(201).json({
      shortUrl: `${process.env.API_BASE_URL}/v1/shorten/${shortCode}`,
      shortCode: shortCode,
      expiresAt: rows[0].expires_at
    });
  } catch (error) {
    next(error);
  }
}

export const redirectToLongUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const cacheKey = `url:${shortCode}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      const url = JSON.parse(cachedData);
      
      // Offload analytics to background job
      analyticsQueue.add("log-analytics", {
        urlId: url.id,
        ip: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        referer: req.headers["referer"] || "",
      });

      res.redirect(url.long_url); 
      return; 
    }

    const { rows } = await dbClient.query(
      "SELECT * FROM urls WHERE short_code = $1",
      [shortCode]
    );

    if (!rows.length) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const url = rows[0];

    if (url.expires_at && new Date(url.expires_at) < new Date()) {
      res.status(410).json({ error: "This link has expired" });
      return;
    }

    const ttl = url.expires_at 
      ? Math.floor((new Date(url.expires_at).getTime() - Date.now()) / 1000)
      : 7 * 24 * 60 * 60;

    if (ttl > 0) {
      await redisClient.set(cacheKey, JSON.stringify(url), "EX", ttl);
    }

    // Offload analytics to background job
    analyticsQueue.add("log-analytics", {
      urlId: url.id,
      ip: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
      referer: req.headers["referer"] || "",
    });

    res.redirect(url.long_url);
  } catch (error) {
    next(error);
  }
}