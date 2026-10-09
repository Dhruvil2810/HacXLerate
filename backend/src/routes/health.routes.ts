import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.util.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'unreachable';
  }

  const memoryUsage = process.memoryUsage();

  return sendSuccess(res, {
    status: 'ok',
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
  });
});
