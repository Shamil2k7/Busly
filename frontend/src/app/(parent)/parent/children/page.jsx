'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Bus, MapPin, ArrowLeft, KeyRound } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState([]);
  const [familyCode, setFamilyCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/reports/dashboard/parent');
        if (res.success) {
          setChildren(res.data.children || []);
          setFamilyCode(res.data.familyCode || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Children Profiles"
        subtitle={`Family Code: ${familyCode}`}
        rightAction={
          <Link href="/parent/home">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        {children.map((child) => (
          <Card key={child.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{child.name}</h3>
                <p className="text-xs text-gray-500 font-mono">
                  Student ID: {child.studentId} • Class {child.class}-{child.division}
                </p>
              </div>
              <Badge variant="primary" size="sm">
                Enrolled
              </Badge>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center space-x-1">
                  <Bus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Assigned Bus:</span>
                </span>
                <span className="font-bold text-gray-900">
                  {child.bus?.busNumber || 'None'} ({child.bus?.registrationNumber || '--'})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pickup Stop:</span>
                </span>
                <span className="font-medium text-gray-800">
                  {child.pickupStop?.name || 'School Gate'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Drop Stop:</span>
                </span>
                <span className="font-medium text-gray-800">
                  {child.dropStop?.name || 'School Gate'}
                </span>
              </div>
            </div>

            <div className="pt-1 flex space-x-2">
              <Link href="/parent/live-tracking" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Track Assigned Bus
                </Button>
              </Link>
              <Link href="/parent/bus-fees" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Transport Pass Fees
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
}
