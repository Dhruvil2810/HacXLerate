import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/response.util.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn('Validation error on request', { path: req.path, errors: formattedErrors });
    sendError(res, 'Request validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    return;
  }

  // Handle known AppError
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      details: err.details,
    });
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Unhandled unexpected errors
  logger.error('Unhandled internal server error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;
  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR', env.NODE_ENV === 'development' ? { stack: err.stack } : null);
}
