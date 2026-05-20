import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { DataService } from '../services/DataService';
import { refreshDataSchema } from '@report-gen/shared';

export const dataRoutes = Router();
const dataService = new DataService();

dataRoutes.get('/sources', authenticate, asyncHandler(async (_req, res) => {
  const sources = await dataService.getSourceStatuses();
  res.json({ success: true, data: sources });
}));

dataRoutes.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  const params = refreshDataSchema.parse(req.body);
  const results = await dataService.refreshData(params.sources, params.force);
  res.json({
    success: true,
    data: results,
  });
}));

dataRoutes.post('/refresh/:sourceName', authenticate, asyncHandler(async (req, res) => {
  const results = await dataService.refreshData([req.params.sourceName], true);
  res.json({ success: true, data: results[0] ?? null });
}));

dataRoutes.get('/refresh/history', authenticate, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string || '20', 10);
  const history = await dataService.getRefreshHistory(limit);
  res.json({ success: true, data: history });
}));

dataRoutes.get('/cache/:sourceName', authenticate, asyncHandler(async (req, res) => {
  const dataType = req.query.dataType as string | undefined;
  const limit = parseInt(req.query.limit as string || '50', 10);
  const cache = await dataService.getCachedData(req.params.sourceName, dataType, limit);
  res.json({ success: true, data: cache });
}));

dataRoutes.get('/macro', authenticate, asyncHandler(async (_req, res) => {
  const data = await dataService.getMacroData();
  res.json({ success: true, data });
}));

dataRoutes.get('/housing-prices', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const data = await dataService.getHousingPrices(city);
  res.json({ success: true, data });
}));

dataRoutes.get('/transactions', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const data = await dataService.getTransactions(city);
  res.json({ success: true, data });
}));

dataRoutes.get('/inventory', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const data = await dataService.getInventory(city);
  res.json({ success: true, data });
}));

dataRoutes.get('/land-auctions', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const data = await dataService.getLandAuctions(city);
  res.json({ success: true, data });
}));

dataRoutes.get('/gongdifang', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const data = await dataService.getGongDiFangData(city);
  res.json({ success: true, data });
}));

dataRoutes.get('/policies', authenticate, asyncHandler(async (req, res) => {
  const city = req.query.city as string | undefined;
  const category = req.query.category as string | undefined;
  const data = await dataService.getPolicies(city, category);
  res.json({ success: true, data });
}));
