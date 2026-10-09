'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ShieldAlert, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useSidebar } from '@/context/SidebarContext';

export default function AdminTopNav({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { activeAlerts } = useSocket();
  const { toggle } = useSidebar();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
        {/* Mobile / Tablet Hamburger Menu Button */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        {/* Emergency Alert indicator */}
        {activeAlerts.length > 0 && (
          <Link
            href="/admin/emergency"
            className="flex items-center space-x-1.5 sm:space-x-2 bg-red-100 text-red-700 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse flex-shrink-0"
          >
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{activeAlerts.length} SOS ACTIVE</span>
            <span className="sm:hidden font-mono font-bold">{activeAlerts.length} SOS</span>
          </Link>
        )}

        <Link
          href="/admin/notifications"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative flex-shrink-0"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.schoolName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
