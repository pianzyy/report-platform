import type { ReportDocument } from '@report-gen/shared';

export function renderReportHTML(document: ReportDocument): string {
  const sectionsHTML = document.sections.map(s => {
    const blocksHTML = s.textBlocks.map(b => {
      switch (b.type) {
        case 'heading':
          return `<h${b.level || 2}>${b.content}</h${b.level || 2}>`;
        case 'paragraph':
          return `<p>${b.content}</p>`;
        case 'bullet-list':
          return `<ul>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
        case 'key-metric':
          return `<div class="key-metric"><span class="metric-value">${b.metric?.value}</span><span class="metric-label">${b.metric?.label}</span></div>`;
        case 'callout':
          return `<blockquote class="callout">${b.content}</blockquote>`;
        default:
          return '';
      }
    }).join('\n');

    const chartDivs = s.charts.map(c =>
      `<div class="chart-container" id="chart-${c.id}" style="height:${c.height || 400}px;"></div>`
    ).join('\n');

    return `
      <section class="report-section" id="section-${s.sectionId}">
        <h2 class="section-title">${s.title}</h2>
        <div class="section-summary">${s.summary}</div>
        <div class="metrics-row">
          ${s.metrics.map(m => `
            <div class="metric-card">
              <div class="metric-value">${m.value}${m.unit || ''}</div>
              <div class="metric-label">${m.label}</div>
              <div class="metric-trend ${m.trend}">
                ${m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                ${m.changePercent !== undefined ? ` ${m.changePercent > 0 ? '+' : ''}${m.changePercent}%` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="section-content">${blocksHTML}</div>
        ${chartDivs}
        <div class="section-sources">
          数据来源：${s.dataSources.join('、')} | 数据时效：${s.dataFreshness}
        </div>
      </section>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "PingFang SC", sans-serif; line-height: 1.8; color: #1f2937; background: #fff; }
    .cover { text-align: center; padding: 80px 40px; page-break-after: always; }
    .cover h1 { font-size: 28px; margin-bottom: 16px; }
    .toc { margin: 40px auto; max-width: 400px; text-align: left; }
    .toc ol { padding-left: 24px; }
    .report-section { max-width: 900px; margin: 0 auto; padding: 40px 20px; border-bottom: 1px solid #e5e7eb; }
    .section-title { font-size: 22px; color: #1e40af; border-left: 4px solid #2563eb; padding-left: 12px; margin-bottom: 16px; }
    .section-summary { background: #f0f7ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #1e40af; }
    .metrics-row { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0; }
    .metric-card { flex: 1; min-width: 140px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: 700; color: #2563eb; }
    .metric-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .metric-trend { font-size: 12px; margin-top: 4px; }
    .metric-trend.up { color: #059669; }
    .metric-trend.down { color: #dc2626; }
    .metric-trend.flat { color: #6b7280; }
    h2 { font-size: 18px; margin: 24px 0 12px; color: #1f2937; }
    h3 { font-size: 16px; margin: 20px 0 8px; color: #374151; }
    p { margin: 10px 0; font-size: 14px; }
    ul { padding-left: 24px; margin: 10px 0; }
    li { margin: 6px 0; font-size: 14px; }
    blockquote.callout { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 20px 0; font-size: 14px; font-weight: 600; }
    .key-metric { display: inline-flex; align-items: baseline; gap: 8px; }
    .chart-container { margin: 20px 0; }
    .section-sources { font-size: 11px; color: #9ca3af; margin-top: 24px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
    .disclaimer { margin-top: 60px; padding: 20px; background: #f9fafb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print {
      .report-section { page-break-before: always; }
      .report-section:first-of-type { page-break-before: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${document.title}</h1>
    <p style="color:#6b7280;">生成时间：${new Date(document.generatedAt).toLocaleString('zh-CN')}</p>
    <p style="color:#6b7280;">数据状态：${document.dataFreshnessSummary.overall === 'fresh' ? '实时' : document.dataFreshnessSummary.overall === 'stale' ? '非实时' : '不可用'}</p>
    <div class="toc">
      <h2 style="text-align:left;">目录</h2>
      <ol>
        ${document.tableOfContents.map(t => `<li><a href="#section-${t.id}">${t.title}</a></li>`).join('')}
      </ol>
    </div>
  </div>
  ${sectionsHTML}
  <div class="disclaimer">${document.disclaimer}</div>
</body>
</html>`;
}
