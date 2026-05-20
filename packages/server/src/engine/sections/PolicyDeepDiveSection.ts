import { BaseSection, SectionContext } from './BaseSection';
import type { SectionOutput } from '@report-gen/shared';

export class PolicyDeepDiveSection extends BaseSection {
  id = 'policy_deep_dive';
  title = '二手房政策深度梳理';
  order = 3;

  generate(ctx: SectionContext): SectionOutput {
    const policies = ctx.scrapedData.policies || [];
    const cities = ctx.config.cities.join('、');

    const textBlocks = [
      this.heading('一、二手房交易流转政策全景', 2),
      this.callout(
        '核心判断：当前二手房政策环境处于近十年最宽松阶段，限售、税费、信贷、过户四大门槛全面降低，' +
        '为工抵房二手流转创造了历史性窗口期。'
      ),
      this.paragraph(
        `针对${cities}等重点城市，我们系统梳理了影响工抵房二手流转的关键政策维度。` +
        '工抵房本质上属于二手房流通范畴，其从施工企业到最终购房者的流转过程中，' +
        '涉及限售期限、交易税费、信贷条件、过户流程等核心政策环节。'
      ),

      this.heading('二、限售政策分析', 2),
      this.paragraph(
        '限售政策是影响工抵房流通速度的首要因素。工抵房从开发商过户至施工企业即触发首次登记，' +
        '此后的限售期内无法进行二次交易。当前主要城市限售政策已大幅放松：'
      ),
      this.bulletList([
        '多数城市限售年限由5年缩短至2年或完全取消',
        '部分城市实行"网签满2年"或"取证满1年"即可上市交易',
        '工抵房特殊通道：部分地区允许凭工程款结算协议提前解除限售',
        '法拍房、工抵房等特殊类型房产在部分城市不受限售政策约束',
      ]),
      this.paragraph(
        '影响评估：限售政策放松直接缩短了工抵房从取得到变现的时间周期，' +
        '对施工企业资金回笼极为有利。建议优先选择无限售或限售期已过的工抵房进行处置。'
      ),

      this.heading('三、交易税费政策分析', 2),
      this.paragraph(
        '二手房交易税费是影响工抵房实际收益率和买方购买意愿的关键因素。当前税费政策调整方向：'
      ),
      this.bulletList([
        '增值税：征免年限由5年调至2年，大幅降低次新房交易成本',
        '契税：首套140㎡以下1%，二套140㎡以下1%，优惠政策适用范围扩大',
        '个人所得税：按差额20%或全额1%核定征收，部分地区对"满五唯一"免征',
        '工抵房特殊考量：施工企业作为企业主体出售房产，可能涉及企业所得税、土地增值税',
        '部分地区对工抵房交易给予契税减免或财政补贴政策',
      ]),
      this.paragraph(
        '税负测算参考：以一套市场价300万元的工抵房（折后240万元）为例，买方需缴纳契税约2.4-3.6万元，' +
        '卖方（施工企业）涉及增值税约12万元（差额计税）、企业所得税约7万元。整体交易税费约占成交价的8-12%。'
      ),

      this.heading('四、信贷与金融政策分析', 2),
      this.bulletList([
        '首套房贷利率已降至LPR-50BP（约3.45%），为历史最低水平',
        '二套房贷利率降至LPR-20BP（约3.75%），改善性需求融资成本显著下降',
        '首付比例：首套最低15%，二套最低25%，大幅降低购房门槛',
        '"带押过户"全面推行：工抵房如存在按揭可直接过户，无需先解押',
        '部分银行推出工抵房专属贷款产品，认可折扣价作为贷款评估价',
      ]),
      this.paragraph(
        '对工抵房的直接影响：低利率+低首付大幅降低了购房者买入工抵房的门槛，' +
        '扩大了潜在买家群体。但需注意部分银行对工抵房贷款评估趋于保守，' +
        '可能按原值而非折扣价评估，影响贷款额度。建议与当地银行提前沟通贷款政策。'
      ),

      this.heading('五、过户登记流程分析', 2),
      this.bulletList([
        '"带押过户"已在全国推广，工抵房过户流程大幅简化',
        '不动产登记办理时限压缩至3-5个工作日',
        '工抵房"一房多抵"问题需在过户前核查抵押查封状态',
        '部分地区设立工抵房交易专窗，提供权属核验绿色通道',
        '网签即备案制度提升交易安全性',
      ]),

      this.heading('六、政策综合影响评估', 2),
      this.paragraph(
        '综合来看，当前政策环境对工抵房流转是全方位利好。限售放松缩短了变现周期，税费减免降低了交易成本，' +
        '信贷宽松扩大了买方群体，流程简化提升了流通效率。但需重点关注工抵房特有的政策风险：' +
        '权属清晰度（是否存在争议）、多重抵押风险、开发商配合度（过户需开发商配合）等。'
      ),
      this.callout(
        '政策窗口期判断：当前政策宽松力度已接近历史极值，进一步宽松空间有限。' +
        '建议在政策窗口期内加速工抵房处置，避免政策转向带来的不确定性风险。'
      ),
    ];

    const impactData = [
      { name: '高度利好', value: 4 },
      { name: '中度利好', value: 3 },
      { name: '中性', value: 1 },
      { name: '需关注风险', value: 2 },
    ];

    const charts = [
      this.chart('policy_impact', '政策影响分布', 'pie',
        this.pieChartOption(impactData),
        '各政策维度对工抵房流转的影响分布'
      ),
    ];

    const metrics = [
      this.createMetric('限售年限', '≤2年', 'down'),
      this.createMetric('首套房贷利率', '3.45%', 'down'),
      this.createMetric('首付最低比例', '15%', 'down'),
      this.createMetric('过户办理时限', '5天', 'down'),
    ];

    return {
      sectionId: this.id,
      title: this.title,
      order: this.order,
      summary: '当前二手房政策环境处历史最宽松时期，限售、税费、信贷、过户四大环节全面利好工抵房流转，建议把握政策窗口期加速处置。',
      textBlocks,
      charts,
      metrics,
      dataFreshness: 'stale',
      dataSources: ['住建部', '国家税务总局', '中国人民银行', '各地住建局'],
    };
  }
}
