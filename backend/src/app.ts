import express, { Express } from 'express';
import { helmetMiddleware, corsMiddleware, generalRateLimiter } from './middleware/security.middleware.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { apiV1Router } from './routes/api.routes.js';
import { sendError } from './utils/response.util.js';

export function createApp(): Express {
  const app = express();

  // Trust reverse proxy (for rate limiting, IP resolution behind load balancers)
  app.set('trust proxy', 1);

  // Security headers & CORS
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Request Rate Limiting
  app.use(generalRateLimiter);

  // Body Parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Request Logging
  app.use(requestLogger);

  // Direct Root Health Endpoint
  app.use('/', healthRouter);

  // API v1 Routing
  app.use('/api/v1', apiV1Router);

  // 404 Route Catch-all
  app.use('*', (req, res) => {
    sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND');
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
