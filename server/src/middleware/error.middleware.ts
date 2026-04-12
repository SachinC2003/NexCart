import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  code?: string | number;
  isOperational?: boolean;
}

const buildErrorResponse = (error: ErrorWithStatus) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  if (error.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Uploaded file is too large";
  }

  return {
    statusCode,
    status: error.status || (statusCode >= 400 && statusCode < 500 ? "fail" : "error"),
    message,
  };
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export const globalErrorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const normalizedError = err instanceof AppError ? err : Object.assign(new Error(err.message), err);
  const { statusCode, status, message } = buildErrorResponse(normalizedError);

  console.error(`[${req.method}] ${req.originalUrl}`, err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
