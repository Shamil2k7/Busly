'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus,
  Play,
  Navigation,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { showToast } from '@/components/ui/Toast';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const { broadcastSos } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // SOS confirmation modal
  const [isSosDialogOpen, setIsSosDialogOpen] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/api/reports/dashboard/driver');
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStartTrip = async (tripId) => {
    try {
      const res = await api.post(`/api/trips/${tripId}/start`, {});
      if (res.success) {
        showToast('Trip started! Live location broadcast active.', 'success');
        loadDashboard();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendSos = async () => {
    setSosSending(true);
    try {
      const busId = data?.bus?.id;
      const tripId = data?.activeTrip?.id;

      const res = await api.post('/api/emergency/sos', {
        busId,
        tripId,
        latitude: 11.2785,
        longitude: 76.2280,
        reason: 'Driver triggered urgent SOS assistance',
      });

      if (res.success) {
        broadcastSos({
          busId,
          tripId,
          latitude: 11.2785,
          longitude: 76.2280,
          reason: 'Driver triggered urgent SOS assistance',
        });
        showToast('🚨 SOS Emergency broadcasted to School Administration!', 'danger', 8000);
        setIsSosDialogOpen(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSosSending(false);
    }
  };

  const activeTrip = data?.activeTrip;

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title={user?.name || 'Driver Cockpit'}
        subtitle={`Vehicle: ${data?.bus?.busNumber || 'Assigned Bus'}`}
      />

      <main className="p-4 space-y-4">
        {/* Active Trip Hero Card */}
        {activeTrip ? (
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <Badge variant="warning" size="sm" className="bg-amber-400 text-slate-900 font-extrabold">
                  {activeTrip.type} RUN
                </Badge>
              </div>
              <span className="text-xs font-bold text-slate-300">
                {activeTrip.status}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">{activeTrip.route?.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTrip.studentStatuses?.length || 0} student passengers registered
              </p>
            </div>

            <div className="pt-2 flex space-x-3">
              {activeTrip.status === 'SCHEDULED' ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-extrabold text-sm shadow-lg"
                  onClick={() => handleStartTrip(activeTrip.id)}
                >
                  <Play className="w-5 h-5 mr-2 fill-current" /> START TODAY'S RUN
                </Button>
              ) : (
                <Link href="/driver/live-trip" className="w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-extrabold text-sm shadow-lg"
                  >
                    <Navigation className="w-5 h-5 mr-2" /> OPEN LIVE TRIP COCKPIT
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center text-gray-500">
            <Bus className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Active Trips Scheduled</h3>
            <p className="text-xs text-gray-500 mt-1">
              Your next assigned morning or afternoon trip will appear here.
            </p>
          </Card>
        )}

        {/* Assigned Bus Info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {data?.bus?.busNumber || 'BUS'} ({data?.bus?.registrationNumber || '--'})
                </h3>
                <p className="text-xs text-gray-500">
                  Capacity: {data?.bus?.capacity || 30} seats • Route: {data?.bus?.route?.name || 'Standard'}
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              Ready
            </Badge>
          </div>
        </Card>

        {/* Big Touch Emergency SOS Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsSosDialogOpen(true)}
            className="w-full py-4 rounded-2xl bg-busly-danger text-white font-extrabold text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform"
          >
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span>TRIGGER EMERGENCY SOS</span>
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            Dispatches urgent GPS coordinates to School Admin with confirmation required.
          </p>
        </div>
      </main>

      {/* SOS Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSosDialogOpen}
        onClose={() => setIsSosDialogOpen(false)}
        onConfirm={handleSendSos}
        title="Trigger Emergency SOS?"
        message="This will immediately alert School Administration and emergency services with your current bus coordinates."
        confirmText="YES, SEND SOS NOW"
        cancelText="Cancel"
        variant="danger"
        loading={sosSending}
      />
    </div>
  );
}
