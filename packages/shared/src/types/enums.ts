export enum ReportStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  ERROR = 'error',
}

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  GONG_DI_FANG = 'gongdifang',
  MIXED = 'mixed',
}

export enum ReportDepth {
  BRIEF = 'brief',
  STANDARD = 'standard',
  DEEP = 'deep',
}

export enum DataSource {
  STATS_GOV = 'statsgov',
  KE = 'ke',
  FANG = 'fang',
  ANJUKE = 'anjuke',
  POLICY = 'policy',
  GONG_DI_FANG = 'gongdifang',
}

export enum DataFreshness {
  FRESH = 'fresh',
  STALE = 'stale',
  UNAVAILABLE = 'unavailable',
}

export enum RefreshStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

export const ReportStatusLabel: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: '草稿',
  [ReportStatus.GENERATING]: '生成中',
  [ReportStatus.READY]: '已完成',
  [ReportStatus.ERROR]: '生成失败',
};

export const PropertyTypeLabel: Record<PropertyType, string> = {
  [PropertyType.RESIDENTIAL]: '住宅',
  [PropertyType.COMMERCIAL]: '商业',
  [PropertyType.OFFICE]: '办公',
  [PropertyType.GONG_DI_FANG]: '工抵房',
  [PropertyType.MIXED]: '综合',
};

export const ReportDepthLabel: Record<ReportDepth, string> = {
  [ReportDepth.BRIEF]: '简报',
  [ReportDepth.STANDARD]: '标准',
  [ReportDepth.DEEP]: '深度',
};

export const DataSourceLabel: Record<DataSource, string> = {
  [DataSource.STATS_GOV]: '国家统计局',
  [DataSource.KE]: '贝壳找房',
  [DataSource.FANG]: '房天下/中指研究院',
  [DataSource.ANJUKE]: '安居客',
  [DataSource.POLICY]: '政策公告',
  [DataSource.GONG_DI_FANG]: '工抵房专项',
};
