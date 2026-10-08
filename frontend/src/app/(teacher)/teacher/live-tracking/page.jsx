'use client';

import React, { useState, useEffect } from 'react';
import MobileHeader from '@/components/navigation/MobileHeader';
import LiveBusMap from '@/components/maps/LiveBusMap';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api-client';

export default function TeacherLiveTrackingPage() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/buses');
        if (res.success && res.data.length > 0) {
          setBuses(res.data);
          setSelectedBus(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Live Bus Tracking" subtitle="Real-time School Fleet Telemetry" />

      <main className="p-4 space-y-4">
        {/* Bus Selector */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {buses.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBus(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedBus?.id === b.id
                  ? 'bg-busly-dark text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {b.busNumber}
            </button>
          ))}
        </div>

        <LiveBusMap
          bus={selectedBus}
          route={selectedBus?.route}
          stops={selectedBus?.route?.stops || []}
          height="h-[460px]"
        />
      </main>
    </div>
  );
}
