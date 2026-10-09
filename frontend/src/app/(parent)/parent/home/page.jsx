'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Bus,
  MapPin,
  Clock,
  CreditCard,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Phone,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

export default function ParentHomePage() {
  const { user } = useAuth();
  const { busLocations } = useSocket();
  const [data, setData] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const [dashRes, feesRes] = await Promise.all([
        api.get('/api/reports/dashboard/parent'),
        api.get('/api/fees/students?status=PENDING'),
      ]);
      if (dashRes.success) {
        setData(dashRes.data);
        if (!selectedChildId && dashRes.data.children?.length > 0) {
          setSelectedChildId(dashRes.data.children[0].id);
        }
      }
      if (feesRes.success) {
        setPendingFees(feesRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const children = data?.children || [];
  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];
  const bus = selectedChild?.bus;
  const busTelemetry = bus?.id ? busLocations[bus.id] : null;

  // Total pending fee amount for all children in this family
  const totalPendingFee = pendingFees.reduce((acc, f) => acc + f.totalAmount, 0);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title={`Family ${user?.familyCode || 'FAM'}`}
        subtitle={user?.schoolName || 'ABC Public School'}
      />

      <main className="p-4 space-y-4">
        {/* Family Greeting & Multi-Child Switcher */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Registered Parent
              </p>
              <h2 className="text-base font-extrabold text-white">{user?.name}</h2>
            </div>
            <span className="font-mono text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg">
              {user?.familyCode}
            </span>
          </div>

          {/* Child Tabs */}
          {children.length > 1 && (
            <div className="flex space-x-2 pt-1 overflow-x-auto">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-busly-primary text-slate-900 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {child.name} (Class {child.class})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Child Live Transit Status Card */}
        {selectedChild && (
          <Card className="border-amber-200/80 shadow-md">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-gray-900 text-base">
                      {selectedChild.name}
                    </h3>
                    <Badge variant="primary" size="sm">
                      Class {selectedChild.class}-{selectedChild.division}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Assigned: <span className="font-bold text-gray-800">{bus?.busNumber || 'Fleet Bus'}</span>
                  </p>
                </div>

                <Badge
                  variant={
                    selectedChild.tripStatuses?.[0]?.status === 'PICKED_UP'
                      ? 'info'
                      : selectedChild.tripStatuses?.[0]?.status === 'DROPPED_OFF'
                      ? 'success'
                      : 'warning'
                  }
                  size="md"
                >
                  {selectedChild.tripStatuses?.[0]?.status?.replace('_', ' ') || 'WAITING'}
                </Badge>
              </div>

              {/* Transit Telemetry Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Pickup Stop:</span>
                    <span className="font-bold text-gray-900">
                      {selectedChild.pickupStop?.name || 'Main Road Junction'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-500 text-[11px]">
                      {selectedChild.pickupStop?.estimatedArrival || '07:45 AM'}
                    </span>
                    <Link
                      href="/parent/children"
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline"
                      title="Edit pickup stop"
                    >
                      Change
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/40">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Drop Stop:</span>
                    <span className="font-bold text-gray-900">
                      {selectedChild.dropStop?.name || 'School Gate'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-gray-500 text-[11px]">
                      {selectedChild.dropStop?.estimatedArrival || '03:45 PM'}
                    </span>
                    <Link
                      href="/parent/children"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                      title="Edit drop stop"
                    >
                      Change
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/40">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Live Bus ETA:</span>
                    <span className="font-bold text-emerald-700">
                      {busTelemetry ? 'Approaching Stop (~4 mins)' : 'En Route to Stop'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-500 text-[11px]">
                    {busTelemetry ? `${busTelemetry.speed?.toFixed(0) || 35} km/h` : '35 km/h'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-1">
                <Link href={`/parent/live-tracking`} className="flex-1">
                  <Button variant="primary" size="md" className="w-full font-bold shadow-sm">
                    <Navigation className="w-4 h-4 mr-1.5" /> Track Bus Live
                  </Button>
                </Link>

                {bus?.driver?.mobile && (
                  <a href={`tel:${bus.driver.mobile}`} className="flex-shrink-0">
                    <Button variant="outline" size="md" title="Call Driver">
                      <Phone className="w-4 h-4 text-gray-700" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bus Fee Due Banner if any */}
        {totalPendingFee > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Transport Fee Due
              </span>
              <p className="font-black text-lg text-red-900 mt-0.5">
                ₹{totalPendingFee}
              </p>
              <p className="text-[11px] text-red-700">
                {pendingFees.length} invoice(s) pending payment
              </p>
            </div>
            <Link href="/parent/bus-fees">
              <Button variant="danger" size="sm" className="font-bold">
                Pay Fees <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Features Row */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/parent/children">
            <Card className="p-3.5 hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-amber-500 mb-1" />
              <h4 className="font-bold text-gray-900 text-xs">Children Profiles</h4>
              <p className="text-[10px] text-gray-500">Stops, class & passes</p>
            </Card>
          </Link>

          <Link href="/parent/payment-history">
            <Card className="p-3.5 hover:bg-gray-50 transition-colors">
              <CreditCard className="w-5 h-5 text-emerald-600 mb-1" />
              <h4 className="font-bold text-gray-900 text-xs">Payment Receipts</h4>
              <p className="text-[10px] text-gray-500">Download past receipts</p>
            </Card>
          </Link>
        </div>

        {/* Recent Notifications for this family */}
        <Card>
          <CardHeader title="Transit Activity Feed" subtitle="Boarding alerts and notices" />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {(!data?.recentNotifications || data.recentNotifications.length === 0) ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No notifications yet.
                </div>
              ) : (
                data.recentNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bus className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900">{n.title}</p>
                      <p className="text-[11px] text-gray-600 leading-snug mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
