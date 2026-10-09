'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Bus, CreditCard, Download } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';

export default function AdminReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/reports/dashboard/admin');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const metrics = data?.metrics || {};

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Transport Reports & Analytics" subtitle="Fleet Efficiency & Fee Reconciliation Audits" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Fee Collection Rate</h3>
            <p className="text-3xl font-black text-emerald-600 my-2">
              {metrics.totalFeesBilled > 0
                ? `${Math.round((metrics.collectedFees / metrics.totalFeesBilled) * 100)}%`
                : '100%'}
            </p>
            <p className="text-xs text-gray-500">
              ₹{metrics.collectedFees} collected of ₹{metrics.totalFeesBilled} billed
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Fleet Passenger Density</h3>
            <p className="text-3xl font-black text-amber-500 my-2">
              {metrics.activeBuses > 0 ? Math.round(metrics.totalStudents / metrics.activeBuses) : 0}
            </p>
            <p className="text-xs text-gray-500">Average student passengers per bus</p>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Safety Incident Rate</h3>
            <p className="text-3xl font-black text-gray-900 my-2">
              {metrics.activeSosAlerts} Active
            </p>
            <p className="text-xs text-gray-500">All emergency events logged & tracked</p>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="School Transport Executive Summary"
            subtitle="Operational review of buses, drivers, routes, and billing"
            action={
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Download className="w-3.5 h-3.5 mr-1" /> Export Report
              </Button>
            }
          />
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <p className="font-bold text-gray-900">Key Performance Indicators:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Total enrolled student passengers: {metrics.totalStudents || 0}</li>
                <li>Operational school buses: {metrics.activeBuses || 0}</li>
                <li>Registered drivers: {metrics.activeDrivers || 0}</li>
                <li>Settled revenue collections: ₹{metrics.collectedFees || 0}</li>
                <li>Pending invoices requiring reminder: {metrics.pendingFeesCount || 0}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
