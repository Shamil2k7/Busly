'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Bus,
  Route,
  Navigation,
  CalendarCheck,
  CreditCard,
  Receipt,
  Bell,
  AlertTriangle,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  UserCheck,
  HeartHandshake,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useSidebar } from '@/context/SidebarContext';
import Badge from '../ui/Badge';

export default function AdminSidebar({ isSuperAdmin = false }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeAlerts } = useSocket();
  const { isOpen, close } = useSidebar();

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Parents & Families', href: '/admin/parents', icon: HeartHandshake },
    { label: 'Teachers', href: '/admin/teachers', icon: Users },
    { label: 'Drivers', href: '/admin/drivers', icon: UserCheck },
    { label: 'Fleet / Buses', href: '/admin/buses', icon: Bus },
    { label: 'Routes & Stops', href: '/admin/routes', icon: Route },
    { label: 'Live Tracking', href: '/admin/live-tracking', icon: Navigation },
    { label: 'Trips', href: '/admin/trips', icon: CalendarCheck },
    { label: 'Bus Fees', href: '/admin/bus-fees', icon: CreditCard },
    { label: 'Payments', href: '/admin/payments', icon: Receipt },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    {
      label: 'Emergency / SOS',
      href: '/admin/emergency',
      icon: ShieldAlert,
      badge: activeAlerts.length > 0 ? activeAlerts.length : null,
      badgeVariant: 'danger',
    },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'School Settings', href: '/admin/settings', icon: Settings },
  ];

  const superAdminNavItems = [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Schools', href: '/super-admin/schools', icon: Bus },
    { label: 'Revenue', href: '/super-admin/revenue', icon: CreditCard },
    { label: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
  ];

  const items = isSuperAdmin ? superAdminNavItems : adminNavItems;

  const renderSidebarBody = (isMobile = false) => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-busly-primary text-busly-dark flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
            <Bus className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white">BUSLY</h1>
            <p className="text-[10px] text-gray-400 font-medium">Smart School Transport</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={close}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tenant Indicator */}
      <div className="px-5 py-3 bg-gray-900/60 border-b border-gray-800/80">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tenant Scope</p>
        <p className="text-xs font-semibold text-amber-400 truncate mt-0.5">
          {user?.schoolName || 'Global Platform'} ({user?.schoolCode || 'ALL'})
        </p>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) close();
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-busly-primary text-busly-dark font-bold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-busly-dark' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/40">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-busly-dark text-white flex-col flex-shrink-0 h-screen sticky top-0 border-r border-gray-800">
        {renderSidebarBody(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile Drawer Off-Canvas Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-busly-dark text-white flex flex-col border-r border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarBody(true)}
      </aside>
    </>
  );
}
