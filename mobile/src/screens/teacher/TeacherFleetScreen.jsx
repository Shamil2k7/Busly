import React, { useState } from 'react';
import { Phone, RefreshCw, Bus, Navigation } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function TeacherFleetScreen() {
  const { fleetBuses, loadFleet, tripState } = useMobileAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFleet();
    setTimeout(() => setRefreshing(false), 600);
  };

  // Fallback buses if backend returns empty or loading
  const displayBuses = fleetBuses && fleetBuses.length > 0 ? fleetBuses : [
    {
      id: 'bus-1',
      busNumber: 'BUS 01',
      registrationNumber: 'KL-10-AZ-1001',
      capacity: 35,
      driver: { name: 'Rajesh Kumar', mobile: '9876543211' },
      route: { name: 'Nilambur Route' },
      status: 'ACTIVE',
      _count: { students: 8 },
    },
    {
      id: 'bus-2',
      busNumber: 'BUS 02',
      registrationNumber: 'KL-10-AZ-2002',
      capacity: 30,
      driver: { name: 'Vishnu Kumar', mobile: '9876543212' },
      route: { name: 'Town Route' },
      status: 'ACTIVE',
      _count: { students: 1 },
    },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Live Fleet Monitor
          </h3>
          <p className="text-[11px] text-gray-500">Active buses transporting students</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 shadow-2xs transition ${
              refreshing ? 'animate-spin text-amber-600' : ''
            }`}
            title="Refresh Fleet"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {displayBuses.length} {displayBuses.length === 1 ? 'Bus' : 'Buses'} Active
          </span>
        </div>
      </div>

      {/* Dynamic Bus Cards */}
      <div className="space-y-3">
        {displayBuses.map((bus, idx) => {
          const isPrimaryBus = bus.busNumber?.includes('01') || idx === 0;
          const speed = bus.locationLogs?.[0]?.speed != null
            ? `${bus.locationLogs[0].speed} km/h`
            : isPrimaryBus
            ? `${tripState.speed} km/h`
            : '0 km/h (Stationary)';

          const currentLocation = isPrimaryBus
            ? (tripState.stops[tripState.currentStopIndex]?.name || bus.route?.stops?.[0]?.name || 'Nilambur Central')
            : (bus.route?.stops?.[0]?.name || 'Town Bus Terminal');

          const driverName = bus.driver?.name || 'Assigned Driver';
          const driverPhone = bus.driver?.mobile || '9876543211';
          const busNumShort = bus.busNumber?.replace(/[^0-9]/g, '') || `0${idx + 1}`;

          return (
            <div
              key={bus.id || idx}
              className="bg-white border border-gray-200/80 rounded-xl p-4 space-y-3 shadow-sm transition hover:border-gray-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs ${
                      isPrimaryBus
                        ? 'bg-busly-primary text-slate-900'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {busNumShort}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      {bus.busNumber} • {bus.route?.name || 'School Route'}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {bus.registrationNumber || 'KL-10-AZ-1001'} • Cap {bus.capacity || 30} •{' '}
                      <span className="text-gray-700 font-semibold">{bus._count?.students ?? '—'} Enrolled</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full">
                  {bus.status || 'ACTIVE'}
                </span>
              </div>

              {/* Telemetry info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block font-medium">Speed</span>
                  <span
                    className={`text-sm font-black ${
                      isPrimaryBus ? 'text-amber-600 font-mono' : 'text-gray-600'
                    }`}
                  >
                    {speed}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <span className="text-[10px] text-gray-500 block font-medium">Current Location</span>
                  <span className="text-xs font-bold text-gray-900 truncate block">
                    {currentLocation}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-[11px] text-gray-600">
                  Driver: <strong className="text-gray-900">{driverName}</strong>
                </div>
                <a
                  href={`tel:${driverPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-emerald-700 font-bold border border-gray-300 flex items-center gap-1 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
