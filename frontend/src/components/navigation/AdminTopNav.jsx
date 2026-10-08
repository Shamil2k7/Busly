'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

export default function AdminTopNav({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { activeAlerts } = useSocket();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Emergency Alert indicator */}
        {activeAlerts.length > 0 && (
          <Link
            href="/admin/emergency"
            className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{activeAlerts.length} SOS ACTIVE</span>
          </Link>
        )}

        <Link
          href="/admin/notifications"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-gray-500">{user?.schoolName}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
