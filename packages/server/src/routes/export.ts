import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ExportService } from '../services/ExportService';
import { AppError } from '../middleware/errorHandler';
import { queryOne } from '../db';

export const exportRoutes = Router();
const exportService = new ExportService();

exportRoutes.get('/:id/export/pdf', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (report.status !== 'ready') throw new AppError(400, 'NOT_READY', '报告尚未生成完成');

  const pdfBuffer = await exportService.exportPDF(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.pdf"`);
  res.send(pdfBuffer);
}));

exportRoutes.get('/:id/export/json', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (report.status !== 'ready') throw new AppError(400, 'NOT_READY', '报告尚未生成完成');

  const content = report.content ? JSON.parse(report.content as string) : null;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.json"`);
  res.json(content);
}));

exportRoutes.get('/:id/export/csv', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (report.status !== 'ready') throw new AppError(400, 'NOT_READY', '报告尚未生成完成');

  const csv = await exportService.exportCSV(req.params.id);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.csv"`);
  res.send(csv);
}));
