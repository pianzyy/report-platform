import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, FileText } from 'lucide-react';
import { useCreateReport, useUpdateReport, useReport, useGenerateReport } from '../api/reports';
import { ReportDepth, PropertyType, PropertyTypeLabel } from '@report-gen/shared';
import { ALL_SECTIONS, getDefaultSections, SUPPORTED_CITIES, DEFAULT_CITIES } from '@report-gen/shared';
import type { ReportConfig, ReportSectionConfig } from '@report-gen/shared';
import { cn } from '../utils/cn';

const STEPS = ['基本信息', '章节配置', '确认生成'];

export function ReportCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { data: existingReport } = useReport(id);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const generateReport = useGenerateReport();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(existingReport?.data?.title || '');
  const [selectedCities, setSelectedCities] = useState<string[]>(
    existingReport?.data?.config?.cities || DEFAULT_CITIES
  );
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
    existingReport?.data?.config?.propertyTypes || [PropertyType.GONG_DI_FANG, PropertyType.RESIDENTIAL]
  );
  const [depth, setDepth] = useState<ReportDepth>(
    existingReport?.data?.config?.depth || ReportDepth.STANDARD
  );
  const [sections, setSections] = useState<ReportSectionConfig[]>(
    existingReport?.data?.config?.sections || getDefaultSections(ReportDepth.STANDARD)
  );

  const toggleCity = (code: string) => {
    setSelectedCities(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleType = (type: PropertyType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const handleDepthChange = (newDepth: ReportDepth) => {
    setDepth(newDepth);
    setSections(getDefaultSections(newDepth));
  };

  const buildConfig = (): ReportConfig => ({
    title: title || `房地产行业分析报告 - ${new Date().toLocaleDateString('zh-CN')}`,
    cities: selectedCities,
    propertyTypes: selectedTypes,
    sections,
    depth,
    dateRange: {
      start: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const handleCreate = async () => {
    const config = buildConfig();
    if (isEdit && id) {
      await updateReport.mutateAsync({ id, data: config });
    } else {
      const result = await createReport.mutateAsync(config);
      const newId = result.data?.id;
      if (newId) {
        await generateReport.mutateAsync({ id: newId });
        navigate(`/reports/${newId}`);
      }
    }
  };

  const handleGenerate = async () => {
    if (id) {
      await generateReport.mutateAsync({ id });
      navigate(`/reports/${id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 lg:pb-0">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="w-4 h-4" /> 返回
      </button>

      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? '编辑报告配置' : '新建分析报告'}
      </h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-primary-600 text-white' :
              'bg-gray-200 text-gray-500'
            )}>
              {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn('text-sm', step === i + 1 ? 'text-gray-900 font-medium' : 'text-gray-400')}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold">基本信息</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">报告标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：2025年Q1北京工抵房存量资产分析报告"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目标城市</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SUPPORTED_CITIES.map(city => (
                <button
                  key={city.code}
                  onClick={() => toggleCity(city.code)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm border transition-colors text-left',
                    selectedCities.includes(city.code)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  {city.name}
                  <span className="block text-xs text-gray-400">{city.province}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">物业类型</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PropertyTypeLabel).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => toggleType(value as PropertyType)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm border transition-colors',
                    selectedTypes.includes(value as PropertyType)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">报告深度</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: ReportDepth.BRIEF, label: '简报', desc: '4个核心章节' },
                { value: ReportDepth.STANDARD, label: '标准', desc: '8个完整章节' },
                { value: ReportDepth.DEEP, label: '深度', desc: '8个章节+详细数据' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleDepthChange(opt.value)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-colors',
                    depth === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Section Config */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">章节配置</h2>
          <p className="text-sm text-gray-500">选择要包含在报告中的分析章节</p>
          {ALL_SECTIONS.map(section => {
            const sectionConfig = sections.find(s => s.id === section.id);
            const isEnabled = sectionConfig?.enabled ?? true;
            return (
              <div
                key={section.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                  isEnabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                )}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleSection(section.id)}
                  className="mt-1 w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold">确认生成</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">报告标题</span><span className="font-medium">{title || '自动生成'}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">目标城市</span><span>{selectedCities.map(c => SUPPORTED_CITIES.find(sc => sc.code === c)?.name).join('、')}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">物业类型</span><span>{selectedTypes.map(t => PropertyTypeLabel[t]).join('、')}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-gray-500">报告深度</span><span>{depth === 'brief' ? '简报' : depth === 'standard' ? '标准' : '深度'}</span></div>
            <div className="flex justify-between py-2"><span className="text-gray-500">启用章节</span><span>{sections.filter(s => s.enabled).length}个</span></div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="btn-secondary gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> 上一步
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary gap-1">
            下一步 <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleCreate} className="btn-primary gap-2">
            <FileText className="w-4 h-4" />
            {isEdit ? '保存并重新生成' : '创建并生成报告'}
          </button>
        )}
      </div>
    </div>
  );
}
