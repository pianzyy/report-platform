import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string };
    }
  }
}

const authService = new AuthService();

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('auth_token', { path: '/' });
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token;
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', '请先登录');
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch {
    throw new AppError(401, 'TOKEN_INVALID', '登录已过期，请重新登录');
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.auth_token;
  if (!token) {
    next();
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = { id: payload.id, username: payload.username };
  } catch {
    // Token invalid — continue without user
  }
  next();
}
