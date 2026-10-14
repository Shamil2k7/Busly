import React from 'react';
import { Bus, RefreshCw, LogOut } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function TopBar({ title, subtitle, onOpenRoleModal, rightAction }) {
  const { user, logout } = useMobileAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'TEACHER':
        return { label: 'Teacher', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'DRIVER':
        return { label: 'Driver', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PARENT':
      default:
        return { label: 'Parent', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 pb-3 safe-top flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-busly-primary text-slate-900 flex items-center justify-center font-bold shadow-sm">
          <Bus className="w-4 h-4 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-gray-900 leading-tight">
            {title || user?.name || user?.schoolName || 'BUSLY'}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {rightAction}

        <button
          onClick={onOpenRoleModal}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition shadow-2xs ${badge.bg}`}
          title="Switch User Role"
        >
          <span>{badge.label}</span>
          <RefreshCw className="w-2.5 h-2.5 opacity-70" />
        </button>

        <button
          onClick={logout}
          title="Logout"
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
