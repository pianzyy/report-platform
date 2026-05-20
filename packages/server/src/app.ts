import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter, generationLimiter } from './middleware/rateLimiter';
import { routes } from './routes';
import path from 'path';
import fs from 'fs';

if (!fs.existsSync(env.CACHE_DIR)) {
  fs.mkdirSync(env.CACHE_DIR, { recursive: true });
}

export function createApp() {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: env.CORS_ORIGIN || true,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

  app.use('/api/v1', apiLimiter, routes);
  app.use('/api/v1/reports/:id/generate', generationLimiter);
  app.use('/api/v1/reports/:id/export', generationLimiter);

  app.use(errorHandler);

  return app;
}
