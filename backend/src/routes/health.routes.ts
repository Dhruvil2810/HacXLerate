import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.util.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

// Render and uptime monitoring health check
healthRouter.get(['/health', '/live', '/ready'], async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  let dbStatus = 'disconnected';
  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    dbHealthy = true;
  } catch {
    dbStatus = 'unreachable';
    dbHealthy = false;
  }

  const memoryUsage = process.memoryUsage();
  const isStrict = req.query.strict === 'true';

  const payload = {
    status: dbHealthy || !isStrict ? 'ok' : 'degraded',
    service: 'CreatorOS API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: {
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    },
  };

  if (isStrict && !dbHealthy) {
    return res.status(503).json({ success: false, data: payload });
  }

  return sendSuccess(res, payload, 200);
});
