import { Pool } from "pg";
import logger from "../utils/logger";
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

export const dbClient = pool;

export const closeDb = async () => {
  logger.info("Closing database pool...");
  await pool.end();
};
