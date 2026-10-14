import React from 'react';
import {
  Users,
  Bus,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  Navigation,
  ChevronRight,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { DEMO_FEES } from '../../data/mockData';

export default function ParentHomeScreen({ onNavigate }) {
  const { user, activeChildId, setActiveChildId, tripState } = useMobileAuth();

  const children = user?.children || [];
  const selectedChild = children.find((c) => c.id === activeChildId) || children[0];
  const pendingFee = DEMO_FEES.find((f) => f.status === 'PENDING');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_BUS':
        return { label: 'On Bus (Transit)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'PICKED_UP':
        return { label: 'Picked Up', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'DROPPED_OFF':
        return { label: 'Dropped Off Safely', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
      case 'ABSENT':
        return { label: 'Marked Absent', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'WAITING':
      default:
        return { label: 'Waiting for Bus', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  const statusBadge = getStatusBadge(selectedChild?.currentStatus || 'ON_BUS');

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      {/* Family Greeting & Multi-Child Switcher (Matching web app) */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Registered Parent
            </p>
            <h2 className="text-base font-extrabold text-white">{user?.name}</h2>
          </div>
          <span className="font-mono text-xs font-black bg-busly-primary text-slate-950 px-2.5 py-1 rounded-lg">
            {user?.familyCode}
          </span>
        </div>

        {/* Multi-Child Switcher Tabs */}
        {children.length > 1 && (
          <div className="flex space-x-2 pt-1 overflow-x-auto no-scrollbar border-t border-slate-800">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveChildId(child.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedChild?.id === child.id
                    ? 'bg-busly-primary text-slate-900 shadow font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {child.name} ({child.busNumber})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Child Transit Card (Matching web Card style) */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm p-4 space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-gray-900 text-base">{selectedChild?.name}</h3>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                Class {selectedChild?.class}-{selectedChild?.division}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned: <span className="font-bold text-gray-800">{selectedChild?.busNumber}</span>
            </p>
          </div>

          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge.bg}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Transport Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/70">
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-semibold mb-1">
              <Bus className="w-3.5 h-3.5 text-amber-500" />
              Assigned Bus
            </div>
            <p className="font-bold text-gray-900 text-sm">{selectedChild?.busNumber}</p>
            <p className="text-[10px] text-gray-500 font-mono">{selectedChild?.busRegistration}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/70">
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Pickup Stop
            </div>
            <p className="font-bold text-gray-900 text-sm truncate">{selectedChild?.pickupStopName}</p>
            <p className="text-[10px] text-amber-600 font-semibold">{selectedChild?.pickupTime}</p>
          </div>
        </div>

        {/* Driver Contact & Live Tracking Action */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onNavigate('track')}
            className="flex-1 py-2.5 rounded-xl bg-busly-primary text-slate-900 text-xs font-bold hover:bg-busly-primary-hover transition flex items-center justify-center gap-2 shadow-sm touch-press"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Track Live Bus</span>
          </button>

          <a
            href={`tel:${selectedChild?.driverMobile}`}
            className="p-2.5 rounded-xl bg-gray-100 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 flex items-center justify-center transition"
            title="Call Driver"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Live Telemetry Radar Preview */}
      <div
        onClick={() => onNavigate('track')}
        className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-amber-300 transition shadow-sm space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase text-gray-900 tracking-wider">
              Live Transit Feed
            </span>
          </div>
          <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
            <span>Speed: {tripState.speed} km/h</span>
            <ChevronRight className="w-4 h-4 text-amber-500" />
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-snug">
          Bus is currently approaching <strong className="text-gray-900">Central Hospital Stop</strong>. Next stop is your child’s boarding point.
        </p>
      </div>

      {/* Pending Fee Banner */}
      {pendingFee && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              Bus Fee Due
            </div>
            <p className="text-xs text-amber-800 font-medium mt-0.5">
              {pendingFee.billingPeriod} • ₹{pendingFee.totalAmount}
            </p>
          </div>
          <button
            onClick={() => onNavigate('fees')}
            className="px-3.5 py-1.5 rounded-xl bg-busly-primary text-slate-900 font-bold text-xs hover:bg-busly-primary-hover transition shadow-sm touch-press"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}
