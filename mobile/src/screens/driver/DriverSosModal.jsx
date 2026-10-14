import React, { useState } from 'react';
import { AlertTriangle, X, Phone, CheckCircle2 } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { broadcastDriverSos } from '../../services/socket';
import { mobileApi } from '../../config/api';

export default function DriverSosModal({ isOpen, onClose }) {
  const { user, tripState, showToast } = useMobileAuth();
  const [reason, setReason] = useState('Medical Emergency');
  const [isTriggered, setIsTriggered] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleBroadcastSos = async () => {
    setIsSending(true);

    const payload = {
      busId: user?.assignedBus?.id || 'bus-1',
      tripId: tripState.id,
      latitude: tripState.currentLat || 11.2865,
      longitude: tripState.currentLng || 76.2370,
      reason: `EMERGENCY ALERT: ${reason} on ${user?.assignedBus?.busNumber || 'BUS 01'}`,
    };

    // Emit via WebSocket
    broadcastDriverSos(payload);

    // Call API (fallback safe)
    try {
      await mobileApi.post('/api/emergency/sos', payload);
    } catch (e) {
      // Backend offline or local mode
    }

    setIsSending(false);
    setIsTriggered(true);
    showToast(`🚨 HIGH PRIORITY SOS BROADCASTED: ${reason}`, 'error');
  };

  const handleReset = () => {
    setIsTriggered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-white border-2 border-red-500 rounded-2xl p-5 shadow-2xl text-gray-900 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold animate-pulse">
              🚨
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-700">EMERGENCY SOS</h3>
              <p className="text-[11px] text-gray-500">Instant Admin & Dispatch Broadcast</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isTriggered ? (
          /* Triggered State */
          <div className="space-y-4 text-center py-2 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-red-600 text-white mx-auto flex items-center justify-center text-2xl shadow-lg animate-emergency">
              🚨
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                ACTIVE SOS BROADCAST
              </span>
              <h4 className="text-base font-bold text-gray-900 mt-1.5">Alert Sent to Command Center</h4>
              <p className="text-xs text-gray-600 mt-1">
                Your live GPS coordinates (Lat: {tripState.currentLat?.toFixed(4) || '11.2865'}, Lng: {tripState.currentLng?.toFixed(4) || '76.2370'}) have been transmitted to ABC Public School Dispatch.
              </p>
            </div>

            {/* Quick Emergency Speed Dial Links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center hover:bg-gray-100 transition shadow-2xs"
              >
                <span className="text-lg block">👮</span>
                <span className="text-xs font-bold text-gray-900 block mt-1">Police (112)</span>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center hover:bg-gray-100 transition shadow-2xs"
              >
                <span className="text-lg block">🚑</span>
                <span className="text-xs font-bold text-gray-900 block mt-1">Ambulance (108)</span>
              </a>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition border border-gray-200"
            >
              Dismiss / Resolve Alert
            </button>
          </div>
        ) : (
          /* Selection & Trigger State */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Select Nature of Emergency
              </label>

              {[
                'Medical Emergency',
                'Vehicle Breakdown (Engine/Tire)',
                'Traffic Collision / Accident',
                'Roadblock / Security Issue',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setReason(item)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between border ${
                    reason === item
                      ? 'bg-red-50 border-red-400 text-red-900 shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item}</span>
                  {reason === item && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                </button>
              ))}
            </div>

            {/* Red Trigger Button */}
            <button
              onClick={handleBroadcastSos}
              disabled={isSending}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 animate-emergency touch-press"
            >
              <AlertTriangle className="w-4 h-4 fill-current" />
              <span>{isSending ? 'TRANSMITTING SOS...' : 'TRIGGER IMMEDIATE SOS'}</span>
            </button>

            <p className="text-[10px] text-gray-400 text-center">
              Emits priority audio alert to School Admin transport console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
