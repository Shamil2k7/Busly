'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Navigation,
  CreditCard,
  User,
  Bus,
  CalendarCheck,
  ShieldAlert,
  Bell,
  PlusCircle,
  LayoutDashboard,
  GraduationCap,
  School,
  Settings,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useSocket } from '@/context/SocketContext';

export default function BottomNav({ role }) {
  const pathname = usePathname();
  const { toggle, isOpen } = useSidebar();
  const { activeAlerts = [] } = useSocket();

  let items = [];

  if (role === 'PARENT') {
    items = [
      { label: 'Home', href: '/parent/home', icon: Home },
      { label: 'Tracking', href: '/parent/live-tracking', icon: Navigation },
      { label: 'Children', href: '/parent/children', icon: Users },
      { label: 'Fees', href: '/parent/bus-fees', icon: CreditCard },
      { label: 'Profile', href: '/parent/profile', icon: User },
    ];
  } else if (role === 'DRIVER') {
    items = [
      { label: 'Cockpit', href: '/driver/dashboard', icon: Home },
      { label: 'Live Trip', href: '/driver/live-trip', icon: Navigation },
      { label: 'Students', href: '/driver/students', icon: Users },
      { label: 'SOS', href: '/driver/emergency', icon: ShieldAlert, alert: true },
      { label: 'Profile', href: '/driver/profile', icon: User },
    ];
  } else if (role === 'TEACHER') {
    items = [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: Home },
      { label: 'Add Student', href: '/teacher/students/new', icon: PlusCircle },
      { label: 'Students', href: '/teacher/students', icon: Users },
      { label: 'Tracking', href: '/teacher/live-tracking', icon: Navigation },
      { label: 'Profile', href: '/teacher/profile', icon: User },
    ];
  } else if (role === 'SCHOOL_ADMIN' || role === 'ADMIN') {
    items = [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/admin/students', icon: GraduationCap },
      { label: 'Tracking', href: '/admin/live-tracking', icon: Navigation },
      { label: 'Fleet', href: '/admin/buses', icon: Bus },
      {
        label: 'Menu',
        icon: Menu,
        isAction: true,
        onClick: toggle,
        alert: activeAlerts && activeAlerts.length > 0,
      },
    ];
  } else if (role === 'SUPER_ADMIN') {
    items = [
      { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
      { label: 'Schools', href: '/super-admin/schools', icon: School },
      { label: 'Revenue', href: '/super-admin/revenue', icon: CreditCard },
      { label: 'Settings', href: '/super-admin/settings', icon: Settings },
      {
        label: 'Menu',
        icon: Menu,
        isAction: true,
        onClick: toggle,
      },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 shadow-lg max-w-lg mx-auto md:max-w-xl lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isAction
            ? isOpen
            : pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                item.href !== '/super-admin/dashboard' &&
                pathname.startsWith(`${item.href}/`));

          if (item.isAction) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors active:scale-95 ${
                  isActive
                    ? 'text-amber-600 font-bold'
                    : item.alert
                    ? 'text-red-600 font-bold animate-pulse'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="Open full menu"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.alert && (
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {activeAlerts?.length || '!'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : item.alert
                  ? 'text-red-600 font-bold animate-pulse'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
