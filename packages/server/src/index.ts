import { createApp } from './app';
import { env } from './config/env';
import { initDatabase } from './config/database';
import { RefreshScheduler } from './scheduler/RefreshScheduler';
import { logger } from './utils/logger';

async function main() {
  // Initialize database
  await initDatabase();
  logger.info('Database initialized');

  const app = createApp();
  const scheduler = new RefreshScheduler();

  app.listen(env.PORT, '::', () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Network: http://<your-ip>:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);

    if (env.NODE_ENV === 'production') {
      scheduler.start();
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down...');
    scheduler.stop();
    process.exit(0);
  });
}

main().catch(err => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
