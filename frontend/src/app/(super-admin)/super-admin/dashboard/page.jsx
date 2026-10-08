'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  School,
  Users,
  Bus,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';

export default function SuperAdminDashboardPage() {
  const [data, setData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          api.get('/api/reports/super-admin'),
          api.get('/api/schools'),
        ]);
        if (mRes.success) setData(mRes.data);
        if (sRes.success) setSchools(sRes.data);
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
      <AdminTopNav title="Busly SaaS Global Command" subtitle="Platform-Wide Tenant & Subscription Intelligence" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500">Total Schools</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{data?.totalSchools ?? '--'}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {data?.activeSchools ?? '--'} Active Tenants
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500">Platform Students</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{data?.totalStudents ?? '--'}</p>
            <p className="text-[11px] text-gray-400 mt-1">Across all schools</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500">Active Fleet</span>
            <p className="text-3xl font-black text-amber-500 mt-1">{data?.totalBuses ?? '--'}</p>
            <p className="text-[11px] text-gray-400 mt-1">Operational buses</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs font-semibold text-gray-500">Total Platform Revenue</span>
            <p className="text-3xl font-black text-emerald-600 mt-1">₹{data?.totalRevenue ?? 0}</p>
            <p className="text-[11px] text-gray-400 mt-1">Fee processing total</p>
          </Card>
        </div>

        {/* Tenant Schools Directory Preview */}
        <Card>
          <CardHeader
            title="School Tenants"
            subtitle="Registered school campuses on the Busly platform"
            action={
              <Link href="/super-admin/schools">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Provision School
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {schools.map((school) => (
                <div key={school.id} className="p-4 flex items-center justify-between hover:bg-gray-50/70">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{school.name}</h4>
                      <p className="text-xs text-gray-500">
                        Code: <span className="font-mono font-bold text-gray-800">{school.code}</span> • Plan: {school.subscriptionPlan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-xs text-gray-500 hidden sm:block">
                      <p>{school._count?.students || 0} students</p>
                      <p>{school._count?.buses || 0} buses</p>
                    </div>
                    <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {school.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
