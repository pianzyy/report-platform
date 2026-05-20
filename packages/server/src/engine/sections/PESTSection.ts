import { BaseSection, SectionContext } from './BaseSection';
import type { SectionOutput } from '@report-gen/shared';

export class PESTSection extends BaseSection {
  id = 'pest';
  title = '宏观环境PEST分析';
  order = 2;

  generate(ctx: SectionContext): SectionOutput {
    const macro = ctx.scrapedData.macro?.[0];
    const gdpGrowth = macro?.gdpGrowth ?? 5.2;
    const cpi = macro?.cpi ?? 0.3;
    const lpr5y = macro?.lpr5y ?? 3.95;
    const m2Growth = macro?.m2Growth ?? 9.5;
    const cities = ctx.config.cities.join('、');

    const textBlocks = [
      this.heading('一、政治环境分析（Political）', 2),
      this.paragraph(
        `2024-2025年，中国房地产政策呈现"先立后破、稳中求进"的总基调。` +
        `中央层面明确提出"适应房地产市场供求关系发生重大变化的新形势"，` +
        `政策重心从"防过热"全面转向"防过冷"。针对${cities}等重点城市，` +
        '地方政府密集出台需求端刺激政策，包括放松限购、降低首付比例及贷款利率、优化公积金使用条件等，形成了近年来最宽松的政策组合拳。'
      ),
      this.paragraph(
        '对于工抵房而言，政策环境整体利好流通：住建部明确规范工程款支付管理，各地陆续出台工抵房交易流程指引，' +
        '明确了工抵房的权属登记、二次交易规则及税费处理方案。保交楼政策的持续推进也为工抵房的交付确定性提供了保障。'
      ),
      this.bulletList([
        '中央层面：房住不炒+因城施策，给予地方更大自主权',
        '限购政策：多数城市已实质性取消或大幅放松限购',
        '信贷政策：首套房贷利率降至历史低位，首付比例最低15%',
        '工抵房专项：多地出台工抵房规范化交易流程，降低流通门槛',
        '"保交楼"专项借款持续推进，保障工抵房项目交付',
      ]),

      this.heading('二、经济环境分析（Economic）', 2),
      this.paragraph(
        `2025年一季度GDP增速约${gdpGrowth}%，经济运行总体平稳但内需不足问题仍存。` +
        `房地产投资持续负增长，对固定资产投资形成拖累。M2增速维持在${m2Growth}%左右，` +
        `流动性环境宽裕，但向房地产行业的信用传导仍受银行风险偏好下降制约。` +
        `CPI维持在${cpi}%低位，实际利率偏高抑制了购房需求。`
      ),
      this.paragraph(
        '对工抵房的影响：经济下行期开发商资金链压力加大，导致工抵房供给持续增加；' +
        '同时低利率环境降低了购房门槛，有利于工抵房以更具吸引力的折扣价格实现去化。' +
        '但居民收入预期偏弱，购房决策趋于谨慎，价格敏感度上升。'
      ),
      this.bulletList([
        `GDP增速约${gdpGrowth}%，经济处于弱复苏阶段`,
        `M2增速${m2Growth}%，流动性充裕但信用传导不畅`,
        `5年期LPR ${lpr5y}%，处历史低位`,
        '居民部门杠杆率接近上限，加杠杆空间有限',
        '房地产投资同比下降约9%，持续拖累固定资产投资',
      ]),

      this.heading('三、社会环境分析（Social）', 2),
      this.paragraph(
        '中国人口总量已进入负增长时代，2024年出生人口约900万，老龄化进程加速。' +
        '城镇化率接近67%，进入城镇化中后期，新增城镇人口带来的住房刚性需求边际递减。' +
        '居民住房需求结构正从"有没有"向"好不好"转变，改善性需求逐渐成为市场主导力量。' +
        '年轻一代购房观念发生变化，对租购并举接受度提高。'
      ),
      this.paragraph(
        '对工抵房的影响：刚需减弱意味着工抵房中的小户型、远郊项目的去化难度加大；' +
        '但工抵房的显著价格优势（通常为市场价7-8折）在价格敏感型购房者中具有较强吸引力。' +
        '改善性需求偏好品质和地段，核心区优质工抵房项目更受市场欢迎。'
      ),
      this.bulletList([
        '人口总量进入负增长，2024年出生人口约900万',
        '城镇化率约67%，进入中后期，增量需求放缓',
        '改善性需求占比超60%，成为市场主力',
        '年轻一代购房观念转变，对工抵房折扣价格敏感度高',
        '家庭小型化趋势持续，小户型仍有一定市场空间',
      ]),

      this.heading('四、技术环境分析（Technological）', 2),
      this.paragraph(
        '房地产科技（PropTech）加速渗透行业各环节。VR看房、AI估价、区块链权属登记、智能家居等技术' +
        '正在改变房地产交易方式和居住体验。贝壳找房、安居客等平台通过大数据分析提供精准市场行情，' +
        '大幅提升了市场透明度，为工抵房的合理定价和市场流通提供了技术支撑。'
      ),
      this.bulletList([
        'VR/AR看房技术普及，提升远程看房体验',
        'AI估价模型提升工抵房定价准确性',
        '区块链在不动产登记中的应用探索',
        '大数据平台提升二手房价透明度，利好工抵房定价参考',
        '线上交易平台降低工抵房流通信息不对称',
      ]),
    ];

    const months = ctx.scrapedData.macro?.map(d => d.period).slice(-12) || [];
    const gdpGrowthSeries = ctx.scrapedData.macro?.map(d => d.gdpGrowth).slice(-12) || [];
    const cpiSeries = ctx.scrapedData.macro?.map(d => d.cpi).slice(-12) || [];

    const charts = [
      this.chart('pest_macro', '宏观经济核心指标走势', 'line',
        this.lineChartOption({
          xAxis: months.length > 0 ? months : ['2024-06', '2024-08', '2024-10', '2024-12', '2025-02', '2025-04'],
          series: [
            { name: 'GDP增速(%)', data: gdpGrowthSeries.length > 0 ? gdpGrowthSeries : [5.3, 5.2, 5.1, 5.0, 5.1, 5.2] },
            { name: 'CPI(%)', data: cpiSeries.length > 0 ? cpiSeries : [0.2, 0.3, 0.1, 0.0, 0.3, 0.2] },
          ],
          yAxisName: '%',
        }),
        'GDP增速与CPI走势反映了宏观经济弱复苏态势，低通胀环境为货币政策宽松提供了空间。'
      ),
    ];

    const metrics = [
      this.createMetric('GDP增速', `${gdpGrowth}%`, 'flat', undefined, 0),
      this.createMetric('5年期LPR', `${lpr5y}%`, 'down', undefined, -0.25),
      this.createMetric('M2增速', `${m2Growth}%`, 'up', undefined, 0.3),
      this.createMetric('CPI', `${cpi}%`, 'flat'),
    ];

    return {
      sectionId: this.id,
      title: this.title,
      order: this.order,
      summary: `宏观环境总体呈"政策底+经济底"双底特征，政策面持续宽松利好房地产市场企稳。对工抵房而言，宽松的政策环境有利于降低交易成本、加快流通速度，但经济弱复苏背景下需以合理折扣吸引价格敏感型购房者。`,
      textBlocks,
      charts,
      metrics,
      dataFreshness: 'stale',
      dataSources: ['国家统计局', '中国人民银行', '住建部'],
    };
  }
}
