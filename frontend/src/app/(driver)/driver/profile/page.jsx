'use client';

import React from 'react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Bus, Phone, ShieldCheck } from 'lucide-react';

export default function DriverProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Driver Profile" subtitle="License & Vehicle Assignment" />

      <main className="p-4 space-y-4">
        <Card className="p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl mx-auto mb-3">
            {user?.name?.[0] || 'D'}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <p className="text-xs text-gray-500 font-mono">Mobile: {user?.mobile}</p>
        </Card>

        <Card>
          <CardHeader title="Operating Vehicle" />
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">School</span>
              <span className="font-semibold text-gray-900">{user?.schoolName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Assigned Bus</span>
              <span className="font-bold text-amber-800">
                {user?.assignedBus?.busNumber || 'Fleet Vehicle 01'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button variant="danger" className="w-full mt-4" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </main>
    </div>
  );
}
