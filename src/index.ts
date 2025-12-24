import express from "express";
import rateLimit from "express-rate-limit";
import v1Router from "./routes"
import { dbClient } from "./db/config";
import { errorHandler } from "./middleware/error";

require("dotenv").config();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Too many requests, please try again later.",
});

const app = express();
const port = process.env.PORT || 3000
app.use(express.json());

app.use("/v1", limiter, v1Router);
app.use(errorHandler);

dbClient
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err.stack));

app.listen(port, () => console.log(`Server running on port ${port}`));
