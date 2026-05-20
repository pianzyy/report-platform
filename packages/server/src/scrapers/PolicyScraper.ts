import { BaseScraper, FetchParams } from './BaseScraper';
import { PolicyCategory, SUPPORTED_CITIES } from '@report-gen/shared';
import type { PolicyData } from '@report-gen/shared';
import { v4 as uuidv4 } from 'uuid';

export class PolicyScraper extends BaseScraper {
  name = 'policy';

  protected async doScrape<T>(_params: FetchParams): Promise<T> {
    return this.generateDemoData<T>(_params);
  }

  protected generateDemoData<T>(params: FetchParams): T {
    const city = params.city;
    const cityInfo = city ? SUPPORTED_CITIES.find(c => c.code === city) : null;
    const cityName = cityInfo?.name || '全国';

    const policies: PolicyData[] = [
      {
        id: uuidv4(),
        title: `${cityName}关于优化房地产市场平稳健康发展若干措施的通知`,
        summary: `进一步放宽${cityName}二手房交易限制，缩短限售年限至2年，降低非普通住宅交易契税，支持居民改善性住房需求。`,
        publishDate: '2025-03-15',
        effectiveDate: '2025-04-01',
        issuingBody: city ? `${cityName}市住房和城乡建设局` : '住房和城乡建设部',
        category: PolicyCategory.TRANSACTION,
        city: cityName,
        tags: ['限售放松', '税费减免', '改善性需求'],
        impactLevel: 'high',
        impactDirection: 'positive',
        fullText: '',
        source: `${cityName}住建局官网`,
      },
      {
        id: uuidv4(),
        title: `关于调整${city ? cityName : '差别化'}住房信贷政策有关问题的通知`,
        summary: `下调首套房贷款利率下限至LPR-50BP，二套房贷款利率下限至LPR-20BP，降低居民购房融资成本。`,
        publishDate: '2025-02-20',
        effectiveDate: '2025-03-01',
        issuingBody: '中国人民银行',
        category: PolicyCategory.CREDIT,
        city: cityName,
        tags: ['房贷利率', '信贷宽松', '首付比例'],
        impactLevel: 'high',
        impactDirection: 'positive',
        fullText: '',
        source: '中国人民银行官网',
      },
      {
        id: uuidv4(),
        title: `${cityName}市存量房交易税收征管调整公告`,
        summary: `个人转让住房增值税征免年限由5年调整为2年，契税适用税率优惠政策扩大覆盖范围，进一步降低二手房交易成本。`,
        publishDate: '2025-01-10',
        effectiveDate: '2025-02-01',
        issuingBody: city ? `${cityName}市税务局` : '国家税务总局',
        category: PolicyCategory.TAX,
        city: cityName,
        tags: ['增值税', '契税', '个税', '交易成本'],
        impactLevel: 'high',
        impactDirection: 'positive',
        fullText: '',
        source: `${cityName}税务局官网`,
      },
      {
        id: uuidv4(),
        title: `关于进一步做好${cityName}房地产市场去库存工作的通知`,
        summary: `鼓励国有企业收购存量商品房用作保障性住房，支持房地产开发企业将存量房源转为租赁住房，推进工抵房规范化交易流程。`,
        publishDate: '2025-04-01',
        effectiveDate: '2025-04-15',
        issuingBody: city ? `${cityName}市住建局` : '住建部',
        category: PolicyCategory.DE_STOCK,
        city: cityName,
        tags: ['去库存', '保障房', '工抵房', '存量房收购'],
        impactLevel: 'high',
        impactDirection: 'positive',
        fullText: '',
        source: `${cityName}住建局官网`,
      },
      {
        id: uuidv4(),
        title: `关于加强工程款支付管理和规范工抵房交易的通知`,
        summary: `规范建设工程领域以房抵款行为，明确工抵房权属登记、二次交易流程及税费处理规则，保障施工企业合法权益，促进工抵房市场健康流通。`,
        publishDate: '2025-03-01',
        effectiveDate: '2025-03-15',
        issuingBody: '住建部',
        category: PolicyCategory.TRANSACTION,
        city: '全国',
        tags: ['工抵房', '权属登记', '交易流程', '工程款'],
        impactLevel: 'high',
        impactDirection: 'positive',
        fullText: '',
        source: '住建部官网',
      },
      {
        id: uuidv4(),
        title: `${cityName}市关于优化二手房交易流程的通知`,
        summary: `推进"带押过户"全面实施，简化二手房交易登记流程，压缩办理时限至5个工作日，降低二手房流通门槛。`,
        publishDate: '2024-12-01',
        effectiveDate: '2025-01-01',
        issuingBody: city ? `${cityName}市不动产登记中心` : '自然资源部',
        category: PolicyCategory.TRANSACTION,
        city: cityName,
        tags: ['带押过户', '登记流程', '二手房流通'],
        impactLevel: 'medium',
        impactDirection: 'positive',
        fullText: '',
        source: `${cityName}不动产登记中心`,
      },
    ];

    return policies as unknown as T;
  }
}
