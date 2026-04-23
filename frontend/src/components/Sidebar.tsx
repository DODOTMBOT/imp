import { NavLink } from 'react-router-dom';
import { Home, Shield, MapPin, Users, Activity, UserCheck, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStats } from '../hooks/useStats';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { stats } = useStats();

  const navigation = [
    { name: 'Обзор', path: '/', icon: Home },
    ...(user?.role === 'super_admin' ? [{ name: 'Администрирование', path: '/admin', icon: Shield }] : []),
    { name: 'Локации', path: '/locations', icon: MapPin },
    { name: 'Сотрудники', path: '/employees', icon: Users },
    { name: 'Медкнижки', path: '/health', icon: Activity },
    { name: 'Укомплектованность', path: '/staffing', icon: UserCheck },
    { name: 'Метрики', path: '/metrics', icon: TrendingUp },
  ];

  const getRoleLabel = (role: string) => {
    if (role === 'super_admin') return 'Супер Администратор';
    if (role === 'franchisee') return 'Франчайзи';
    if (role === 'manager') return 'Управляющий';
    return role;
  };

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      <div className="p-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900">Territory Platform</h1>
        <p className="text-xs text-neutral-500 mt-1">Консоль управления</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500">{getRoleLabel(user?.role || '')}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </div>
  );
}
