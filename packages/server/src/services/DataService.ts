import { CacheService } from './CacheService';
import { MacroScraper, HousingPriceScraper, TransactionScraper, InventoryScraper, PolicyScraper, GongDiFangScraper } from '../scrapers';
import { queryAll, queryOne, execute } from '../db';
import { logger } from '../utils/logger';
import { DataSource } from '@report-gen/shared';
import { DEFAULT_CITIES } from '@report-gen/shared';
import type { MacroData, HousingPriceData, TransactionData, InventoryData, PolicyData, GongDiFangData, DataSourceStatus, ScrapedData } from '@report-gen/shared';

export class DataService {
  private cacheService: CacheService;
  private macroScraper: MacroScraper;
  private housingPriceScraper: HousingPriceScraper;
  private transactionScraper: TransactionScraper;
  private inventoryScraper: InventoryScraper;
  private policyScraper: PolicyScraper;
  private gongDiFangScraper: GongDiFangScraper;

  constructor() {
    this.cacheService = new CacheService();
    this.macroScraper = new MacroScraper(this.cacheService);
    this.housingPriceScraper = new HousingPriceScraper(this.cacheService);
    this.transactionScraper = new TransactionScraper(this.cacheService);
    this.inventoryScraper = new InventoryScraper(this.cacheService);
    this.policyScraper = new PolicyScraper(this.cacheService);
    this.gongDiFangScraper = new GongDiFangScraper(this.cacheService);
  }

  async fetchAllData(cities: string[], forceRefresh = false): Promise<ScrapedData> {
    if (forceRefresh) {
      this.cacheService.invalidate();
    }

    const [macro, housingPrices, transactions, inventory, policies, gongDiFang] = await Promise.all([
      this.macroScraper.fetch<MacroData[]>({ dataType: 'macro' }),
      Promise.all(cities.map(city =>
        this.housingPriceScraper.fetch<HousingPriceData[]>({ city, dataType: 'housingPrices' })
      )).then(arr => arr.flat()),
      Promise.all(cities.map(city =>
        this.transactionScraper.fetch<TransactionData[]>({ city, dataType: 'transactions' })
      )).then(arr => arr.flat()),
      Promise.all(cities.map(city =>
        this.inventoryScraper.fetch<InventoryData[]>({ city, dataType: 'inventory' })
      )).then(arr => arr.flat()),
      Promise.all(cities.map(city =>
        this.policyScraper.fetch<PolicyData[]>({ city, dataType: 'policies' })
      )).then(arr => arr.flat()),
      Promise.all(cities.map(city =>
        this.gongDiFangScraper.fetch<GongDiFangData[]>({ city, dataType: 'gongdifang' })
      )).then(arr => arr.flat()),
    ]);

    return { macro, housingPrices, transactions, inventory, policies, gongDiFang };
  }

  async refreshData(sources?: string[], force = false): Promise<{ source: string; status: string; recordsUpdated: number; error?: string }[]> {
    const targetSources = sources || Object.values(DataSource);
    const results = [];

    for (const source of targetSources) {
      const startedAt = new Date().toISOString();

      try {
        if (force) this.cacheService.invalidate(source);

        let recordsUpdated = 0;
        switch (source) {
          case DataSource.STATS_GOV:
            await this.macroScraper.fetch({ dataType: 'macro' });
            recordsUpdated = 8;
            break;
          case DataSource.KE:
            await Promise.all(
              DEFAULT_CITIES.flatMap(city => [
                this.housingPriceScraper.fetch({ city, dataType: 'housingPrices' }),
                this.transactionScraper.fetch({ city, dataType: 'transactions' }),
              ])
            );
            recordsUpdated = DEFAULT_CITIES.length * 24;
            break;
          case DataSource.FANG:
            await Promise.all(
              DEFAULT_CITIES.map(city =>
                this.inventoryScraper.fetch({ city, dataType: 'inventory' })
              )
            );
            recordsUpdated = DEFAULT_CITIES.length * 6;
            break;
          case DataSource.ANJUKE:
            // No scraper available for Anjuke - records stay as 0
            break;
          case DataSource.POLICY:
            await Promise.all(
              DEFAULT_CITIES.map(city =>
                this.policyScraper.fetch({ city, dataType: 'policies' })
              )
            );
            recordsUpdated = DEFAULT_CITIES.length * 6;
            break;
          case DataSource.GONG_DI_FANG:
            await Promise.all(
              DEFAULT_CITIES.map(city =>
                this.gongDiFangScraper.fetch({ city, dataType: 'gongdifang' })
              )
            );
            recordsUpdated = DEFAULT_CITIES.length * 6;
            break;
        }

        execute(
          'INSERT INTO refresh_history (source, status, started_at, completed_at, records_updated) VALUES (?, ?, ?, ?, ?)',
          [source, 'success', startedAt, new Date().toISOString(), recordsUpdated]
        );

        results.push({ source, status: 'success', recordsUpdated });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        execute(
          'INSERT INTO refresh_history (source, status, started_at, completed_at, records_updated, error_message) VALUES (?, ?, ?, ?, ?, ?)',
          [source, 'failed', startedAt, new Date().toISOString(), 0, message]
        );
        results.push({ source, status: 'failed', recordsUpdated: 0, error: message });
      }
    }

    return results;
  }

