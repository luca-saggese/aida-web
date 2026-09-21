import express from 'express';
import { applySecurity } from './middleware/security.js';
import { appRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export function createApp(): express.Express {
  const app = express();

  applySecurity(app);

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, mock: env.MOCK_GOTRAXX });
  });

  app.use('/api', appRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}