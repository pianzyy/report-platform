import { BaseScraper, FetchParams } from './BaseScraper';
import { SUPPORTED_CITIES } from '@report-gen/shared';
import type { GongDiFangData } from '@report-gen/shared';

export class GongDiFangScraper extends BaseScraper {
  name = 'gongdifang';

  protected async doScrape<T>(_params: FetchParams): Promise<T> {
    return this.generateDemoData<T>(_params);
  }

  protected generateDemoData<T>(params: FetchParams): T {
    const now = new Date();
    const city = params.city || 'beijing';
    const cityInfo = SUPPORTED_CITIES.find(c => c.code === city);
    const marketPrice = cityInfo?.tier === 1 ? 62000 : 22000;
    const discountRate = cityInfo?.tier === 1 ? 0.78 : 0.72;

    const data: GongDiFangData[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (5 - i));
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const avgDiscount = discountRate + (i - 3) * 0.01;
      const gdfPrice = marketPrice * avgDiscount;

      return {
        city: cityInfo?.name || city,
        period,
        totalListings: Math.floor((850 + i * 45) * (cityInfo?.tier === 1 ? 1 : 0.3)),
        avgDiscountRate: avgDiscount * 100,
        priceDiscountVsMarket: (1 - avgDiscount) * 100,
        avgPrice: Math.floor(gdfPrice),
        marketAvgPrice: Math.floor(marketPrice * (1 + (i - 3) * 0.005)),
        propertyTypes: [
          { type: '住宅', count: Math.floor(480 + i * 30), avgDiscount: avgDiscount },
          { type: '商业', count: Math.floor(200 + i * 10), avgDiscount: avgDiscount - 0.05 },
          { type: '办公', count: Math.floor(120 + i * 5), avgDiscount: avgDiscount - 0.08 },
          { type: '车位', count: Math.floor(50 + i * 2), avgDiscount: avgDiscount - 0.02 },
        ],
        districtDistribution: [
          { district: '朝阳区', count: 150, avgPrice: Math.floor(gdfPrice * 1.2) },
          { district: '海淀区', count: 120, avgPrice: Math.floor(gdfPrice * 1.3) },
          { district: '丰台区', count: 100, avgPrice: Math.floor(gdfPrice * 0.9) },
          { district: '通州区', count: 90, avgPrice: Math.floor(gdfPrice * 0.7) },
          { district: '大兴区', count: 80, avgPrice: Math.floor(gdfPrice * 0.65) },
          { district: '其他区域', count: 310, avgPrice: Math.floor(gdfPrice * 0.6) },
        ],
        avgDaysOnMarket: 95 - i * 5,
        transactionVolume: Math.floor((120 + i * 10) * (cityInfo?.tier === 1 ? 1 : 0.3)),
        source: '贝壳找房/安居客/链家',
      };
    });

    return data as unknown as T;
  }
}
