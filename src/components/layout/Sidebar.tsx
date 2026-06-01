import { NavLink } from 'react-router-dom';
import { FilePlus, Archive, Users, Shield, X } from 'lucide-react';

const navItems = [
  { to: '/new', label: '新建NDA', icon: FilePlus },
  { to: '/archive', label: '历史存档', icon: Archive },
  { to: '/contacts', label: '通讯录', icon: Users },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const handleClick = () => {
    onClose?.();
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-navy-800 border-r border-navy-700 flex flex-col min-h-screen">
      <div className="p-5 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-navy-900" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight">NDA工具</h1>
            <p className="text-[10px] text-slate-400 leading-tight">并购商务轻量化</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded text-slate-400 hover:text-white hover:bg-navy-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-navy-700'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-700">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          本工具仅供商务洽谈参考使用<br />
          不具备正式法律强制效力
        </p>
      </div>
    </aside>
  );
}
