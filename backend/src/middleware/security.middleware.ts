import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.util.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const configuredOrigins = [
      env.FRONTEND_URL,
      ...env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      'http://localhost:3000',
      'http://localhost:5173',
    ]
      .filter(Boolean)
      .map((url) => url.replace(/\/+$/, ''));

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (
      env.CORS_ORIGIN === '*' ||
      configuredOrigins.includes(normalizedOrigin) ||
      env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin ${origin} not allowed by Access-Control-Allow-Origin`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Too many requests, please slow down.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Too many authentication attempts. Please try again later.', 429, 'AUTH_RATE_LIMIT_EXCEEDED');
  },
});
