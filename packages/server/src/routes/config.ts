import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { ALL_SECTIONS, SUPPORTED_CITIES } from '@report-gen/shared';

export const configRoutes = Router();

configRoutes.get('/sections', authenticate, asyncHandler(async (_req, res) => {
  res.json({ success: true, data: ALL_SECTIONS });
}));

configRoutes.get('/cities', authenticate, asyncHandler(async (_req, res) => {
  res.json({ success: true, data: SUPPORTED_CITIES });
}));

configRoutes.get('/property-types', authenticate, asyncHandler(async (_req, res) => {
  const types = [
    { value: 'residential', label: '住宅' },
    { value: 'commercial', label: '商业' },
    { value: 'office', label: '办公' },
    { value: 'gongdifang', label: '工抵房' },
    { value: 'mixed', label: '综合' },
  ];
  res.json({ success: true, data: types });
}));

configRoutes.get('/defaults', authenticate, asyncHandler(async (_req, res) => {
  const defaults = {
    defaultCities: ['beijing', 'shanghai'],
    defaultDepth: 'standard',
    defaultPropertyTypes: ['gongdifang', 'residential'],
    dataExpiryHours: {
      macro: 24,
      housingPrices: 12,
      transactions: 8,
      inventory: 12,
      landAuctions: 24,
      policies: 12,
      gongdifang: 6,
    },
  };
  res.json({ success: true, data: defaults });
}));
