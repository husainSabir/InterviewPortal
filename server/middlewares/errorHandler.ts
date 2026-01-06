import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = res.statusCode === 200 ? err.statusCode || 500 : res.statusCode;
  res.status(statusCode);
  console.error(err);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};


