import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, RefreshCw, Printer } from 'lucide-react';
import { useReport, useReportContent, useReportStatus, useGenerateReport } from '../api/reports';
import { ReportStatus } from '@report-gen/shared';
import type { ReportDocument } from '@report-gen/shared';
import ReactECharts from 'echarts-for-react';
import { cn } from '../utils/cn';

export default function ReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: reportData } = useReport(id);
  const { data: contentData, isLoading: contentLoading } = useReportContent(id);
  const { data: statusData } = useReportStatus(
    id,
    reportData?.data?.status === ReportStatus.GENERATING
  );
  const generateReport = useGenerateReport();

  const report = reportData?.data;
  const document: ReportDocument | null = contentData?.data || null;
  const isGenerating = report?.status === ReportStatus.GENERATING || statusData?.data?.status === 'generating';

  const handleExportPDF = () => {
    if (id) window.open(`/api/v1/reports/${id}/export/pdf`, '_blank');
  };

  const handleExportJSON = () => {
    if (id) window.open(`/api/v1/reports/${id}/export/json`, '_blank');
  };

  if (contentLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">报告生成中...</h2>
        <p className="text-sm text-gray-500 mt-1">正在获取最新数据并生成分析报告，请稍候</p>
        {report?.status === ReportStatus.ERROR && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {report.errorMessage || '生成失败'}
            <button
              onClick={() => generateReport.mutate({ id: id!, forceRefresh: true })}
              className="ml-3 underline"
            >
              重试
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">报告未生成</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">请先生成报告内容</p>
        <button
          onClick={() => generateReport.mutate({ id: id! })}
          className="btn-primary gap-2"
        >
          <RefreshCw className="w-4 h-4" /> 生成报告
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Toolbar */}
      <div className="sticky top-16 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 no-print">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate mx-4 hidden sm:block">{document.title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateReport.mutate({ id: id!, forceRefresh: true })}
              className="btn-secondary text-xs gap-1 py-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 更新数据
            </button>
            <button onClick={handleExportJSON} className="btn-secondary text-xs gap-1 py-1.5">
              <Download className="w-3.5 h-3.5" /> JSON
            </button>
            <button onClick={handleExportPDF} className="btn-primary text-xs gap-1 py-1.5">
              <Printer className="w-3.5 h-3.5" /> 导出PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto">
        {/* Cover */}
        <div className="text-center py-16 page-break-after">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>
          <p className="text-gray-500">生成时间：{new Date(document.generatedAt).toLocaleString('zh-CN')}</p>
          <div className={cn(
            'inline-block mt-4 px-3 py-1 rounded-full text-xs font-medium',
            document.dataFreshnessSummary.overall === 'fresh' ? 'bg-green-100 text-green-700' :
            document.dataFreshnessSummary.overall === 'stale' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          )}>
            数据状态：{document.dataFreshnessSummary.overall === 'fresh' ? '实时' :
              document.dataFreshnessSummary.overall === 'stale' ? '非实时' : '部分不可用'}
          </div>

          {/* Executive Summary */}
          <div className="mt-12 mx-auto max-w-2xl text-left">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">执行摘要</h2>
              <p className="text-sm text-blue-800 leading-relaxed">{document.executiveSummary.text}</p>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm font-semibold text-amber-900">核心建议</p>
                <p className="text-sm text-amber-800 mt-1">{document.executiveSummary.recommendation}</p>
              </div>
            </div>

            {/* Key Metrics */}
            {document.executiveSummary.keyMetrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {document.executiveSummary.keyMetrics.map(m => (
                  <div key={m.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-primary-600">{m.value}{m.unit || ''}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                    <div className={cn('text-xs mt-0.5', m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-gray-400')}>
                      {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                      {m.changePercent !== undefined ? ` ${m.changePercent > 0 ? '+' : ''}${m.changePercent}%` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Table of Contents */}
          <div className="mt-16 text-left max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">目录</h2>
            <ol className="space-y-2">
              {document.tableOfContents.map(item => (
                <li key={item.id} className="text-sm">
                  <a href={`#section-${item.id}`} className="text-primary-600 hover:underline">
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sections */}
        {document.sections.map(section => (
          <section key={section.sectionId} id={`section-${section.sectionId}`} className="py-8 border-b border-gray-100 page-break-before">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-primary-600 pl-3 mb-4">
              {section.title}
            </h2>

            {/* Section Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <strong>核心发现：</strong>{section.summary}
            </div>

            {/* Metrics */}
            {section.metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {section.metrics.map(m => (
                  <div key={m.id} className="text-center p-3 bg-white border rounded-lg">
                    <div className="text-lg font-bold text-primary-600">{m.value}{m.unit || ''}</div>
                    <div className="text-xs text-gray-500">{m.label}</div>
                    <div className={cn('text-xs mt-0.5', m.trend === 'up' ? 'text-green-600' : m.trend === 'down' ? 'text-red-600' : 'text-gray-400')}>
                      {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                      {m.changePercent !== undefined ? ` ${m.changePercent > 0 ? '+' : ''}${m.changePercent}%` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Text Blocks */}
            <div className="prose prose-sm max-w-none">
              {section.textBlocks.map((block, i) => {
                switch (block.type) {
                  case 'heading':
                    const H = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
                    return <H key={i} className={block.level === 2 ? 'text-base font-semibold mt-6 mb-2' : 'text-sm font-medium mt-4 mb-1'}>{block.content}</H>;
                  case 'paragraph':
                    return <p key={i} className="text-sm text-gray-700 leading-relaxed my-3">{block.content}</p>;
                  case 'bullet-list':
                    return (
                      <ul key={i} className="my-2 space-y-1">
                        {block.items?.map((item, j) => (
                          <li key={j} className="text-sm text-gray-700">{item}</li>
                        ))}
                      </ul>
                    );
                  case 'callout':
                    return (
                      <blockquote key={i} className="border-l-4 border-amber-400 bg-amber-50 p-3 my-4 text-sm font-medium text-amber-900">
                        {block.content}
                      </blockquote>
                    );
                  case 'key-metric':
                    return (
                      <div key={i} className="inline-flex items-baseline gap-2 bg-gray-50 rounded px-3 py-1 my-1">
                        <span className="text-lg font-bold text-primary-600">{block.metric?.value}</span>
                        <span className="text-sm text-gray-500">{block.metric?.label}</span>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>

            {/* Charts */}
            {section.charts.map(chart => (
              <div key={chart.id} className="mt-6 mb-4">
                <div className="card p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{chart.title}</h4>
                  <ReactECharts
                    option={chart.echartsOption}
                    style={{ height: chart.height || 350, width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                  {chart.caption && (
                    <p className="text-xs text-gray-400 text-center mt-2">{chart.caption}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Sources */}
            <div className="text-xs text-gray-400 mt-6 pt-3 border-t border-gray-100">
              数据来源：{section.dataSources.join('、')} | 数据时效：{section.dataFreshness}
            </div>
          </section>
        ))}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg text-xs text-gray-400 text-center">
          {document.disclaimer}
        </div>
      </div>
    </div>
  );
}
