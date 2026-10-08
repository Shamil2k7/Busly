'use client';

import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Navigation, Phone, ShieldAlert, Radio, RefreshCw } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LiveBusMap from '@/components/maps/LiveBusMap';
import { api } from '@/lib/api-client';
import { useSocket } from '@/context/SocketContext';

export default function AdminLiveTrackingPage() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { busLocations } = useSocket();

  const loadFleet = async () => {
    try {
      const res = await api.get('/api/buses');
      if (res.success && res.data) {
        setBuses(res.data);
        if (!selectedBusId && res.data.length > 0) {
          setSelectedBusId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0];
  const busTelemetry = selectedBus?.id ? busLocations[selectedBus.id] : null;

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Live Fleet Telemetry Command" subtitle="Real-Time Bus GPS Tracking" />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Bus Selector Bar */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1">
          {buses.map((bus) => {
            const isSelected = bus.id === selectedBus?.id;
            const liveData = busLocations[bus.id];

            return (
              <button
                key={bus.id}
                onClick={() => setSelectedBusId(bus.id)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-busly-dark text-white border-busly-dark shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-busly-primary text-busly-dark' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p>{bus.busNumber}</p>
                  <p className="text-[10px] text-gray-400 font-normal">
                    {liveData ? `${liveData.speed?.toFixed(0) || 0} km/h • Live` : 'Transmitting'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Map Display */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <LiveBusMap
              bus={selectedBus}
              route={selectedBus?.route}
              stops={selectedBus?.route?.stops || []}
              height="h-[520px]"
            />
          </div>

          {/* Bus Telemetry Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Vehicle Telemetry" subtitle={selectedBus?.registrationNumber} />
              <CardContent className="space-y-3 text-xs sm:text-sm">
                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant="success" size="sm">
                      {selectedBus?.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speed</span>
                    <span className="font-bold text-gray-900">
                      {busTelemetry?.speed ? `${busTelemetry.speed.toFixed(0)} km/h` : '35 km/h'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-bold text-gray-900">
                      {selectedBus?.capacity || 30} seats
                    </span>
                  </div>
                </div>

                {/* Driver Contact */}
                {selectedBus?.driver && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-2">
                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                      Assigned Driver
                    </p>
                    <p className="font-bold text-gray-900">{selectedBus.driver.name}</p>
                    <p className="text-gray-600 flex items-center space-x-1 font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{selectedBus.driver.mobile}</span>
                    </p>
                  </div>
                )}

                {/* Route stops list */}
                {selectedBus?.route?.stops && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Route Stops ({selectedBus.route.stops.length})
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {selectedBus.route.stops.map((s, idx) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-gray-800 truncate">{s.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {s.estimatedArrival || '--'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
