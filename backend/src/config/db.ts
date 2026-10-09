import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully.');
    return true;
  } catch (error) {
    logger.warn('Database connection failed. Ensure PostgreSQL is running if performing database operations.', { error });
    return false;
  }
}
