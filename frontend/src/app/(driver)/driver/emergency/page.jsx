'use client';

import React, { useState } from 'react';
import { ShieldAlert, Phone, AlertTriangle } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { api } from '@/lib/api-client';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/ui/Toast';

export default function DriverEmergencyPage() {
  const { user } = useAuth();
  const { broadcastSos } = useSocket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendSos = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/emergency/sos', {
        busId: user?.assignedBus?.id || 'default-bus',
        latitude: 11.2785,
        longitude: 76.2280,
        reason: 'Driver triggered immediate emergency SOS assistance',
      });
      if (res.success) {
        broadcastSos({
          busId: user?.assignedBus?.id,
          latitude: 11.2785,
          longitude: 76.2280,
          reason: 'Driver triggered immediate emergency SOS assistance',
        });
        showToast('🚨 SOS Emergency broadcasted to School Command!', 'danger', 10000);
        setIsDialogOpen(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Emergency & SOS" subtitle="Immediate Driver Assistance Dispatch" />

      <main className="p-4 space-y-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-red-900">Emergency Protocol</h2>
          <p className="text-xs text-red-700">
            If you encounter an accident, vehicle failure, or road emergency, press the button below to dispatch immediate alert to the school administrator.
          </p>

          <Button
            variant="danger"
            size="lg"
            className="w-full text-base font-extrabold py-4 shadow-xl"
            onClick={() => setIsDialogOpen(true)}
          >
            DISPATCH SOS EMERGENCY NOW
          </Button>
        </div>

        <Card>
          <CardHeader title="Emergency Contacts" />
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-800">School Transport Officer</span>
              <span className="font-mono font-bold text-gray-900">+91 4931 220011</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-800">Police Emergency</span>
              <span className="font-mono font-bold text-red-600">112</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-gray-800">Ambulance Service</span>
              <span className="font-mono font-bold text-red-600">108</span>
            </div>
          </CardContent>
        </Card>
      </main>

      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleSendSos}
        title="Confirm Emergency SOS?"
        message="Are you certain you wish to trigger the emergency alert? School authorities will be dispatched."
        confirmText="YES, SEND SOS"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
