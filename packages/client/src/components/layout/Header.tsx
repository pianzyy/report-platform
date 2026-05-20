import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, RefreshCw, User, LogOut } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDataSources } from '../../api/data';
import { cn } from '../../utils/cn';

export function Header() {
  const { setSidebarOpen, toggleSidebarCollapsed } = useAppStore();
  const { user, logout } = useAuthStore();
  const { data: sources } = useDataSources();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sourceStatuses = sources?.data || [];
  const staleCount = sourceStatuses.filter(s => s.freshness === 'stale' || s.freshness === 'unavailable').length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm text-gray-500 hidden sm:block">
          房地产行业分析报告生成平台
        </div>
      </div>

      <div className="flex items-center gap-2">
        {staleCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>{staleCount}个数据源待更新</span>
          </div>
        )}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors',
                menuOpen && 'bg-gray-100'
              )}
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700 hidden sm:block">{user.username}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
