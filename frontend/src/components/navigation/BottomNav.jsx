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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav({ role }) {
  const pathname = usePathname();

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
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1 shadow-lg max-w-lg mx-auto md:max-w-xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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
