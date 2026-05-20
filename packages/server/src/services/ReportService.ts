import { queryOne, execute } from '../db';
import { DataService } from './DataService';
import { ReportOrchestrator } from '../engine/ReportOrchestrator';
import { logger } from '../utils/logger';
import type { ReportConfig } from '@report-gen/shared';

export class ReportService {
  private dataService: DataService;
  private orchestrator: ReportOrchestrator;

  constructor() {
    this.dataService = new DataService();
    this.orchestrator = new ReportOrchestrator(this.dataService);
  }

  async generateReport(reportId: string, forceRefresh = false): Promise<void> {
    const report = queryOne('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (!report) throw new Error('报告不存在');

    try {
      const config: ReportConfig = JSON.parse(report.config as string);
      const document = await this.orchestrator.generate(reportId, config, forceRefresh);

      execute(
        'UPDATE reports SET status = ?, content = ?, generated_at = ?, updated_at = ? WHERE id = ?',
        ['ready', JSON.stringify(document), new Date().toISOString(), new Date().toISOString(), reportId]
      );

      logger.info({ reportId }, 'Report generated successfully');
    } catch (err) {
      logger.error({ err, reportId }, 'Report generation failed');
      execute(
        'UPDATE reports SET status = ?, error_message = ?, updated_at = ? WHERE id = ?',
        ['error', err instanceof Error ? err.message : '未知错误', new Date().toISOString(), reportId]
      );
    }
  }
}
