import type { ReportDocument, SectionOutput, ReportConfig, TocItem } from '@report-gen/shared';

export function assembleReport(
  id: string,
  config: ReportConfig,
  sections: SectionOutput[],
  generatedAt: string,
): ReportDocument {
  const sorted = sections
    .filter(s => config.sections.find(cs => cs.id === s.sectionId)?.enabled !== false)
    .sort((a, b) => a.order - b.order);

  const execSummary = sorted.find(s => s.sectionId === 'executive_summary');
  const otherSections = sorted.filter(s => s.sectionId !== 'executive_summary');

  const allKeyMetrics = sorted.flatMap(s => s.metrics);

  const tableOfContents: TocItem[] = sorted.map(s => ({
    id: s.sectionId,
    title: s.title,
    level: 1,
  }));

  const freshnessMap: Record<string, 'fresh' | 'stale' | 'unavailable'> = {};
  const allSources = new Set<string>();
  for (const s of sorted) {
    for (const src of s.dataSources) {
      allSources.add(src);
    }
    freshnessMap[s.sectionId] = s.dataFreshness;
  }

  const overallFreshness =
    sorted.every(s => s.dataFreshness === 'fresh') ? 'fresh' :
    sorted.some(s => s.dataFreshness === 'unavailable') ? 'unavailable' :
    'stale';

  return {
    id,
    title: config.title,
    generatedAt,
    config,
    executiveSummary: {
      text: execSummary?.summary || '报告生成完成，请查看各章节详细分析。',
      keyMetrics: allKeyMetrics.slice(0, 8),
      recommendation: execSummary?.textBlocks.find(b => b.type === 'callout')?.content
        || '建议把握当前政策窗口期，分类施策，加速工抵房资产处置。',
    },
    sections: sorted,
    tableOfContents,
    disclaimer: '本报告基于公开数据和行业研究方法生成，数据来源于国家统计局、贝壳找房、中指研究院等公开渠道。'
      + '报告中的分析判断和策略建议仅供参考，不构成投资建议或法律意见。公司应根据自身实际情况和专业人士意见做出最终决策。'
      + `报告生成时间：${generatedAt}。`,
    dataFreshnessSummary: {
      overall: overallFreshness,
      perSource: freshnessMap,
    },
  };
}
