import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, TrendingUp, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { useReports } from '../api/reports';
import { useDataSources, useSystemStats } from '../api/data';
import { StatsCard } from '../components/dashboard/StatsCard';
import { DataFreshnessIndicator } from '../components/dashboard/DataFreshnessIndicator';
import { ReportStatus } from '@report-gen/shared';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: reportList } = useReports({ pageSize: 5 });
  const { data: systemStats } = useSystemStats();
  const { data: sources } = useDataSources();

  const reports = reportList?.data || [];
  const stats = systemStats?.data;
  const sourceList = sources?.data || [];

  const draftCount = reports.filter(r => r.status === ReportStatus.DRAFT).length;
  const readyCount = stats?.readyReports || 0;
  const staleSources = sourceList.filter(s => s.freshness !== 'fresh').length;

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-sm text-gray-500 mt-1">房地产行业分析与工抵房资产研判平台</p>
        </div>
        <button onClick={() => navigate('/reports/new')} className="btn-primary gap-2">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">新建报告</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="总报告数"
          value={stats?.totalReports || 0}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="已完成报告"
          value={readyCount}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="数据缓存量"
          value={stats?.cachedDataPoints || 0}
          icon={Database}
          color="purple"
        />
        <StatsCard
          title="待更新数据源"
          value={staleSources}
          icon={AlertTriangle}
          color={staleSources > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '新建工抵房分析报告', icon: PlusCircle, action: () => navigate('/reports/new'), color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { label: '查看报告列表', icon: FileText, action: () => navigate('/reports'), color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { label: '刷新市场数据', icon: RefreshCw, action: () => navigate('/data'), color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { label: '数据源管理', icon: Database, action: () => navigate('/data'), color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${item.color}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">最近报告</h2>
            <button onClick={() => navigate('/reports')} className="text-sm text-primary-600 hover:text-primary-700">
              查看全部
            </button>
          </div>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无报告</p>
              <button onClick={() => navigate('/reports/new')} className="text-primary-600 text-sm mt-2 hover:underline">
                创建第一份报告
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(report => (
                <button
                  key={report.id}
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{report.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(report.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    report.status === 'ready' ? 'badge-green' :
                    report.status === 'generating' ? 'badge-yellow' :
                    report.status === 'error' ? 'badge-red' : 'badge-gray'
                  }`}>
                    {report.status === 'ready' ? '已完成' :
                     report.status === 'generating' ? '生成中' :
                     report.status === 'error' ? '失败' : '草稿'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data Freshness */}
        <DataFreshnessIndicator sources={sourceList} />
      </div>
    </div>
  );
}
