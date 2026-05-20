import { CacheService } from '../services/CacheService';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export interface FetchParams {
  city?: string;
  dataType?: string;
  period?: string;
  [key: string]: string | undefined;
}

export abstract class BaseScraper {
  abstract name: string;
  protected cacheService: CacheService;
  protected retryCount = 3;
  protected retryDelay = 2000;
  protected requestDelay = 3000;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  async fetch<T>(params: FetchParams = {}): Promise<T> {
    const cacheKey = { ...params };
    const cached = await this.cacheService.get<T>(this.name, params.dataType || 'default', cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.scrapeWithRetry<T>(params);
      await this.cacheService.set(this.name, params.dataType || 'default', cacheKey, data);
      return data;
    } catch (err) {
      logger.warn({ err, scraper: this.name, params }, 'Scrape failed, using demo data');
      const demoData = this.generateDemoData<T>(params);
      await this.cacheService.set(this.name, params.dataType || 'default', cacheKey, demoData, 4);
      return demoData;
    }
  }

  private async scrapeWithRetry<T>(params: FetchParams): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.retryCount; attempt++) {
      try {
        if (attempt > 0) {
          await this.sleep(this.retryDelay * Math.pow(2, attempt));
        }
        return await this.doScrape<T>(params);
      } catch (err) {
        lastError = err as Error;
        logger.debug({ err, attempt, scraper: this.name }, 'Scrape attempt failed');
      }
    }
    throw lastError || new Error(`Failed to scrape after ${this.retryCount} attempts`);
  }

  protected abstract doScrape<T>(params: FetchParams): Promise<T>;
  protected abstract generateDemoData<T>(params: FetchParams): T;

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/json,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }
}
