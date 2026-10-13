import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import multer from "multer";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Uploaded file exceeds the maximum allowed file size.";
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Handle CSRF token validation errors
  if (err.code === "EBADCSRFTOKEN") {
    statusCode = 403;
    message = "Invalid or missing CSRF token. Please provide a valid 'x-csrf-token' header.";
  }

  // Handle PostgREST / Supabase specific errors
  if (err.code && typeof err.code === "string" && err.details) {
    logger.warn(`PostgREST error: ${err.message} (${err.code})`);
    // PostgreSQL unique constraint violation
    if (err.code === "23505") {
      statusCode = 409;
      message = "Resource already exists or violates unique constraint.";
    }
  }

  // Log non-operational (server crash / bug) errors
  if (!err.isOperational && statusCode === 500) {
    logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err);
  }

  const responseBody: Record<string, any> = {
    success: false,
    message,
    statusCode,
  };

  if (process.env.NODE_ENV === "development") {
    responseBody.stack = err.stack;
    responseBody.details = err;
  }

  res.status(statusCode).json(responseBody);
};

export default errorHandler;
