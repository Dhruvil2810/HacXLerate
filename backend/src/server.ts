import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase, prisma } from './config/db.js';

async function bootstrap() {
  logger.info(`Starting ${env.OPENROUTER_SITE_NAME} API in ${env.NODE_ENV} mode...`);

  // Attempt database connection
  await connectDatabase();

  const app = createApp();

  const HOST = '0.0.0.0';
  const server = app.listen(env.PORT, HOST, () => {
    logger.info(`🚀 Server running on port ${env.PORT} (host: ${HOST}) in ${env.NODE_ENV} mode`);
    logger.info(`📋 Health check: http://${HOST}:${env.PORT}/health`);
    logger.info(`🔗 API v1 root: http://${HOST}:${env.PORT}/api/v1`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await prisma.$disconnect();
      logger.info('Database disconnected.');
      process.exit(0);
    });

    // Force exit if shutdown hangs
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Fatal bootstrap error:', error);
  process.exit(1);
});
