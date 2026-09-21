import type { ZodError } from 'zod';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_CREDENTIALS'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details: unknown[];

  constructor(statusCode: number, code: ErrorCode, message: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function zodToErrorDetails(error: ZodError): unknown[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function unauthorized(message = 'Authentication required'): AppError {
  return new AppError(401, 'UNAUTHORIZED', message);
}

export function invalidCredentials(message = 'Invalid email or password'): AppError {
  return new AppError(401, 'INVALID_CREDENTIALS', message);
}

export function forbidden(message = 'You do not have permission to perform this action'): AppError {
  return new AppError(403, 'FORBIDDEN', message);
}

export function notFound(message = 'Resource not found'): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function conflict(message: string): AppError {
  return new AppError(409, 'CONFLICT', message);
}

export function invalidRequest(message: string, details: unknown[] = []): AppError {
  return new AppError(400, 'INVALID_REQUEST', message, details);
}

export function emailNotVerified(message = 'Please confirm your email address before continuing'): AppError {
  return new AppError(403, 'EMAIL_NOT_VERIFIED', message);
}

export function rateLimited(message = 'Too many requests, please try again later'): AppError {
  return new AppError(429, 'RATE_LIMITED', message);
}