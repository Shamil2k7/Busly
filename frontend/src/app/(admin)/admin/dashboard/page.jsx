'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Bus,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Receipt,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LiveBusMap from '@/components/maps/LiveBusMap';
import { api } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/api/reports/dashboard/admin');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const metrics = data?.metrics || {};

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Transport Operations Dashboard" subtitle="Real-time School Fleet Command" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Active Emergency Alert Banner if any */}
        {data?.activeAlerts && data.activeAlerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">
                  🚨 ACTIVE EMERGENCY SOS ({data.activeAlerts.length})
                </h4>
                <p className="text-xs text-red-700">
                  {data.activeAlerts[0]?.bus?.busNumber} • {data.activeAlerts[0]?.reason}
                </p>
              </div>
            </div>
            <Link href="/admin/emergency" className="self-end sm:self-auto">
              <Button variant="danger" size="sm">
                Open Emergency Center
              </Button>
            </Link>
          </div>
        )}

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Total Students</span>
              <Users className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.totalStudents ?? '--'}</p>
            <p className="text-[11px] text-gray-400 mt-1 truncate">Enrolled passengers</p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Active Fleet</span>
              <Bus className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.activeBuses ?? '--'}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 truncate">Operational</p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Active Drivers</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.activeDrivers ?? '--'}</p>
            <p className="text-[11px] text-gray-400 mt-1 truncate">Licensed drivers</p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Today's Trips</span>
              <CalendarCheck className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.todayTripsCount ?? '--'}</p>
            <p className="text-[11px] text-gray-400 mt-1 truncate">Morning & afternoon</p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Collected Fees</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">₹{metrics.collectedFees ?? 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 truncate">Settled payments</p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Pending Fees</span>
              <CreditCard className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.pendingFeesCount ?? '--'}</p>
            <p className="text-[11px] text-red-500 font-semibold mt-1 truncate">Due for collection</p>
          </Card>
        </div>

        {/* Live Fleet Map Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader
                title="Live Fleet Tracking Corridor"
                subtitle="Active school buses transmitting real-time coordinates"
                action={
                  <Link href="/admin/live-tracking">
                    <Button variant="outline" size="sm">
                      Full Screen Map <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                }
              />
              <CardContent className="p-3 sm:p-4">
                <LiveBusMap
                  bus={data?.liveBuses?.[0]}
                  route={data?.liveBuses?.[0]?.route}
                  stops={[
                    { id: '1', name: 'Nilambur Central', latitude: 11.2778, longitude: 76.2268, sequence: 1 },
                    { id: '2', name: 'Main Road', latitude: 11.2825, longitude: 76.2341, sequence: 2 },
                    { id: '3', name: 'Market Junction', latitude: 11.2890, longitude: 76.2415, sequence: 3 },
                    { id: '4', name: 'ABC Public School Gate', latitude: 11.2950, longitude: 76.2500, sequence: 4 },
                  ]}
                  height="h-64 sm:h-80"
                />
              </CardContent>
            </Card>

            {/* Today's Trips */}
            <Card>
              <CardHeader
                title="Today’s Scheduled & Active Trips"
                subtitle="Live status of morning and afternoon runs"
                action={
                  <Link href="/admin/trips">
                    <Button variant="outline" size="sm">
                      Manage Trips
                    </Button>
                  </Link>
                }
              />
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {(!data?.todayTrips || data.todayTrips.length === 0) ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No trips scheduled for today yet.
                    </div>
                  ) : (
                    data.todayTrips.map((trip) => (
                      <div key={trip.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-900 text-xs flex-shrink-0">
                            {trip.bus?.busNumber}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{trip.route?.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">
                              Driver: {trip.driver?.name} ({trip.driver?.mobile}) • {trip.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <Badge
                            variant={trip.status === 'ACTIVE' ? 'success' : trip.status === 'COMPLETED' ? 'default' : 'warning'}
                            size="sm"
                          >
                            {trip.status}
                          </Badge>
                          <Link href={`/admin/trips`}>
                            <Button variant="ghost" size="sm">
                              Inspect
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Fleet Manifest & Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Fleet Status Summary" subtitle="Live hardware & drivers" />
              <CardContent className="space-y-3">
                {data?.liveBuses?.map((bus) => (
                  <div
                    key={bus.id}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-gray-900">{bus.busNumber}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {bus.registrationNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {bus.driver ? `${bus.driver.name} (${bus.driver.mobile})` : 'No driver assigned'}
                      </p>
                    </div>
                    <Badge variant={bus.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {bus.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Quick Actions" subtitle="Frequent administrative tasks" />
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href="/admin/students">
                  <Button variant="outline" size="sm" className="w-full text-xs py-2.5">
                    + Enroll Student
                  </Button>
                </Link>
                <Link href="/admin/routes">
                  <Button variant="outline" size="sm" className="w-full text-xs py-2.5">
                    + Build Route
                  </Button>
                </Link>
                <Link href="/admin/bus-fees">
                  <Button variant="outline" size="sm" className="w-full text-xs py-2.5">
                    Fee Plans
                  </Button>
                </Link>
                <Link href="/admin/notifications">
                  <Button variant="outline" size="sm" className="w-full text-xs py-2.5">
                    Announcement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
