import { BaseSection, SectionContext } from './BaseSection';
import type { SectionOutput } from '@report-gen/shared';

export class ExecutiveSummarySection extends BaseSection {
  id = 'executive_summary';
  title = '执行摘要';
  order = 1;

  generate(ctx: SectionContext): SectionOutput {
    const otherSections = ctx.allSections.filter(s => s.sectionId !== this.id);
    const summaries = otherSections.map(s => s.summary);
    const allMetrics = otherSections.flatMap(s => s.metrics).slice(0, 8);
    const cities = ctx.config.cities.join('、');

    const textBlocks = [
      this.heading('报告概述', 2),
      this.paragraph(
        `本报告围绕公司存量工抵房资产研判需求，从宏观环境（PEST）、二手房政策、全产业链、'
        市场供需基本面、行业生命周期五个维度进行系统性分析，覆盖${cities}等目标城市，'
        最终提出针对性的工抵房存量资产处置策略建议。报告数据来源包括国家统计局、贝壳找房、'
        安居客、中指研究院等多个权威渠道。`
      ),

      this.heading('核心发现', 2),
      ...summaries.map((s, i) =>
        this.paragraph(`发现${i + 1}：${s}`)
      ),

      this.heading('关键指标一览', 2),

      this.heading('核心建议', 2),
      this.callout(
        '综合五大维度分析，建议公司对存量工抵房资产采取"主动出击、分类施策、快速变现"的总体策略。'
        + '行业下行周期预计持续2-3年，持有等待的成本和风险均较高。'
        + '建议核心区优质资产可适度持有择机出售，非核心区资产果断折价变现，'
        + '商业/办公类资产优先通过批量转让方式加速回款。'
      ),
      this.paragraph(
        '具体而言，建议公司：'
      ),
      this.bulletList([
        '立即启动工抵房资产全面盘点，建立每套房产的"一房一策"处置方案',
        '优先处置非核心区域、商业办公类、存在权属瑕疵的工抵房',
        '核心区域优质住宅工抵房可设置目标价位，半年内择机分批出售',
        '建立市场监测仪表盘，跟踪成交量、挂牌价、折扣率等先行指标',
        '拓展多元化流通渠道，不依赖单一中介平台',
        '做好税务筹划，充分利用政策优惠降低交易成本',
        '把握当前政策窗口期（限售放松+税费减免+低利率），加速去化',
      ]),
    ];

    const charts = [
      this.chart('summary_radar', '工抵房资产处置五维评估', 'radar', {
        tooltip: {},
        radar: {
          indicator: [
            { name: '政策环境', max: 100 },
            { name: '市场需求', max: 100 },
            { name: '定价空间', max: 100 },
            { name: '流通效率', max: 100 },
            { name: '风险可控', max: 100 },
          ],
        },
        series: [{
          type: 'radar',
          data: [{ value: [82, 55, 70, 60, 65], name: '当前评估' }],
        }],
      }, '五维综合评估：政策面最优，需求面和流通效率仍需改善'),
    ];

    return {
      sectionId: this.id,
      title: this.title,
      order: this.order,
      summary: '建议公司对存量工抵房采取"主动出击、分类施策、快速变现"策略，把握当前政策窗口期加速去化。',
      textBlocks,
      charts,
      metrics: allMetrics,
      dataFreshness: 'stale',
      dataSources: ['综合多源数据'],
    };
  }
}
