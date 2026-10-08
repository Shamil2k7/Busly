'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/navigation/BottomNav';

export default function ParentLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PARENT')) {
      router.push('/otp-login?role=PARENT');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-busly-primary"></div>
          <p className="text-xs text-gray-500 font-medium">Loading Parent portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <div className="w-full max-w-lg mx-auto bg-white min-h-screen shadow-sm flex flex-col pb-20">
        {children}
      </div>
      <BottomNav role="PARENT" />
    </div>
  );
}
