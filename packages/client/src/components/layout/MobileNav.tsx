import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Database } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/reports', icon: FileText, label: '报告' },
  { to: '/reports/new', icon: PlusCircle, label: '新建' },
  { to: '/data', icon: Database, label: '数据' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to === '/reports' && location.pathname.startsWith('/reports/') && item.to !== '/reports/new');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
