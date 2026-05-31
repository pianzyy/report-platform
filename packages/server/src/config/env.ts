import path from 'path';

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'reports.db'),
  CACHE_DIR: process.env.CACHE_DIR || path.join(__dirname, '..', '..', 'cache'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173'),
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET environment variable is required in production'); })() : 'dev-secret-change-in-production'),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS !== 'false',
  SCRAPER_INTERVAL_MS: parseInt(process.env.SCRAPER_INTERVAL_MS || '21600000', 10),
  DATA_FRESHNESS_THRESHOLD_HOURS: {
    macro: 24,
    housingPrices: 24,
    transactions: 12,
    inventory: 12,
    landAuctions: 24,
    policies: 12,
    gongdifang: 6,
  } as Record<string, number>,
};
