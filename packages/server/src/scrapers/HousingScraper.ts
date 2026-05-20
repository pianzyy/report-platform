import { BaseScraper, FetchParams } from './BaseScraper';
import { SUPPORTED_CITIES } from '@report-gen/shared';
import type { HousingPriceData, TransactionData, InventoryData } from '@report-gen/shared';

export class HousingPriceScraper extends BaseScraper {
  name = 'ke';

  protected async doScrape<T>(_params: FetchParams): Promise<T> {
    return this.generateDemoData<T>(_params);
  }

  protected generateDemoData<T>(params: FetchParams): T {
    const now = new Date();
    const city = params.city || 'beijing';
    const cityInfo = SUPPORTED_CITIES.find(c => c.code === city);
    const baseNew = cityInfo?.tier === 1 ? 65000 : cityInfo?.tier === 2 ? 28000 : 12000;
    const baseSecond = baseNew * 0.85;

    const data: HousingPriceData[] = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        city: cityInfo?.name || city,
        newHomePriceIndex: 100 + (i - 6) * 0.3,
        newHomePriceYoY: -2.5 + i * 0.2,
        newHomePriceMoM: -0.3 + Math.random() * 0.6,
        secondHandPriceIndex: 100 + (i - 6) * 0.2,
        secondHandPriceYoY: -4.8 + i * 0.4,
        secondHandPriceMoM: -0.5 + Math.random() * 0.8,
        period,
        source: '贝壳找房/国家统计局',
      };
    });

    return data as unknown as T;
  }
}

export class TransactionScraper extends BaseScraper {
  name = 'ke';

  protected async doScrape<T>(_params: FetchParams): Promise<T> {
    return this.generateDemoData<T>(_params);
  }

  protected generateDemoData<T>(params: FetchParams): T {
    const now = new Date();
    const city = params.city || 'beijing';
    const cityInfo = SUPPORTED_CITIES.find(c => c.code === city);
    const multiplier = cityInfo?.tier === 1 ? 1 : 0.35;

    const data: TransactionData[] = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const avgPrice = (cityInfo?.tier === 1 ? 62000 : 22000) * (1 + (i - 6) * 0.005);
      return {
        city: cityInfo?.name || city,
        period,
        newHomeTransactions: Math.floor((4500 + i * 80) * multiplier),
        newHomeTransactionArea: Math.floor((540000 + i * 10000) * multiplier),
        secondHandTransactions: Math.floor((12000 + i * 250) * multiplier),
        secondHandTransactionArea: Math.floor((1200000 + i * 25000) * multiplier),
        transactionValue: Math.floor((280 + i * 5) * multiplier * 1e8),
        avgPrice,
        avgPriceYoY: -3.5 + i * 0.3,
        source: '贝壳找房/各地住建局',
      };
    });

    return data as unknown as T;
  }
}

export class InventoryScraper extends BaseScraper {
  name = 'fang';

  protected async doScrape<T>(_params: FetchParams): Promise<T> {
    return this.generateDemoData<T>(_params);
  }

  protected generateDemoData<T>(params: FetchParams): T {
    const now = new Date();
    const city = params.city || 'beijing';
    const cityInfo = SUPPORTED_CITIES.find(c => c.code === city);

    const data: InventoryData[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        city: cityInfo?.name || city,
        period,
        newHomeInventory: Math.floor((85000 - i * 2000) * (cityInfo?.tier === 1 ? 1 : 0.4)),
        newHomeInventoryArea: Math.floor((10200000 - i * 250000) * (cityInfo?.tier === 1 ? 1 : 0.4)),
        secondHandListings: Math.floor((145000 + i * 3000) * (cityInfo?.tier === 1 ? 1 : 0.4)),
        absorptionRate: 0.65 - i * 0.02,
        deStockCycle: 18.5 - i * 0.5,
        vacancyRate: 12.5 + i * 0.3,
        source: '克尔瑞/中指研究院',
      };
    });

    return data as unknown as T;
  }
}
