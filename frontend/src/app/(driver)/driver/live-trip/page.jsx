'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  ArrowLeft,
  Radio,
  Play,
  Square,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LiveBusMap from '@/components/maps/LiveBusMap';
import { api } from '@/lib/api-client';
import { useSocket } from '@/context/SocketContext';
import { showToast } from '@/components/ui/Toast';

export default function DriverLiveTripPage() {
  const router = useRouter();
  const { broadcastLocation, broadcastSos } = useSocket();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // GPS Simulation State
  const [isSimulatingGps, setIsSimulatingGps] = useState(true);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);

  // SOS modal
  const [isSosDialogOpen, setIsSosDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  const loadActiveTrip = async () => {
    try {
      const res = await api.get('/api/trips/active/driver');
      if (res.success && res.data) {
        setTrip(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveTrip();
  }, []);

  // Periodic GPS Telemetry Broadcast
  useEffect(() => {
    if (!trip || trip.status !== 'ACTIVE' || !isSimulatingGps) return;

    const stops = trip.route?.stops || [
      { latitude: 11.2785, longitude: 76.2280 },
      { latitude: 11.2840, longitude: 76.2360 },
      { latitude: 11.2910, longitude: 76.2440 },
    ];

    const interval = setInterval(() => {
      setCurrentWaypointIdx((prev) => {
        const nextIdx = (prev + 1) % stops.length;
        const targetStop = stops[nextIdx];

        // Add tiny random jitter to simulate moving vehicle
        const jitterLat = (Math.random() - 0.5) * 0.002;
        const jitterLng = (Math.random() - 0.5) * 0.002;
        const lat = targetStop.latitude + jitterLat;
        const lng = targetStop.longitude + jitterLng;

        broadcastLocation({
          busId: trip.busId,
          tripId: trip.id,
          latitude: lat,
          longitude: lng,
          speed: 38 + Math.floor(Math.random() * 8),
          heading: 45,
        });

        return nextIdx;
      });
    }, 4000); // Every 4s

    return () => clearInterval(interval);
  }, [trip, isSimulatingGps]);

  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      const res = await api.post(`/api/trips/${trip.id}/student-status`, {
        studentId,
        status: newStatus,
      });
      if (res.success) {
        showToast(`Student status updated to ${newStatus.replace('_', ' ')}`, 'success');
        // Update local state
        setTrip((prev) => {
          if (!prev) return prev;
          const updatedStatuses = prev.studentStatuses.map((st) =>
            st.studentId === studentId ? { ...st, status: newStatus } : st
          );
          return { ...prev, studentStatuses: updatedStatuses };
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEndTrip = async () => {
    try {
      const res = await api.post(`/api/trips/${trip.id}/end`, {});
      if (res.success) {
        showToast('Trip ended and logged successfully', 'success');
        setIsEndDialogOpen(false);
        router.push('/driver/dashboard');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendSos = async () => {
    try {
      const res = await api.post('/api/emergency/sos', {
        busId: trip.busId,
        tripId: trip.id,
        latitude: 11.2785,
        longitude: 76.2280,
        reason: 'Driver triggered urgent SOS in live run',
      });
      if (res.success) {
        broadcastSos({
          busId: trip.busId,
          tripId: trip.id,
          latitude: 11.2785,
          longitude: 76.2280,
          reason: 'Driver triggered urgent SOS in live run',
        });
        showToast('🚨 SOS Emergency broadcasted!', 'danger');
        setIsSosDialogOpen(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-gray-500">Loading trip cockpit...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex-1 flex flex-col p-6 text-center justify-center space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">No Live Trip Active</h3>
        <p className="text-xs text-gray-500">
          Start a trip from your Dashboard to begin live location sharing.
        </p>
        <Link href="/driver/dashboard">
          <Button variant="primary">Return to Cockpit</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title={`${trip.bus?.busNumber} Live Run`}
        subtitle={`Route: ${trip.route?.name}`}
        rightAction={
          <button
            onClick={() => setIsSosDialogOpen(true)}
            className="p-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
          >
            SOS
          </button>
        }
      />

      <main className="p-4 space-y-4">
        {/* GPS Broadcast Status Banner */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>GPS Telemetry Broadcasting</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </p>
              <p className="text-[11px] text-slate-400">
                Transmitting coordinates to Parents & School Admin
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulatingGps(!isSimulatingGps)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
              isSimulatingGps ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {isSimulatingGps ? 'GPS ON' : 'PAUSED'}
          </button>
        </div>

        {/* Live Rapido / Google Maps Navigation Corridor */}
        <LiveBusMap
          bus={trip.bus}
          route={trip.route}
          stops={trip.route?.stops || []}
          activeTrip={trip}
          height="h-[320px] sm:h-[380px]"
        />

        {/* Student Passenger Manifest */}
        <Card>
          <CardHeader
            title="Passenger Boarding Roster"
            subtitle="Tap to update student boarding state"
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {(!trip.studentStatuses || trip.studentStatuses.length === 0) ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No students assigned to this bus run.
                </div>
              ) : (
                trip.studentStatuses.map((st) => {
                  const student = st.student;
                  const status = st.status;

                  return (
                    <div key={st.id} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                            {student?.name}
                          </h4>
                          <p className="text-[11px] text-gray-500">
                            Class {student?.class}-{student?.division} • Stop:{' '}
                            <span className="font-semibold text-gray-700">
                              {trip.type === 'MORNING'
                                ? student?.pickupStop?.name || 'Assigned Stop'
                                : student?.dropStop?.name || 'Assigned Stop'}
                            </span>
                          </p>
                        </div>
                        <Badge
                          variant={
                            status === 'PICKED_UP'
                              ? 'info'
                              : status === 'DROPPED_OFF'
                              ? 'success'
                              : status === 'ABSENT'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* One-Tap Action Buttons */}
                      <div className="flex space-x-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentStatus(st.studentId, 'PICKED_UP')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            status === 'PICKED_UP'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Picked Up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentStatus(st.studentId, 'DROPPED_OFF')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            status === 'DROPPED_OFF'
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Dropped Off
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentStatus(st.studentId, 'ABSENT')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            status === 'ABSENT'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* End Trip Button */}
        <div className="pt-2">
          <Button
            variant="dark"
            size="lg"
            className="w-full font-bold shadow"
            onClick={() => setIsEndDialogOpen(true)}
          >
            <Square className="w-4 h-4 mr-2" /> END TODAY'S TRIP
          </Button>
        </div>
      </main>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={isEndDialogOpen}
        onClose={() => setIsEndDialogOpen(false)}
        onConfirm={handleEndTrip}
        title="End Trip Run?"
        message="This will conclude location broadcasting and mark today's trip as completed."
        confirmText="Yes, Complete Trip"
        cancelText="Keep Driving"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={isSosDialogOpen}
        onClose={() => setIsSosDialogOpen(false)}
        onConfirm={handleSendSos}
        title="Trigger Emergency SOS?"
        message="This will immediately dispatch urgent coordinates to School Administration."
        confirmText="YES, SEND SOS"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