  async getSourceStatuses(): Promise<DataSourceStatus[]> {
    const sources = [
      { name: DataSource.STATS_GOV, label: '国家统计局' },
      { name: DataSource.KE, label: '贝壳找房' },
      { name: DataSource.FANG, label: '房天下/中指研究院' },
      { name: DataSource.ANJUKE, label: '安居客' },
      { name: DataSource.POLICY, label: '政策公告' },
      { name: DataSource.GONG_DI_FANG, label: '工抵房专项' },
    ];

    return sources.map(s => {
      const lastCache = queryOne<{ fetched_at: string; count: number }>(
        'SELECT MAX(fetched_at) as fetched_at, COUNT(*) as count FROM data_cache WHERE source = ? AND is_valid = 1',
        [s.name]
      );

      const lastRefresh = queryOne<{ started_at: string; status: string }>(
        'SELECT started_at, status FROM refresh_history WHERE source = ? ORDER BY started_at DESC LIMIT 1', [s.name]
      );

      const freshness = lastCache?.count
        ? (new Date(lastCache.fetched_at).getTime() > Date.now() - 12 * 3600 * 1000 ? 'fresh' : 'stale')
        : 'unavailable';

      return {
        name: s.name,
        label: s.label,
        status: freshness === 'fresh' ? 'online' : freshness === 'stale' ? 'degraded' : 'offline',
        lastFetchAt: lastCache?.fetched_at ?? null,
        recordCount: lastCache?.count ?? 0,
        freshness,
        nextRefreshAt: null,
      };
    });
  }

  async getRefreshHistory(limit = 20) {
    const rows = queryAll('SELECT * FROM refresh_history ORDER BY started_at DESC LIMIT ?', [limit]);
    return rows.map(r => ({
      id: (r as Record<string, unknown>).id,
      source: (r as Record<string, unknown>).source,
      status: (r as Record<string, unknown>).status,
      startedAt: (r as Record<string, unknown>).started_at,
      completedAt: (r as Record<string, unknown>).completed_at,
      recordsUpdated: (r as Record<string, unknown>).records_updated,
      errorMessage: (r as Record<string, unknown>).error_message,
    }));
  }

  async getCachedData(sourceName: string, dataType?: string, limit = 50) {
    let sql = 'SELECT * FROM data_cache WHERE source = ?';
    const params: unknown[] = [sourceName];
    if (dataType) { sql += ' AND data_type = ?'; params.push(dataType); }
    sql += ' ORDER BY fetched_at DESC LIMIT ?';
    params.push(limit);
    return queryAll(sql, params);
  }

  async getMacroData() { return this.macroScraper.fetch<MacroData[]>({ dataType: 'macro' }); }
  async getHousingPrices(city?: string) { return this.housingPriceScraper.fetch<HousingPriceData[]>({ city, dataType: 'housingPrices' }); }
  async getTransactions(city?: string) { return this.transactionScraper.fetch<TransactionData[]>({ city, dataType: 'transactions' }); }
  async getInventory(city?: string) { return this.inventoryScraper.fetch<InventoryData[]>({ city, dataType: 'inventory' }); }
  async getPolicies(city?: string) { return this.policyScraper.fetch<PolicyData[]>({ city, dataType: 'policies' }); }
  async getGongDiFangData(city?: string) { return this.gongDiFangScraper.fetch<GongDiFangData[]>({ city, dataType: 'gongdifang' }); }
}
