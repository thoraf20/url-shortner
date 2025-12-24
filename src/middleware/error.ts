import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({ err, req: { method: req.method, url: req.url, body: req.body } }, err.message || "An error occurred");

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

