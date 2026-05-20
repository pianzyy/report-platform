import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../db';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import type { User } from '@report-gen/shared';

const SALT_ROUNDS = 10;

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    createdAt: row.created_at as string,
  };
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  signToken(user: User): string {
    return jwt.sign(
      { id: user.id, username: user.username },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { id: string; username: string } {
    return jwt.verify(token, env.JWT_SECRET) as { id: string; username: string };
  }

  async register(username: string, password: string): Promise<User> {
    const existing = queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      throw new AppError(409, 'USERNAME_TAKEN', '用户名已被注册');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = await this.hashPassword(password);

    execute(
      'INSERT INTO users (id, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, username, passwordHash, now, now]
    );

    return { id, username, createdAt: now };
  }

  async login(username: string, password: string): Promise<User> {
    const row = queryOne('SELECT * FROM users WHERE username = ?', [username]);
    if (!row) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '用户名或密码错误');
    }

    const valid = await this.verifyPassword(password, row.password_hash as string);
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '用户名或密码错误');
    }

    return rowToUser(row as Record<string, unknown>);
  }

  getUserById(id: string): User | null {
    const row = queryOne('SELECT * FROM users WHERE id = ?', [id]);
    if (!row) return null;
    return rowToUser(row as Record<string, unknown>);
  }
}
