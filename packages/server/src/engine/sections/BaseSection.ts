import type { SectionOutput, TextBlock, Metric, ChartConfig, ScrapedData, ReportConfig } from '@report-gen/shared';

export interface SectionContext {
  scrapedData: ScrapedData;
  config: ReportConfig;
  allSections: SectionOutput[];
}

export abstract class BaseSection {
  abstract id: string;
  abstract title: string;
  abstract order: number;

  abstract generate(context: SectionContext): SectionOutput;

  protected createMetric(
    label: string,
    value: string,
    trend: 'up' | 'down' | 'flat' = 'flat',
    unit?: string,
    changePercent?: number,
  ): Metric {
    return {
      id: `${this.id}_metric_${label}`,
      label,
      value,
      unit,
      trend,
      changePercent,
    };
  }

  protected heading(text: string, level: 1 | 2 | 3 | 4 = 2): TextBlock {
    return { type: 'heading', level, content: text };
  }

  protected paragraph(...texts: string[]): TextBlock {
    return { type: 'paragraph', content: texts.join('') };
  }

  protected bulletList(items: string[]): TextBlock {
    return { type: 'bullet-list', content: '', items };
  }

  protected keyMetric(value: string, label: string, trend?: 'up' | 'down' | 'flat', change?: string): TextBlock {
    return { type: 'key-metric', content: '', metric: { value, label, trend, change } };
  }

  protected callout(...texts: string[]): TextBlock {
    return { type: 'callout', content: texts.join('') };
  }

  protected chart(id: string, title: string, type: ChartConfig['type'], echartsOption: Record<string, unknown>, caption?: string, height?: number): ChartConfig {
    return { id, title, type, echartsOption, caption, height };
  }

  protected lineChartOption(data: { xAxis: string[]; series: { name: string; data: number[] }[]; yAxisName?: string }): Record<string, unknown> {
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: data.series.map(s => s.name), bottom: 0 },
      xAxis: { type: 'category', data: data.xAxis },
      yAxis: { type: 'value', name: data.yAxisName || '' },
      series: data.series.map(s => ({ name: s.name, type: 'line', data: s.data, smooth: true })),
    };
  }

  protected barChartOption(data: { xAxis: string[]; series: { name: string; data: number[] }[]; yAxisName?: string }): Record<string, unknown> {
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: data.series.map(s => s.name), bottom: 0 },
      xAxis: { type: 'category', data: data.xAxis, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value', name: data.yAxisName || '' },
      series: data.series.map(s => ({ name: s.name, type: 'bar', data: s.data })),
    };
  }

  protected pieChartOption(data: { name: string; value: number }[]): Record<string, unknown> {
    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data,
        label: { show: true, formatter: '{b}\n{d}%' },
      }],
    };
  }
}
