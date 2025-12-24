import { Queue, Worker, Job } from "bullmq";
import { redisClient } from "../db/redis";
import { dbClient } from "../db/config";
import logger from "../utils/logger";

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

      logger.info({ urlId }, `[Worker] Processed analytics for URL ID ${urlId}`);
    } catch (error) {
      logger.error({ error, urlId }, `[Worker] Failed to process analytics for URL ID ${urlId}`);
      throw error;
    }
  },
  { connection: redisClient.options }
);

worker.on("failed", (job, err) => {
  logger.error({ job: job?.id, err }, `[Worker] Job ${job?.id} failed`);
});

export const stopAnalyticsWorker = async () => {
  logger.info("Stopping analytics worker...");
  await worker.close();
};


