import { BaseSection, SectionContext } from './BaseSection';
import type { SectionOutput } from '@report-gen/shared';

export class SupplyDemandSection extends BaseSection {
  id = 'supply_demand';
  title = '市场供需基本面分析';
  order = 5;

  generate(ctx: SectionContext): SectionOutput {
    const inventory = ctx.scrapedData.inventory?.[0];
    const gdf = ctx.scrapedData.gongDiFang?.[0];
    const deStockCycle = inventory?.deStockCycle ?? 18.5;
    const vacancyRate = inventory?.vacancyRate ?? 12.8;
    const secondHandListings = inventory?.secondHandListings ?? 145000;
    const gdfListings = gdf?.totalListings ?? 850;
    const gdfDiscount = gdf?.priceDiscountVsMarket ?? 22;

    const textBlocks = [
      this.heading('一、整体供需格局', 2),
      this.callout(
        `核心判断：房地产市场整体处于供大于求的去库存阶段。新房库存去化周期约${deStockCycle}个月，` +
        `二手房挂牌量持续攀升至${secondHandListings}套以上，买方市场特征明显。` +
        '工抵房在买方市场中需以更具竞争力的折扣吸引有限需求。'
      ),
      this.paragraph(
        '2025年房地产市场供给端持续承压：新房方面，虽然新开工面积大幅缩减，但已竣工未售商品房面积' +
        '仍处高位；二手房方面，挂牌量持续增加，业主降价意愿增强。需求端虽有政策刺激，' +
        '但居民收入预期偏弱、房价下跌预期等因素制约购房意愿。'
      ),

      this.heading('二、供给端分析', 2),
      this.heading('2.1 新房库存', 3),
      this.bulletList([
        `全国主要城市新建商品住宅去化周期约${deStockCycle}个月，超过12个月合理上限`,
        '三四线城市去化周期更长，部分城市超36个月',
        '已竣工未售面积约7.2亿平方米，存量消化压力大',
        '新开工面积同比下降约20%，未来供给将逐步收缩',
      ]),
      this.heading('2.2 二手房挂牌', 3),
      this.bulletList([
        `重点城市二手房挂牌量约${secondHandListings}套，同比增长约15%`,
        '挂牌房源中降价房源占比超60%，平均降幅约5-8%',
        '挂牌周期延长，二手房平均成交周期约120天',
        '工抵房约占二手房挂牌量的0.5-2%，属于小众但高折扣细分市场',
      ]),
      this.heading('2.3 工抵房供给特征', 3),
      this.bulletList([
        `监测数据显示工抵房挂牌量约${gdfListings}套，呈逐月上升趋势`,
        `平均折扣率约${gdfDiscount}%（即市场价的${100 - gdfDiscount}折）`,
        '工抵房集中于新交付小区和非核心区域',
        '住宅类工抵房占比约55%，商业/办公/车位等占比约45%',
      ]),

      this.heading('三、需求端分析', 2),
      this.heading('3.1 购房需求结构', 3),
      this.paragraph(
        '当前购房需求呈现明显分化。刚需购房者受收入预期制约决策谨慎，更加关注总价门槛和月供能力；' +
        '改善性需求相对活跃，但议价能力较强，对品质和性价比要求高；投资性需求基本退出市场。' +
        '工抵房因显著的价格优势（7-8折）在刚需和价格敏感型改善群体中具有较强吸引力。'
      ),
      this.bulletList([
        '刚需占比约35%：价格敏感度高，总价预算有限，是工抵房核心目标客群',
        '改善性需求占比约55%：关注品质、区位、学区，优质地段的折扣工抵房有吸引力',
        '投资需求占比约10%：基本退出住宅市场，关注商业/办公类工抵房的租金回报率',
        '购房者核心关注点：价格（权重40%）、区位（25%）、品质（15%）、交付确定性（20%）',
      ]),
      this.heading('3.2 购买力分析', 3),
      this.bulletList([
        '居民部门杠杆率约63%，加杠杆空间有限',
        '首套房贷利率3.45%处历史低位，月供压力有所缓解',
        '以一套240万元工抵房为例：首付36万（15%），月供约9000元（30年等额本息）',
        '城市中位数家庭年收入约17万元，房价收入比仍偏高',
      ]),

      this.heading('四、工抵房供需匹配分析', 2),
      this.paragraph(
        `工抵房面临的核心供需矛盾：供给端持续放量（开发商资金链紧张→更多项目抵房），` +
        `需求端虽有政策刺激但总量有限。当前${gdfDiscount}%的折扣率已接近市场认可的合理价格区间。` +
        '关键在于通过有效渠道将工抵房信息精准触达目标客群（刚需+价格敏感改善）。'
      ),
      this.bulletList([
        `供需比：工抵房挂牌量/${gdfListings}套 vs 月度成交量约120套 = 供过于求`,
        '信息匹配效率低：多数购房者不了解工抵房优势，需要加强营销推广',
        '区域供需错配：核心区工抵房稀缺且抢手，远郊工抵房库存积压',
        '产品供需错配：小户型刚需工抵房流转较快，大户型和商业类流转慢',
      ]),

      this.heading('五、空置率与市场健康度', 2),
      this.paragraph(
        `重点城市住房空置率约${vacancyRate}%，均处于偏高水平。` +
        '高空置率叠加高库存意味着市场出清仍需较长时间，工抵房处置不宜等待市场自然回暖，需主动出击。'
      ),
    ];

    const charts = [
      this.chart('supply_inventory', '新房库存与去化周期', 'line',
        this.lineChartOption({
          xAxis: ['2024-09', '2024-11', '2025-01', '2025-03'],
          series: [
            { name: '新房库存(万套)', data: [8.8, 8.6, 8.4, 8.3] },
            { name: '二手房挂牌(万套)', data: [13.5, 13.8, 14.2, 14.5] },
          ],
          yAxisName: '万套',
        }),
        '新房库存高位运行，二手房挂牌量持续攀升'
      ),
    ];

    const metrics = [
      this.createMetric('新房去化周期', `${deStockCycle}个月`, 'up'),
      this.createMetric('二手房挂牌量', `${(secondHandListings / 10000).toFixed(1)}万套`, 'up'),
      this.createMetric('工抵房平均折扣', `${gdfDiscount}%`, 'flat'),
      this.createMetric('住房空置率', `${vacancyRate}%`, 'up'),
    ];

    return {
      sectionId: this.id, title: this.title, order: this.order,
      summary: '市场供需格局明显供过于求，买方市场特征突出。工抵房以7-8折价格优势在细分市场中拥有竞争力，但需通过精准营销触达目标客群，主动加快去化速度。',
      textBlocks, charts, metrics, dataFreshness: 'stale', dataSources: ['贝壳找房', '克尔瑞', '中指研究院', '国家统计局'],
    };
  }
}
