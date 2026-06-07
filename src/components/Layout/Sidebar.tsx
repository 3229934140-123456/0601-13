import { cn } from '@/lib/utils';
import { TabType } from '@/types';
import {
  Film,
  Calendar,
  BarChart3,
  Trophy,
  Quote,
  LayoutGrid,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: typeof Film }[] = [
  { id: 'library', label: '片库导入', icon: Film },
  { id: 'calendar', label: '观影日历', icon: Calendar },
  { id: 'rating', label: '评分矩阵', icon: BarChart3 },
  { id: 'rankings', label: '榜单编辑', icon: Trophy },
  { id: 'quotes', label: '台词摘录', icon: Quote },
  { id: 'cards', label: '图文卡片', icon: LayoutGrid },
  { id: 'dashboard', label: '数据总览', icon: LayoutDashboard },
  { id: 'settings', label: '设置', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-60 h-screen bg-[#0A0A0D] border-r border-[#1a1a20] flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-[#1a1a20]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Film className="w-5 h-5 text-[#0A0A0D]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-400" style={{ fontFamily: 'Playfair Display, serif' }}>
              CineTrack
            </h1>
            <p className="text-xs text-gray-500">影视追踪看板</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-amber-300 hover:bg-[#121218]'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive && 'text-amber-400')} />
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1a1a20]">
        <div className="text-xs text-gray-600 text-center">
          <p>v1.0.0 · 本地存储</p>
        </div>
      </div>
    </aside>
  );
}
