'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import BottomNav from '@/components/navigation/BottomNav';
import { SidebarProvider } from '@/context/SidebarContext';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busly-primary"></div>
          <p className="text-xs text-gray-500 font-medium">Loading School Admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-busly-bg">
        <AdminSidebar isSuperAdmin={false} />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </div>
        <BottomNav role={user?.role || 'SCHOOL_ADMIN'} />
      </div>
    </SidebarProvider>
  );
}
