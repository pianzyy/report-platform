import { ReportStatus, ReportDepth, PropertyType } from './enums';

export interface ReportSectionConfig {
  id: string;
  enabled: boolean;
  order: number;
}

export interface ReportConfig {
  title: string;
  cities: string[];
  propertyTypes: PropertyType[];
  sections: ReportSectionConfig[];
  depth: ReportDepth;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Report {
  id: string;
  title: string;
  status: ReportStatus;
  config: ReportConfig;
  content: ReportDocument | null;
  createdAt: string;
  updatedAt: string;
  generatedAt: string | null;
  errorMessage: string | null;
}

export interface TextBlock {
  type: 'heading' | 'paragraph' | 'bullet-list' | 'key-metric' | 'callout';
  level?: 1 | 2 | 3 | 4;
  content: string;
  items?: string[];
  metric?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'flat';
    change?: string;
  };
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend: 'up' | 'down' | 'flat';
  changePercent?: number;
  changeAbsolute?: string;
  context?: string;
}

export interface SectionOutput {
  sectionId: string;
  title: string;
  order: number;
  summary: string;
  textBlocks: TextBlock[];
  charts: ChartConfig[];
  metrics: Metric[];
  dataFreshness: 'fresh' | 'stale' | 'unavailable';
  dataSources: string[];
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar' | 'gauge';
  echartsOption: Record<string, unknown>;
  caption?: string;
  height?: number;
}

export interface ReportDocument {
  id: string;
  title: string;
  generatedAt: string;
  config: ReportConfig;
  executiveSummary: {
    text: string;
    keyMetrics: Metric[];
    recommendation: string;
  };
  sections: SectionOutput[];
  tableOfContents: TocItem[];
  disclaimer: string;
  dataFreshnessSummary: {
    overall: 'fresh' | 'stale' | 'unavailable';
    perSource: Record<string, 'fresh' | 'stale' | 'unavailable'>;
  };
}

export interface TocItem {
  id: string;
  title: string;
  level: number;
  pageNumber?: number;
}
