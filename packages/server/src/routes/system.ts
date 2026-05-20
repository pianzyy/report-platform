import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { queryOne } from '../db';
import { env } from '../config/env';

export const systemRoutes = Router();

systemRoutes.get('/health', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
}));

systemRoutes.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const reportCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM reports WHERE user_id = ?', [userId]);
  const readyReports = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM reports WHERE status = ? AND user_id = ?', ['ready', userId]);
  const cacheCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM data_cache WHERE is_valid = 1');
  const lastRefresh = queryOne<{ max: string }>('SELECT MAX(started_at) as max FROM refresh_history');

  res.json({
    success: true,
    data: {
      totalReports: reportCount?.count ?? 0,
      readyReports: readyReports?.count ?? 0,
      cachedDataPoints: cacheCount?.count ?? 0,
      lastRefreshAt: lastRefresh?.max ?? null,
      dataFreshness: 'checking',
    },
  });
}));
