import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthService } from '../services/AuthService';
import { authenticate, optionalAuth, setAuthCookie, clearAuthCookie } from '../middleware/auth';
import { loginSchema, registerSchema } from '@report-gen/shared';

export const authRoutes = Router();
const authService = new AuthService();

authRoutes.post('/register', asyncHandler(async (req, res) => {
  const { username, password } = registerSchema.parse(req.body); // confirmPassword validated by schema refine
  const user = await authService.register(username, password);
  const token = authService.signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ success: true, data: user });
}));

authRoutes.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const user = await authService.login(username, password);
  const token = authService.signToken(user);
  setAuthCookie(res, token);
  res.json({ success: true, data: user });
}));

authRoutes.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, data: null });
});

authRoutes.get('/me', optionalAuth, (req, res) => {
  res.json({ success: true, data: req.user ?? null });
});
