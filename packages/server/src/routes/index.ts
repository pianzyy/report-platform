import { Router } from 'express';
import { reportRoutes } from './reports';
import { dataRoutes } from './data';
import { exportRoutes } from './export';
import { configRoutes } from './config';
import { systemRoutes } from './system';
import { authRoutes } from './auth';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/reports', reportRoutes);
routes.use('/data', dataRoutes);
routes.use('/reports', exportRoutes);
routes.use('/config', configRoutes);
routes.use('/system', systemRoutes);
