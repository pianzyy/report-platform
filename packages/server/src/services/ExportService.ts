import { queryOne } from '../db';
import { logger } from '../utils/logger';
import type { ReportDocument } from '@report-gen/shared';

export class ExportService {
  async exportPDF(reportId: string): Promise<Buffer> {
    const report = queryOne('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (!report || !report.content) throw new Error('报告数据不存在');

    const document: ReportDocument = JSON.parse(report.content as string);
    const html = this.buildHTML(document);

    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: '<div style="font-size:10px;text-align:center;width:100%">第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页</div>',
      });

      await browser.close();
      return Buffer.from(pdf);
    } catch (err) {
      logger.warn({ err }, 'Puppeteer PDF failed, using simple HTML');
      return Buffer.from(html, 'utf-8');
    }
  }

  async exportCSV(reportId: string): Promise<string> {
    const report = queryOne('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (!report || !report.content) throw new Error('报告数据不存在');

    const document: ReportDocument = JSON.parse(report.content as string);
    const rows: string[] = ['章节,指标,数值,趋势'];

    for (const section of document.sections) {
      for (const metric of section.metrics) {
        rows.push(`${section.title},${metric.label},${metric.value}${metric.unit || ''},${metric.trend}`);
      }
    }

    return '﻿' + rows.join('\n');
  }

  private buildHTML(document: ReportDocument): string {
    const sectionsHTML = document.sections.map(s => {
      const blocksHTML = s.textBlocks.map(b => {
        switch (b.type) {
          case 'heading': return `<h${b.level || 2}>${b.content}</h${b.level || 2}>`;
          case 'paragraph': return `<p>${b.content}</p>`;
          case 'bullet-list': return `<ul>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
          case 'key-metric': return `<div class="metric"><strong>${b.metric?.value}</strong> ${b.metric?.label}</div>`;
          case 'callout': return `<blockquote>${b.content}</blockquote>`;
          default: return '';
        }
      }).join('\n');

      const metricsHTML = s.metrics.length > 0 ? `
        <div class="metrics">
          ${s.metrics.map(m => `
            <div class="metric-card">
              <div class="metric-value">${m.value}${m.unit || ''}</div>
              <div class="metric-label">${m.label}</div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `<section class="report-section"><h1>${s.title}</h1>${metricsHTML}${blocksHTML}</section>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${document.title}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: "Microsoft YaHei", "SimSun", sans-serif; font-size: 12pt; line-height: 1.8; color: #333; }
    h1 { font-size: 18pt; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-top: 24px; }
    h2 { font-size: 15pt; margin-top: 20px; }
    blockquote { background: #f0f7ff; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0; font-weight: bold; }
    ul { padding-left: 24px; } li { margin-bottom: 6px; }
    .metrics { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
    .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; min-width: 120px; text-align: center; }
    .metric-value { font-size: 18pt; font-weight: bold; color: #2563eb; }
    .metric-label { font-size: 9pt; color: #6b7280; margin-top: 4px; }
    .report-section { page-break-before: always; }
    .report-section:first-child { page-break-before: avoid; }
    .disclaimer { margin-top: 40px; padding: 16px; background: #f9fafb; font-size: 9pt; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="cover">
    <h1 style="font-size:24pt;text-align:center;margin-top:100px;">${document.title}</h1>
    <p style="text-align:center;color:#6b7280;">生成时间：${document.generatedAt}</p>
    <div style="margin-top:60px;"><h2>目录</h2><ol>${document.tableOfContents.map(t => `<li>${t.title}</li>`).join('')}</ol></div>
  </div>
  ${sectionsHTML}
  <div class="disclaimer">${document.disclaimer}</div>
</body>
</html>`;
  }
}
