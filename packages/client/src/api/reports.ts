import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI, postAPI, patchAPI, deleteAPI } from './client';
import type { Report, ReportDocument, ReportConfig, ReportListParams, GenerateReportRequest } from '@report-gen/shared';

export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => fetchAPI<Report[]>('/reports', params as Record<string, unknown>),
  });
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => fetchAPI<Report>(`/reports/${id}`),
    enabled: !!id,
  });
}

export function useReportContent(id: string | undefined) {
  return useQuery({
    queryKey: ['reports', id, 'content'],
    queryFn: () => fetchAPI<ReportDocument>(`/reports/${id}/content`),
    enabled: !!id,
  });
}

export function useReportStatus(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['reports', id, 'status'],
    queryFn: () => fetchAPI<{ id: string; status: string; errorMessage?: string }>(`/reports/${id}/status`),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      if (data?.status === 'generating') return 2000;
      return false;
    },
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: ReportConfig) => postAPI<Report>('/reports', config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportConfig> & { title?: string } }) =>
      patchAPI<Report>(`/reports/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAPI<null>(`/reports/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, forceRefresh = false }: { id: string; forceRefresh?: boolean }) =>
      postAPI<{ id: string; status: string }>(`/reports/${id}/generate`, { forceRefresh } as GenerateReportRequest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });
}
