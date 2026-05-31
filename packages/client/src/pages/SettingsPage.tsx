import { Settings, Server, Bell, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-sm text-gray-500 mt-1">配置报告生成和系统参数</p>
      </div>

      {/* General Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">通用设置</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">默认报告深度</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="standard">标准（8个章节）</option>
              <option value="brief">简报（4个章节）</option>
              <option value="deep">深度（完整数据）</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">默认目标城市</label>
            <select multiple className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-24">
              <option>北京</option>
              <option>上海</option>
              <option>广州</option>
              <option>深圳</option>
              <option>成都</option>
              <option>杭州</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">按住Ctrl键多选</p>
          </div>
        </div>
      </div>

      {/* Data Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">数据刷新设置</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">全量数据自动刷新</p>
              <p className="text-xs text-gray-500">每6小时自动刷新所有数据源</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">工抵房数据高频刷新</p>
              <p className="text-xs text-gray-500">每2小时刷新工抵房专项数据</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">通知设置</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">报告生成完成通知</p>
              <p className="text-xs text-gray-500">报告生成完成后在页面内提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">数据过期提醒</p>
              <p className="text-xs text-gray-500">数据超过有效期时在仪表盘提醒</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold">系统信息</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">应用版本</span>
            <span className="font-medium">v1.0.0</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">数据库</span>
            <span className="font-medium">SQLite (WAL模式)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">PDF引擎</span>
            <span className="font-medium">Puppeteer (Chromium)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">数据采集</span>
            <span className="font-medium">自动+手动</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">缓存层级</span>
            <span className="font-medium">L1内存 + L2数据库 + L3文件</span>
          </div>
        </div>
      </div>
    </div>
  );
}
