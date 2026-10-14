import React from 'react';
import { Phone } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function TeacherFleetScreen() {
  const { tripState } = useMobileAuth();

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Live Fleet Monitor
          </h3>
          <p className="text-[11px] text-gray-500">Active buses transporting students</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          2 Buses Active
        </span>
      </div>

      {/* Bus 01 Fleet Card */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-busly-primary text-slate-900 flex items-center justify-center font-black text-sm shadow-2xs">
              01
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">BUS 01 • Nilambur Route</h4>
              <p className="text-[10px] text-gray-500 font-mono">KL-10-AZ-1001 • Capacity 32</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">
            LIVE TRANSIT
          </span>
        </div>

        {/* Telemetry info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-500 block font-medium">Speed</span>
            <span className="text-sm font-black text-amber-600">{tripState.speed} km/h</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-500 block font-medium">Current Location</span>
            <span className="text-xs font-bold text-gray-900 truncate block">
              {tripState.stops[tripState.currentStopIndex]?.name || 'Central Hospital'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="text-[11px] text-gray-600">
            Driver: <strong className="text-gray-900">Rajesh Kumar</strong>
          </div>
          <a
            href="tel:+919876543211"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-emerald-700 font-bold border border-gray-300 flex items-center gap-1 transition"
          >
            <Phone className="w-3.5 h-3.5" /> Call Driver
          </a>
        </div>
      </div>

      {/* Bus 02 Fleet Card */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-black text-sm border border-gray-200">
              02
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">BUS 02 • Town Church Route</h4>
              <p className="text-[10px] text-gray-500 font-mono">KL-10-AZ-1002 • Capacity 30</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
            BOARDING
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-500 block font-medium">Speed</span>
            <span className="text-sm font-bold text-gray-500">0 km/h (Stationary)</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="text-[10px] text-gray-500 block font-medium">Current Location</span>
            <span className="text-xs font-bold text-gray-900 truncate block">Town Church Junction</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="text-[11px] text-gray-600">
            Driver: <strong className="text-gray-900">Suresh Babu</strong>
          </div>
          <a
            href="tel:+919876543212"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-emerald-700 font-bold border border-gray-300 flex items-center gap-1 transition"
          >
            <Phone className="w-3.5 h-3.5" /> Call Driver
          </a>
        </div>
      </div>
    </div>
  );
}
