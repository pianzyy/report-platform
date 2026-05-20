import cron from 'node-cron';
import { DataService } from '../services/DataService';
import { logger } from '../utils/logger';

export class RefreshScheduler {
  private dataService: DataService;
  private jobs: cron.ScheduledTask[] = [];

  constructor() {
    this.dataService = new DataService();
  }

  start(): void {
    // Refresh all data every 6 hours at minute 17 past the hour
    const fullRefreshJob = cron.schedule('17 */6 * * *', async () => {
      logger.info('Scheduled full data refresh started');
      try {
        const results = await this.dataService.refreshData(undefined, false);
        logger.info({ results }, 'Scheduled full data refresh completed');
      } catch (err) {
        logger.error({ err }, 'Scheduled full data refresh failed');
      }
    });

    // Refresh 工抵房 data every 2 hours
    const gdfRefreshJob = cron.schedule('43 */2 * * *', async () => {
      logger.info('Scheduled 工抵房 data refresh started');
      try {
        await this.dataService.refreshData(['gongdifang'], false);
        logger.info('Scheduled 工抵房 data refresh completed');
      } catch (err) {
        logger.error({ err }, 'Scheduled 工抵房 data refresh failed');
      }
    });

    // Cleanup expired cache daily at 3:23 AM
    const cleanupJob = cron.schedule('23 3 * * *', async () => {
      logger.info('Scheduled cache cleanup started');
      try {
        await this.dataService.getRefreshHistory(1);
        logger.info('Scheduled cache cleanup completed');
      } catch (err) {
        logger.error({ err }, 'Scheduled cache cleanup failed');
      }
    });

    this.jobs = [fullRefreshJob, gdfRefreshJob, cleanupJob];
    logger.info('Refresh scheduler started');
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop();
    }
    this.jobs = [];
    logger.info('Refresh scheduler stopped');
  }
}
