import { ReportDepth } from '../types/enums';
import type { ReportSectionConfig } from '../types/report';

export const ALL_SECTIONS: { id: string; title: string; description: string }[] = [
  { id: 'executive_summary', title: '执行摘要', description: '报告核心发现与资产处置建议摘要' },
  { id: 'pest', title: '宏观环境PEST分析', description: '政治、经济、社会、技术四大维度宏观研判' },
  { id: 'policy_deep_dive', title: '二手房政策深度梳理', description: '限售、税费、信贷、过户等配套政策分析' },
  { id: 'industry_chain', title: '房地产全产业链分析', description: '上中下游产业布局及工抵房定位' },
  { id: 'supply_demand', title: '市场供需基本面分析', description: '新房库存、二手房挂牌、去化周期、空置率' },
  { id: 'lifecycle', title: '行业生命周期研判', description: '发展阶段判定及中长周期趋势预判' },
  { id: 'gongdifang_special', title: '工抵房专项分析', description: '工抵房市场行情、定价、流通渠道专项研究' },
  { id: 'disposal_strategy', title: '资产处置策略建议', description: '基于四维分析的最优处置方案与执行路径' },
];

export function getDefaultSections(depth: ReportDepth): ReportSectionConfig[] {
  switch (depth) {
    case ReportDepth.BRIEF:
      return [
        { id: 'executive_summary', enabled: true, order: 1 },
        { id: 'pest', enabled: true, order: 2 },
        { id: 'supply_demand', enabled: true, order: 3 },
        { id: 'disposal_strategy', enabled: true, order: 4 },
        { id: 'policy_deep_dive', enabled: false, order: 5 },
        { id: 'industry_chain', enabled: false, order: 6 },
        { id: 'lifecycle', enabled: false, order: 7 },
        { id: 'gongdifang_special', enabled: false, order: 8 },
      ];
    case ReportDepth.STANDARD:
      return [
        { id: 'executive_summary', enabled: true, order: 1 },
        { id: 'pest', enabled: true, order: 2 },
        { id: 'policy_deep_dive', enabled: true, order: 3 },
        { id: 'industry_chain', enabled: true, order: 4 },
        { id: 'supply_demand', enabled: true, order: 5 },
        { id: 'lifecycle', enabled: true, order: 6 },
        { id: 'gongdifang_special', enabled: true, order: 7 },
        { id: 'disposal_strategy', enabled: true, order: 8 },
      ];
    case ReportDepth.DEEP:
      return ALL_SECTIONS.map((s, i) => ({ id: s.id, enabled: true, order: i + 1 }));
  }
}

export const DEFAULT_DATE_RANGE_MONTHS = 12;
