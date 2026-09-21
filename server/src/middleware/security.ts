import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env.js';

export function applySecurity(app: import('express').Express): void {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean);
        // Allow same-origin (no origin header) requests e.g. curl.
        if (!origin || allowed.includes(origin) || env.NODE_ENV !== 'production') {
          cb(null, true);
          return;
        }
        cb(new Error('CORS origin not allowed'));
      },
      credentials: true,
    }),
  );

  // Global API limiter.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { code: 'RATE_LIMITED', message: 'Too many requests', details: [] } },
    }),
  );
}

export const apiKeyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const key = String(req.headers['x-api-key'] ?? '');
    return key || req.ip || 'anon';
  },
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests', details: [] } },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts, slow down', details: [] } },
});