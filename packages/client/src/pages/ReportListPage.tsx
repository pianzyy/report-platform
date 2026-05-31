import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, Search, Trash2, Copy, Eye, RefreshCw } from 'lucide-react';
import { useReports, useDeleteReport, useGenerateReport } from '../api/reports';
import { ReportStatus, ReportStatusLabel } from '@report-gen/shared';

export default function ReportListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportList, isLoading } = useReports({ pageSize: 50 });
  const deleteReport = useDeleteReport();
  const generateReport = useGenerateReport();

  const reports = (reportList?.data || []).filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (searchTerm && !r.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报告列表</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有分析报告</p>
        </div>
        <button onClick={() => navigate('/reports/new')} className="btn-primary gap-2">
          <PlusCircle className="w-4 h-4" />
          新建报告
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索报告..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部状态</option>
          {Object.entries(ReportStatusLabel).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Report Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无报告</h3>
          <p className="text-sm text-gray-500 mb-6">创建您的第一份房地产分析报告</p>
          <button onClick={() => navigate('/reports/new')} className="btn-primary gap-2">
            <PlusCircle className="w-4 h-4" />
            新建报告
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <div key={report.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className={`badge flex-shrink-0 ml-2 ${
                  report.status === ReportStatus.READY ? 'badge-green' :
                  report.status === ReportStatus.GENERATING ? 'badge-yellow' :
                  report.status === ReportStatus.ERROR ? 'badge-red' : 'badge-gray'
                }`}>
                  {ReportStatusLabel[report.status as ReportStatus]}
                </span>
              </div>

              {report.status === ReportStatus.ERROR && report.errorMessage && (
                <p className="text-xs text-red-500 mb-3 truncate">{report.errorMessage}</p>
              )}

              <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                {report.status === ReportStatus.READY && (
                  <>
                    <button
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="flex-1 btn-secondary text-xs py-1.5 gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> 查看
                    </button>
                    <button
                      onClick={() => generateReport.mutate({ id: report.id, forceRefresh: true })}
                      className="flex-1 btn-secondary text-xs py-1.5 gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> 重新生成
                    </button>
                  </>
                )}
                {report.status === ReportStatus.DRAFT && (
                  <button
                    onClick={() => generateReport.mutate({ id: report.id })}
                    className="flex-1 btn-primary text-xs py-1.5 gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> 生成报告
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('确定删除此报告？')) deleteReport.mutate(report.id);
                  }}
                  className="btn-secondary text-xs py-1.5 px-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
