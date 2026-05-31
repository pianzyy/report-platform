import { LRUCache } from 'lru-cache';
import { queryOne, queryAll, execute } from '../db';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class CacheService {
  private l1Cache: LRUCache<string, unknown>;

  constructor() {
    this.l1Cache = new LRUCache<string, unknown>({
      max: 500,
      ttl: 5 * 60 * 1000,
    });
  }

  private buildKey(source: string, dataType: string, params: Record<string, string> = {}): string {
    return `${source}:${dataType}:${JSON.stringify(params)}`;
  }

  async get<T>(source: string, dataType: string, params: Record<string, string> = {}): Promise<T | null> {
    const key = this.buildKey(source, dataType, params);

    // L1: Memory cache
    const l1Result = this.l1Cache.get(key);
    if (l1Result !== undefined) {
      logger.debug({ key }, 'L1 cache hit');
      return l1Result as T;
    }

    // L2: SQLite cache
    try {
      const row = queryOne(
        'SELECT * FROM data_cache WHERE source = ? AND data_type = ? AND query_params = ? AND is_valid = 1',
        [source, dataType, JSON.stringify(params)]
      );

      if (row) {
        const now = new Date().toISOString();
        const data = JSON.parse(row.data as string) as T;
        if ((row.expires_at as string) > now) {
          this.l1Cache.set(key, data);
          logger.debug({ key }, 'L2 cache hit');
          return data;
        }
        // Stale but still return
        logger.debug({ key, expiresAt: row.expires_at }, 'L2 cache stale');
        this.l1Cache.set(key, data);
        return data;
      }
    } catch (err) {
      logger.warn({ err, key }, 'L2 cache read failed');
    }

    // L3: File cache (fallback)
    try {
      const fileName = `${source}_${dataType}_${this.safeFileName(JSON.stringify(params))}.json`;
      const filePath = path.join(env.CACHE_DIR, fileName);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const cached = JSON.parse(raw);
        this.l1Cache.set(key, cached.data);
        return cached.data as T;
      }
    } catch (err) {
      logger.warn({ err, key }, 'L3 cache read failed');
    }

    return null;
  }

  async set(source: string, dataType: string, params: Record<string, string>, data: unknown, ttlHours?: number): Promise<void> {
    const key = this.buildKey(source, dataType, params);
    const now = new Date();
    const ttl = ttlHours ?? env.DATA_FRESHNESS_THRESHOLD_HOURS[dataType] ?? 12;

    // L1
    this.l1Cache.set(key, data);

    // L2
    try {
      const existing = queryOne<{ id: number }>(
        'SELECT id FROM data_cache WHERE source = ? AND data_type = ? AND query_params = ?',
        [source, dataType, JSON.stringify(params)]
      );

      if (existing) {
        execute(
          `UPDATE data_cache SET data = ?, fetched_at = ?, expires_at = ?, is_valid = 1 WHERE id = ?`,
          [JSON.stringify(data), now.toISOString(), new Date(now.getTime() + ttl * 3600 * 1000).toISOString(), existing.id]
        );
      } else {
        execute(
          `INSERT INTO data_cache (source, data_type, query_params, data, fetched_at, expires_at, is_valid) VALUES (?, ?, ?, ?, ?, ?, 1)`,
          [source, dataType, JSON.stringify(params), JSON.stringify(data), now.toISOString(), new Date(now.getTime() + ttl * 3600 * 1000).toISOString()]
        );
      }
    } catch (err) {
      logger.warn({ err, key }, 'L2 cache write failed');
    }

    // L3
    try {
      const fileName = `${source}_${dataType}_${this.safeFileName(JSON.stringify(params))}.json`;
      const filePath = path.join(env.CACHE_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify({ data, cachedAt: now.toISOString() }, null, 2));
    } catch (err) {
      logger.warn({ err, key }, 'L3 cache write failed');
    }
  }

  invalidate(source?: string, dataType?: string): void {
    if (source) {
      for (const key of this.l1Cache.keys()) {
        if (key.startsWith(`${source}:`)) this.l1Cache.delete(key);
      }
      try {
        const conditions = ['is_valid = 1'];
        const params: string[] = [];
        if (source) { conditions.push('source = ?'); params.push(source); }
        if (dataType) { conditions.push('data_type = ?'); params.push(dataType); }
        execute(`UPDATE data_cache SET is_valid = 0 WHERE ${conditions.join(' AND ')}`, params);
      } catch (err) {
        logger.warn({ err }, 'Cache invalidation failed');
      }

      // L3: Delete file cache
      try {
        const prefix = `${source}_${dataType || ''}`;
        const files = fs.readdirSync(env.CACHE_DIR);
        for (const file of files) {
          if (file.startsWith(prefix)) {
            fs.unlinkSync(path.join(env.CACHE_DIR, file));
          }
        }
      } catch (err) {
        logger.warn({ err }, 'L3 cache invalidation failed');
      }
    } else {
      this.l1Cache.clear();
      try {
        execute('UPDATE data_cache SET is_valid = 0');
      } catch (err) {
        logger.warn({ err }, 'Full cache invalidation failed');
      }

      // L3: Delete all file cache
      try {
        const files = fs.readdirSync(env.CACHE_DIR);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(env.CACHE_DIR, file));
          }
        }
      } catch (err) {
        logger.warn({ err }, 'L3 full cache invalidation failed');
      }
    }
  }

  cleanup(): void {
    try {
      const now = new Date().toISOString();
      execute('DELETE FROM data_cache WHERE is_valid = 0 AND expires_at <= ?', [now]);
    } catch (err) {
      logger.warn({ err }, 'Cache cleanup failed');
    }
  }

  private safeFileName(str: string): string {
    return str.replace(/[^a-zA-Z0-9一-鿿_-]/g, '_').substring(0, 100);
  }
}
