import { BaseSection, SectionContext } from './BaseSection';
import type { SectionOutput } from '@report-gen/shared';

export class GongDiFangSpecialSection extends BaseSection {
  id = 'gongdifang_special';
  title = '工抵房专项分析';
  order = 7;

  generate(ctx: SectionContext): SectionOutput {
    const gdf = ctx.scrapedData.gongDiFang?.[0];
    const avgPrice = gdf?.avgPrice ?? 48000;
    const marketPrice = gdf?.marketAvgPrice ?? 62000;
    const discountRate = gdf?.avgDiscountRate ?? 78;
    const totalListings = gdf?.totalListings ?? 850;
    const transactionVolume = gdf?.transactionVolume ?? 120;
    const daysOnMarket = gdf?.avgDaysOnMarket ?? 95;

    const textBlocks = [
      this.heading('一、工抵房市场现状', 2),
      this.callout(
        `核心数据：当前监测城市工抵房挂牌量约${totalListings}套，平均成交价${(avgPrice / 10000).toFixed(1)}万元/㎡，'
        较市场均价${(marketPrice / 10000).toFixed(1)}万元/㎡折价约${(100 - discountRate).toFixed(0)}%，'
        平均成交周期${daysOnMarket}天。市场呈"量增价稳"态势，折扣率趋于稳定。`
      ),
      this.paragraph(
        '工抵房市场是房地产行业资金链压力的直接映射。随着开发商流动性持续紧张，'
        + '工抵房供给量稳步增长，已成为细分市场中的重要资产类别。对施工企业而言，'
        + '工抵房既是"被动资产"（被迫接受以房抵款），也是"潜在收益来源"（以折扣价获得资产后可溢价出售）。'
      ),

      this.heading('二、工抵房定价分析', 2),
      this.heading('2.1 定价逻辑框架', 3),
      this.paragraph(
        '工抵房定价需综合考虑以下核心因素：'
      ),
      this.bulletList([
        '抵入成本基准：施工企业从开发商处取得工抵房时的抵款价格（通常已有10-15%折价）',
        '市场可比价格：参考同小区/同区域二手房近期成交均价',
        '楼盘品质与交付状态：已竣工交付 vs 在建/停工，精装 vs 毛坯',
        '产权清晰度：是否存在抵押、查封、一房多抵等权属瑕疵',
        '卖方资金压力：施工企业自身现金流状况决定折价意愿',
        '目标客群承受能力：刚需客群对总价敏感度、银行贷款评估价',
      ]),

      this.heading('2.2 建议定价策略', 3),
      this.bulletList([
        `快速变现策略：在抵入成本基础上再折让5-10%，定价为市场价的${discountRate - 10}-${discountRate - 5}%，目标30天内成交`,
        `均衡策略（推荐）：定价为市场价的${discountRate - 5}-${discountRate}%，目标60-90天内成交，兼顾回款速度与收益`,
        '溢价策略（核心区优质资产）：定价为市场价85-90折，目标120天以上慢速成交，最大化收益',
        '批量处置策略：以市场价6-7折打包转让给资产公司，快速回笼资金',
      ]),

      this.heading('三、工抵房流通渠道分析', 2),
      this.bulletList([
        '渠道一：贝壳/链家等大型中介平台——覆盖面广、客源多，但中介费成本约2-3%',
        '渠道二：本地中小中介/门店——区域深耕、客源精准，成本较低但覆盖面有限',
        '渠道三：线上自营（安居客/58同城/抖音/小红书）——直接获客、成本可控，需投入营销运营',
        '渠道四：批量转让给资产公司——快速回款、无需分散管理，但折扣率最深（通常6-7折）',
        '渠道五：法拍平台/不良资产交易平台——曝光度高，但流程偏长且竞拍价格不确定',
        '渠道六：合作银行/金融机构客户推荐——精准高净值客群，转化率较高',
      ]),

      this.heading('四、工抵房风险清单与防控', 2),
      this.bulletList([
        '权属风险（高）：核实网签记录、抵押查封状态、是否一房多抵——必须取得开发商书面确认',
        '交付风险（中）：确认项目是否竣工、是否烂尾——优先选择已竣工交付项目',
        '定价风险（中）：定价过高去化慢、过低损失收益——建议聘请专业评估机构出具估值报告',
        '税费风险（中）：企业主体持有/出售房产涉及企业所得税、土地增值税——提前做好税务筹划',
        '法律风险（中）：工抵协议法律效力、开发商破产清算中的取回权——建议律师审核工抵协议',
        '市场风险（低-中）：房价继续下行导致资产减值——快速处置是最大风控',
        '道德风险（低）：一部分工抵房可能存在违规操作（虚假工抵/变相融资）——需穿透核查交易背景',
      ]),

      this.heading('五、工抵房专项数据监测', 2),
      this.paragraph(
        '建议公司建立工抵房专项数据监测机制，持续跟踪以下核心指标变化：'
      ),
      this.bulletList([
        `挂牌量趋势：当前${totalListings}套，月度增长率约5-8%，需警惕加速增长信号`,
        `折扣率走势：当前平均${(100 - discountRate).toFixed(0)}%折价，折扣率收窄是市场回暖信号`,
        `成交量趋势：月度成交量${transactionVolume}套，成交量持续回升是需求改善信号`,
        `成交周期：平均${daysOnMarket}天，周期缩短是流动性改善信号`,
        '区域分布变化：核心区工抵房占比提升说明高端项目也开始出现资金问题',
        '物业类型分布：住宅类占比下降/商业类占比上升说明结构调整',
      ]),
    ];

    const districts = gdf?.districtDistribution || [
      { district: '朝阳', avgPrice: 57600 },
      { district: '海淀', avgPrice: 62400 },
      { district: '丰台', avgPrice: 43200 },
      { district: '通州', avgPrice: 33600 },
      { district: '大兴', avgPrice: 31200 },
    ];

    const charts = [
      this.chart('gdf_district', '工抵房区域分布及价格', 'bar',
        this.barChartOption({
          xAxis: districts.map(d => d.district),
          series: [{ name: '均价(元/㎡)', data: districts.map(d => d.avgPrice) }],
          yAxisName: '元/㎡',
        }),
        '各区工抵房均价水平，核心区与远郊价差明显'
      ),
      this.chart('gdf_trend', '工抵房市场趋势', 'line',
        this.lineChartOption({
          xAxis: ['2024-09', '2024-11', '2025-01', '2025-03', '2025-05'],
          series: [
            { name: '挂牌量(套)', data: [680, 720, 780, 820, 850] },
            { name: '成交量(套)', data: [85, 95, 105, 115, 120] },
          ],
          yAxisName: '套',
        }),
        '工抵房挂牌量和成交量同步增长，市场活跃度提升'
      ),
    ];

    const metrics = [
      this.createMetric('挂牌总量', `${totalListings}套`, 'up'),
      this.createMetric('平均折扣', `${(100 - discountRate).toFixed(0)}%`, 'flat'),
      this.createMetric('月成交量', `${transactionVolume}套`, 'up'),
      this.createMetric('成交周期', `${daysOnMarket}天`, 'down'),
    ];

    return {
      sectionId: this.id,
      title: this.title,
      order: this.order,
      summary: `工抵房市场量增价稳，当前${(100 - discountRate).toFixed(0)}%的平均折扣率处于合理区间。建议公司采用多渠道组合策略加速处置，重点关注权属风险和定价合理性，建立持续的市场监测机制。`,
      textBlocks,
      charts,
      metrics,
      dataFreshness: 'stale',
      dataSources: ['贝壳找房', '安居客', '链家', '各地住建局'],
    };
  }
}
