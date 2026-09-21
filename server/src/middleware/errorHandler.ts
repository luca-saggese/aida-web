import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, zodToErrorDetails } from '../utils/errors.js';
import { env } from '../config/env.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', details: [] } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: zodToErrorDetails(err) },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON body', details: [] } });
    return;
  }

  // eslint-disable-next-line no-console
  if (env.NODE_ENV !== 'test') console.error('Unhandled error:', err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : 'Internal server error',
      details: env.NODE_ENV === 'production' ? [] : [],
    },
  });
}