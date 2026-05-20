import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Database, Settings, ChevronLeft, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  mobile?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/reports', icon: FileText, label: '报告列表' },
  { to: '/reports/new', icon: PlusCircle, label: '新建报告' },
  { to: '/data', icon: Database, label: '数据管理' },
  { to: '/settings', icon: Settings, label: '系统设置' },
];

export function Sidebar({ collapsed, mobile, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      'fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-200',
      collapsed && !mobile ? 'w-16' : 'w-64',
      mobile ? 'w-64' : 'hidden lg:flex',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">房</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">房地产分析平台</span>
          </div>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">房</span>
          </div>
        )}
        {mobile && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to === '/reports' && location.pathname.startsWith('/reports/') && item.to === '/reports');
          const exactActive = location.pathname === item.to ||
            (item.to === '/reports/new' && location.pathname === '/reports/new') ||
            (item.to === '/reports' && location.pathname === '/reports');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'sidebar-link',
                exactActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                collapsed && !mobile && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {(!collapsed || mobile) && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">房地产行业分析报告生成平台 v1.0</p>
        </div>
      )}
    </aside>
  );
}
