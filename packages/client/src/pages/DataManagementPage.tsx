import { useState } from 'react';
import { RefreshCw, Database, Circle, Clock, AlertTriangle } from 'lucide-react';
import { useDataSources, useRefreshHistory, useRefreshData } from '../api/data';
import { cn } from '../utils/cn';

export function DataManagementPage() {
  const { data: sourcesData, isLoading } = useDataSources();
  const { data: historyData } = useRefreshHistory();
  const refreshData = useRefreshData();
  const [refreshingSource, setRefreshingSource] = useState<string | null>(null);

  const sources = sourcesData?.data || [];
  const history = (historyData?.data || []) as Array<{
    id: number;
    source: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    recordsUpdated: number;
    errorMessage: string | null;
  }>;

  const handleRefresh = async (source?: string) => {
    setRefreshingSource(source || 'all');
    try {
      await refreshData.mutateAsync(source ? { sources: [source], force: true } : { force: true });
    } finally {
      setRefreshingSource(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理数据源和刷新策略</p>
        </div>
        <button
          onClick={() => handleRefresh()}
          disabled={refreshData.isPending}
          className="btn-primary gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', refreshData.isPending && 'animate-spin')} />
          全部刷新
        </button>
      </div>

      {/* Source Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map(source => (
          <div key={source.name} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Circle className={cn('w-3 h-3 fill-current',
                  source.freshness === 'fresh' ? 'text-green-500' :
                  source.freshness === 'stale' ? 'text-yellow-500' : 'text-red-500'
                )} />
                <h3 className="font-semibold text-gray-900">{source.label}</h3>
              </div>
              <span className={cn('badge',
                source.status === 'online' ? 'badge-green' :
                source.status === 'degraded' ? 'badge-yellow' : 'badge-red'
              )}>
                {source.status === 'online' ? '正常' : source.status === 'degraded' ? '延迟' : '离线'}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-500 mb-4">
              <div className="flex justify-between">
                <span>数据记录</span>
                <span className="font-medium text-gray-900">{source.recordCount}条</span>
              </div>
              <div className="flex justify-between">
                <span>上次更新</span>
                <span className="font-medium text-gray-900">
                  {source.lastFetchAt
                    ? new Date(source.lastFetchAt).toLocaleString('zh-CN')
                    : '从未更新'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleRefresh(source.name)}
              disabled={refreshingSource === source.name}
              className="w-full btn-secondary text-xs gap-1 py-1.5"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', refreshingSource === source.name && 'animate-spin')} />
              {refreshingSource === source.name ? '刷新中...' : '立即刷新'}
            </button>
          </div>
        ))}
      </div>

      {/* Refresh History */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">刷新历史</h2>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无刷新记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">数据源</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">状态</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium hidden sm:table-cell">开始时间</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">记录数</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 20).map(entry => (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{entry.source}</td>
                    <td className="py-2 px-3">
                      <span className={cn('badge',
                        entry.status === 'success' ? 'badge-green' :
                        entry.status === 'partial' ? 'badge-yellow' :
                        entry.status === 'failed' ? 'badge-red' : 'badge-blue'
                      )}>
                        {entry.status === 'success' ? '成功' :
                         entry.status === 'partial' ? '部分成功' :
                         entry.status === 'failed' ? '失败' : '运行中'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 hidden sm:table-cell">
                      {new Date(entry.startedAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-2 px-3">{entry.recordsUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
