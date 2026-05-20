import { Circle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DataSourceStatus } from '@report-gen/shared';

interface Props {
  sources: DataSourceStatus[];
}

export function DataFreshnessIndicator({ sources }: Props) {
  const navigate = useNavigate();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">数据源状态</h2>
        <button onClick={() => navigate('/data')} className="text-sm text-primary-600 hover:text-primary-700">
          管理
        </button>
      </div>
      {sources.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>加载中...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sources.map(source => (
            <div key={source.name} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{source.label}</p>
                <p className="text-xs text-gray-400">
                  {source.lastFetchAt
                    ? `最近更新: ${new Date(source.lastFetchAt).toLocaleString('zh-CN')}`
                    : '从未更新'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{source.recordCount}条</span>
                <Circle className={`w-3 h-3 fill-current ${
                  source.freshness === 'fresh' ? 'text-green-500' :
                  source.freshness === 'stale' ? 'text-yellow-500' : 'text-red-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
