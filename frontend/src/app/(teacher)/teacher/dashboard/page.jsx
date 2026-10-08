'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  PlusCircle,
  Bus,
  CalendarCheck,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/reports/dashboard/teacher');
        if (res.success) setData(res.data);
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
        title={user?.name || 'Teacher Portal'}
        subtitle={`Classes: ${user?.assignedClasses || 'All'}`}
      />

      <main className="p-4 space-y-4">
        {/* Quick Add Student Callout Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-slate-900 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">
                Quick Action
              </span>
              <h3 className="font-extrabold text-base mt-1">Enroll New Student</h3>
              <p className="text-xs text-slate-900/80 mt-0.5">
                Add student & generate their Parent Family Code.
              </p>
            </div>
            <Link href="/teacher/students/new">
              <Button variant="dark" size="sm" className="shadow">
                <PlusCircle className="w-4 h-4 mr-1" /> Add
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3.5">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">My Students</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">{data?.totalMyStudents ?? '--'}</p>
            <p className="text-[10px] text-gray-400">Class roster</p>
          </Card>

          <Card className="p-3.5">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Active Buses</span>
              <Bus className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-gray-900">
              {data?.activeBuses?.length ?? '--'}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">On transit</p>
          </Card>
        </div>

        {/* Today's Bus Trips */}
        <Card>
          <CardHeader
            title="Today’s Bus Runs"
            subtitle="Live status of school transport"
            action={
              <Link href="/teacher/live-tracking">
                <Button variant="ghost" size="sm" className="text-xs text-amber-600">
                  Track Map <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {(!data?.todayTrips || data.todayTrips.length === 0) ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No active trips right now.
                </div>
              ) : (
                data.todayTrips.map((trip) => (
                  <div key={trip.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-900 text-xs">
                        {trip.bus?.busNumber}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{trip.route?.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {trip.driver?.name} • {trip.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant={trip.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {trip.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Students Quick List */}
        <Card>
          <CardHeader
            title="Enrolled Students"
            subtitle="Students in your assigned classes"
            action={
              <Link href="/teacher/students">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {data?.students?.map((s) => (
                <div key={s.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{s.name}</p>
                    <p className="text-[11px] text-gray-400">
                      Class {s.class}-{s.division} • {s.bus?.busNumber || 'No Bus'}
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">
                    {s.pickupStop?.name || 'Assigned'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
