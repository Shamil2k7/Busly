'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bus, MapPin, Phone, Clock, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LiveBusMap from '@/components/maps/LiveBusMap';
import { api } from '@/lib/api-client';
import { useSocket } from '@/context/SocketContext';

export default function ParentLiveTrackingPage() {
  const { subscribeToBus, unsubscribeFromBus, busLocations } = useSocket();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get('/api/reports/dashboard/parent');
      if (res.success && res.data.children?.length > 0) {
        setChildren(res.data.children);
        setSelectedChildId(res.data.children[0].id);
        if (res.data.children[0].busId) {
          subscribeToBus(res.data.children[0].busId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (selectedChild?.busId) {
        unsubscribeFromBus(selectedChild.busId);
      }
    };
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId) || children[0];
  const bus = selectedChild?.bus;
  const busTelemetry = bus?.id ? busLocations[bus.id] : null;

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Live Bus Tracking"
        subtitle={selectedChild ? `Tracking ${selectedChild.name}'s Bus` : 'School Transport'}
        rightAction={
          <Link href="/parent/home">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        {/* Sibling Child Selector if multiple children */}
        {children.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedChildId(c.id);
                  if (c.busId) subscribeToBus(c.busId);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedChild?.id === c.id
                    ? 'bg-busly-dark text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {c.name} ({c.bus?.busNumber || 'No Bus'})
              </button>
            ))}
          </div>
        )}

        {/* Live Route Transit Timeline */}
        <LiveBusMap
          bus={bus}
          route={bus?.route}
          stops={bus?.route?.stops || []}
          height="max-h-[500px]"
        />

        {/* Driver Card & Route Stop Info */}
        {bus && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">
                  {bus.busNumber} ({bus.registrationNumber})
                </h4>
                <p className="text-xs text-gray-500">
                  Driver: <span className="font-semibold text-gray-800">{bus.driver?.name || 'Assigned Driver'}</span>
                </p>
              </div>

              {bus.driver?.mobile && (
                <a href={`tel:${bus.driver.mobile}`}>
                  <Button variant="primary" size="sm" className="font-bold">
                    <Phone className="w-3.5 h-3.5 mr-1" /> Call Driver
                  </Button>
                </a>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup Stop:</span>
                <span className="font-bold text-gray-900">
                  {selectedChild?.pickupStop?.name || 'School Gate'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled Arrival:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {selectedChild?.pickupStop?.estimatedArrival || '07:45 AM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Status:</span>
                <Badge variant="success" size="sm">
                  Live on Route
                </Badge>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
