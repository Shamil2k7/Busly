import React from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  Phone,
  CheckCircle2,
  Flag,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function ParentLiveTrackingScreen() {
  const { user, activeChildId, tripState, fleetBuses } = useMobileAuth();
  const children = user?.children || [];
  const selectedChild = children.find((c) => c.id === activeChildId) || children[0];

  const busNumber = selectedChild?.bus?.busNumber || selectedChild?.busNumber || 'BUS 01';
  const childStopName = selectedChild?.pickupStop?.name || selectedChild?.pickupStopName || 'Nilambur Central';

  const assignedBus = fleetBuses?.find(
    (b) => b.id === selectedChild?.busId || b.busNumber === busNumber
  );
  const driverName = assignedBus?.driver?.name || selectedChild?.bus?.driver?.name || 'Rajesh Kumar';
  const driverPhone = assignedBus?.driver?.mobile || selectedChild?.bus?.driver?.mobile || '9876543211';
  const routeName = assignedBus?.route?.name || selectedChild?.bus?.route?.name || 'Nilambur Route';

  const stops = tripState.stops;
  const currentStopIdx = tripState.currentStopIndex;

  const foundIdx = stops.findIndex(
    (s) =>
      s.name?.toLowerCase() === childStopName.toLowerCase() ||
      s.name?.toLowerCase().includes(childStopName.toLowerCase().split(' ')[0])
  );
  const childStopIdx = foundIdx !== -1 ? foundIdx : 0;

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col overflow-y-auto no-scrollbar font-sans">
      {/* Telemetry HUD Banner */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-3 shrink-0 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold text-gray-900">Live Bus Telemetry</h2>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            GPS Active
          </span>
        </div>

        {/* HUD Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] text-gray-500 block font-medium">Bus</span>
            <span className="text-xs font-bold text-gray-900">{busNumber}</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] text-gray-500 block font-medium">Speed</span>
            <span className="text-xs font-bold text-gray-900">{tripState.speed} km/h</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-center">
            <span className="text-[10px] text-gray-500 block font-medium">ETA to Stop</span>
            <span className="text-xs font-bold text-emerald-600">~4 Mins</span>
          </div>
        </div>
      </div>

      {/* Corridor Map */}
      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-500" />
              Route Corridor View
            </span>
            <span className="text-[10px] text-gray-500 font-mono">{routeName}</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-44 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 320 140" className="w-full h-full">
              {/* Background Road Grid */}
              <pattern id="road-grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#road-grid-light)" />

              {/* Highway Corridor Line */}
              <path
                d="M 25 100 Q 90 25, 160 70 T 295 40"
                fill="none"
                stroke="#334155"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 25 100 Q 90 25, 160 70 T 295 40"
                fill="none"
                stroke="#F5B800"
                strokeWidth="3"
                strokeDasharray="6,6"
              />

              {/* Stops Pins along the road */}
              <circle cx="25" cy="100" r="5" fill="#10b981" />
              <circle cx="105" cy="45" r="5" fill="#10b981" />
              <circle cx="160" cy="70" r="5" fill="#F5B800" />
              <circle cx="225" cy="75" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
              <circle cx="295" cy="40" r="5" fill="#64748b" />

              {/* Animated Live Bus Pin */}
              <g transform="translate(160, 70)">
                <circle cx="0" cy="0" r="14" fill="#F5B800" opacity="0.35" className="animate-radar" />
                <circle cx="0" cy="0" r="8" fill="#111827" stroke="#F5B800" strokeWidth="2.5" />
                <text x="0" y="3" fontSize="8" textAnchor="middle" fill="#F5B800" fontWeight="bold">
                  🚌
                </text>
              </g>

              {/* Child's Designated Stop Callout */}
              <g transform="translate(225, 55)">
                <rect x="-35" y="-18" width="70" height="15" rx="4" fill="#111827" stroke="#ef4444" strokeWidth="1" />
                <text x="0" y="-8" fontSize="8" textAnchor="middle" fill="#fff" fontWeight="bold">
                  Child's Stop
                </text>
              </g>
            </svg>

            {/* Quick Map Legend */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-slate-300 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Passed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Live Bus
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Child Stop
              </span>
            </div>
          </div>
        </div>

        {/* Station-by-Station Timeline ("Where is my train" style) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Route Progress & Stations
          </h3>

          <div className="space-y-0 relative pl-2">
            {/* Timeline Vertical Spine */}
            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200" />

            {stops.map((stop, idx) => {
              const isPassed = idx < currentStopIdx;
              const isCurrent = idx === currentStopIdx;
              const isChildStop = idx === childStopIdx;

              return (
                <div key={stop.id} className="relative flex items-start gap-3 py-2.5">
                  {/* Indicator Icon */}
                  <div className="relative z-10 flex items-center justify-center">
                    {isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-busly-primary text-slate-900 flex items-center justify-center shadow-md font-bold text-[10px] ring-2 ring-white">
                        🚌
                      </div>
                    ) : isPassed ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    ) : isChildStop ? (
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300 animate-pulse">
                        <Flag className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold border border-gray-200">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Stop Information */}
                  <div className="flex-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isChildStop
                              ? 'text-rose-700'
                              : isCurrent
                              ? 'text-gray-900'
                              : isPassed
                              ? 'text-gray-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {stop.name}
                        </span>
                        {isChildStop && (
                          <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                            Child Stop
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {isPassed
                          ? 'Departed on time'
                          : isCurrent
                          ? `At stop • Speed ${tripState.speed} km/h`
                          : `Scheduled ${stop.eta}`}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-gray-500 font-bold">
                      {stop.eta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency / Dispatch Quick Dial */}
        <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
          <div>
            <p className="font-bold text-gray-900">Transport Coordinator</p>
            <p className="text-[10px] text-gray-500">Driver: {driverName} (+91 {driverPhone})</p>
          </div>
          <a
            href={`tel:${driverPhone}`}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-emerald-700 font-bold border border-gray-300 flex items-center gap-1 transition"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        </div>
      </div>
    </div>
  );
}
