import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  if (err.stack) {
    logger.debug(err.stack);
  }

  // Check if it's a known API error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Internal server error'
  });
}; 