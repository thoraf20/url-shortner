import { Queue, Worker, Job } from "bullmq";
import { redisClient } from "../db/redis";
import { dbClient } from "../db/config";

const QUEUE_NAME = "analytics";

interface AnalyticsJobData {
  urlId: number;
  ip: string;
  userAgent: string;
  referer: string;
}

export const analyticsQueue = new Queue(QUEUE_NAME, {
  connection: redisClient.options,
});

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job<AnalyticsJobData>) => {
    const { urlId, ip, userAgent, referer } = job.data;

    try {
      await dbClient.query(
        "UPDATE urls SET click_count = click_count + 1 WHERE id = $1",
        [urlId]
      );
      await dbClient.query(
        "INSERT INTO analytics (url_id, ip_address, user_agent, referer) VALUES ($1, $2, $3, $4)",
        [urlId, ip, userAgent, referer]
      );

      console.log(`[Worker] Processed analytics for URL ID ${urlId}`);
    } catch (error) {
      console.error(`[Worker] Failed to process analytics for URL ID ${urlId}:`, error);
      throw error;
    }
  },
  { connection: redisClient.options }
);

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
