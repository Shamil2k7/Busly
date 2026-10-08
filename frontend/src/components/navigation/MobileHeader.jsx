'use client';

import React from 'react';
import Link from 'next/link';
import { Bus, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileHeader({ title, subtitle, rightAction }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-lg bg-busly-primary text-busly-dark flex items-center justify-center font-bold">
          <Bus className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-gray-900 leading-tight">
            {title || user?.schoolName || 'BUSLY'}
          </h1>
          {subtitle && <p className="text-[11px] text-gray-500 leading-tight">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {rightAction}
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
