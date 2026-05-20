import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI, postAPI } from './client';
import type { DataSourceStatus, RefreshDataRequest } from '@report-gen/shared';

export function useDataSources() {
  return useQuery({
    queryKey: ['data', 'sources'],
    queryFn: () => fetchAPI<DataSourceStatus[]>('/data/sources'),
    refetchInterval: 60 * 1000,
  });
}

export function useRefreshHistory() {
  return useQuery({
    queryKey: ['data', 'refreshHistory'],
    queryFn: () => fetchAPI<unknown[]>('/data/refresh/history', { limit: 20 }),
  });
}

export function useRefreshData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params?: RefreshDataRequest) => postAPI<unknown[]>('/data/refresh', params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['data'] });
    },
  });
}

export function useMacroData() {
  return useQuery({
    queryKey: ['data', 'macro'],
    queryFn: () => fetchAPI<unknown[]>('/data/macro'),
  });
}

export function useHousingPrices(city?: string) {
  return useQuery({
    queryKey: ['data', 'housingPrices', city],
    queryFn: () => fetchAPI<unknown[]>('/data/housing-prices', city ? { city } : undefined),
  });
}

export function useGongDiFangData(city?: string) {
  return useQuery({
    queryKey: ['data', 'gongdifang', city],
    queryFn: () => fetchAPI<unknown[]>('/data/gongdifang', city ? { city } : undefined),
  });
}

export function usePolicies(city?: string) {
  return useQuery({
    queryKey: ['data', 'policies', city],
    queryFn: () => fetchAPI<unknown[]>('/data/policies', city ? { city } : undefined),
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['system', 'stats'],
    queryFn: () => fetchAPI<{ totalReports: number; readyReports: number; cachedDataPoints: number; lastRefreshAt: string | null }>('/system/stats'),
    refetchInterval: 30 * 1000,
  });
}
