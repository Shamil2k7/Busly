'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Download, Receipt } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';

export default function SuperAdminRevenuePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/reports/super-admin');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Platform Revenue Intelligence" subtitle="SaaS Transaction Flow & Volume" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Total Processed Volume</h3>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 my-2">
              ₹{data?.totalRevenue || 0}
            </p>
            <p className="text-xs text-gray-500">Across all tenant schools</p>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Active Subscriptions</h3>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 my-2">
              {data?.activeSchools || 0} Schools
            </p>
            <p className="text-xs text-gray-500">Generating platform recurring licenses</p>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-1">SaaS Platform Fee (1.5%)</h3>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 my-2">
              ₹{Math.round((data?.totalRevenue || 0) * 0.015)}
            </p>
            <p className="text-xs text-gray-500">Platform take rate on transport pass transactions</p>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Recent Platform Payment Transactions"
            subtitle="Multi-tenant settlement ledger"
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {(!data?.recentPayments || data.recentPayments.length === 0) ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No payment volume recorded yet.
                </div>
              ) : (
                data.recentPayments.map((p) => (
                  <div key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{p.school?.name}</p>
                      <p className="font-mono text-xs text-gray-400 truncate">
                        Ref: {p.paymentReference} • Receipt: {p.receiptNumber}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="font-black text-emerald-600 text-base">₹{p.amount}</p>
                      <p className="text-[11px] text-gray-500">{new Date(p.paidAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
