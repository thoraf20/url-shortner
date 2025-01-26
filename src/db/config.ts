import { Client, Pool } from "pg";
require("dotenv").config();

const connectionString = `localhost://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export const dbClient = new Client({
  connectionString: connectionString,
});