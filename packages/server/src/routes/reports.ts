import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ReportService } from '../services/ReportService';
import { reportConfigSchema, paginationSchema } from '@report-gen/shared';
import type { ReportConfig } from '@report-gen/shared';

export const reportRoutes = Router();

const reportService = new ReportService();

function formatReport(r: Record<string, unknown>): Record<string, unknown> {
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
    content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    generatedAt: r.generated_at,
    errorMessage: r.error_message,
  };
}

reportRoutes.get('/', authenticate, asyncHandler(async (req, res) => {
  const params = paginationSchema.parse(req.query);
  const { page, pageSize } = params;
  const status = req.query.status as string | undefined;
  const city = req.query.city as string | undefined;

  let where = 'user_id = ?';
  const bindParams: unknown[] = [req.user!.id];
  if (status) { where += ' AND status = ?'; bindParams.push(status); }
  if (city) { where += ' AND config LIKE ?'; bindParams.push(`%${city}%`); }

  const total = queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM reports WHERE ${where}`, bindParams);
  const list = queryAll(`SELECT * FROM reports WHERE ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...bindParams, pageSize, (page - 1) * pageSize]);

  const data = list.map(r => formatReport(r as Record<string, unknown>));

  res.json({ success: true, data, meta: { page, pageSize, total: total?.count ?? 0 } });
}));

reportRoutes.post('/', authenticate, asyncHandler(async (req, res) => {
  const config = reportConfigSchema.parse(req.body);
  const id = uuidv4();
  const now = new Date().toISOString();

  execute(
    `INSERT INTO reports (id, title, status, config, content, created_at, updated_at, generated_at, error_message, user_id) VALUES (?, ?, 'draft', ?, NULL, ?, ?, NULL, NULL, ?)`,
    [id, config.title, JSON.stringify(config), now, now, req.user!.id]
  );

  const created = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [id, req.user!.id]);
  res.status(201).json({ success: true, data: created ? formatReport(created as Record<string, unknown>) : null });
}));

reportRoutes.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');

  res.json({
    success: true,
    data: formatReport(report as Record<string, unknown>),
  });
}));

reportRoutes.patch('/:id', authenticate, asyncHandler(async (req, res) => {
  const existing = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!existing) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (existing.status === 'generating') throw new AppError(400, 'INVALID_STATUS', '报告正在生成中，无法编辑');

  const updates: string[] = [];
  const params: unknown[] = [];
  if (req.body.title) { updates.push('title = ?'); params.push(req.body.title); }
  if (req.body.config) {
    const parsed = reportConfigSchema.parse(req.body.config);
    updates.push('config = ?'); params.push(JSON.stringify(parsed));
    updates.push('status = ?'); params.push('draft');
    updates.push('content = NULL');
    updates.push('error_message = NULL');
  }
  updates.push('updated_at = ?'); params.push(new Date().toISOString());
  params.push(req.params.id);
  params.push(req.user!.id);

  execute(`UPDATE reports SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);

  const updated = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  res.json({ success: true, data: updated ? formatReport(updated as Record<string, unknown>) : null });
}));

reportRoutes.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const existing = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!existing) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  execute('DELETE FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  res.json({ success: true, data: null });
}));

reportRoutes.post('/:id/generate', authenticate, asyncHandler(async (req, res) => {
  const existing = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!existing) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (existing.status === 'generating') throw new AppError(400, 'ALREADY_GENERATING', '报告正在生成中');

  const forceRefresh = req.body?.forceRefresh ?? false;

  execute('UPDATE reports SET status = ?, error_message = NULL, updated_at = ? WHERE id = ? AND user_id = ?',
    ['generating', new Date().toISOString(), req.params.id, req.user!.id]);

  reportService.generateReport(req.params.id, forceRefresh).catch(err => {
    execute('UPDATE reports SET status = ?, error_message = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      ['error', err.message, new Date().toISOString(), req.params.id, req.user!.id]);
  });

  res.status(202).json({ success: true, data: { id: req.params.id, status: 'generating' } });
}));

reportRoutes.get('/:id/status', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT id, status, error_message as errorMessage, generated_at as generatedAt FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  res.json({ success: true, data: report });
}));

reportRoutes.get('/:id/content', authenticate, asyncHandler(async (req, res) => {
  const report = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!report) throw new AppError(404, 'NOT_FOUND', '报告不存在');
  if (report.status !== 'ready') throw new AppError(400, 'NOT_READY', '报告尚未生成完成');
  res.json({ success: true, data: report.content ? JSON.parse(report.content as string) : null });
}));

reportRoutes.post('/:id/clone', authenticate, asyncHandler(async (req, res) => {
  const existing = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
  if (!existing) throw new AppError(404, 'NOT_FOUND', '报告不存在');

  const newId = uuidv4();
  const now = new Date().toISOString();
  const config = JSON.parse(existing.config as string);
  config.title = `${config.title} (副本)`;

  execute(
    `INSERT INTO reports (id, title, status, config, content, created_at, updated_at, generated_at, error_message, user_id) VALUES (?, ?, 'draft', ?, NULL, ?, ?, NULL, NULL, ?)`,
    [newId, config.title, JSON.stringify(config), now, now, req.user!.id]
  );

  const cloned = queryOne('SELECT * FROM reports WHERE id = ? AND user_id = ?', [newId, req.user!.id]);
  res.status(201).json({ success: true, data: cloned ? formatReport(cloned as Record<string, unknown>) : null });
}));
