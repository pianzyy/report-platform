export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    dataFreshness?: 'fresh' | 'stale' | 'unavailable';
    generatedAt?: string;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportListParams extends PaginationParams {
  status?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GenerateReportRequest {
  forceRefresh?: boolean;
}

export interface RefreshDataRequest {
  sources?: string[];
  force?: boolean;
}

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface DataSourceStatus {
  name: string;
  label: string;
  status: 'online' | 'degraded' | 'offline';
  lastFetchAt: string | null;
  recordCount: number;
  freshness: 'fresh' | 'stale' | 'unavailable';
  nextRefreshAt: string | null;
}
