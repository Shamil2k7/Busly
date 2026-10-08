'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bus,
  Phone,
  User,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminEmergencyPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await api.get('/api/emergency');
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      showToast('Failed to load emergency alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (alertId, status) => {
    try {
      const res = await api.patch(`/api/emergency/${alertId}/status`, { status });
      if (res.success) {
        showToast(`Incident status updated to ${status}`, 'success');
        loadAlerts();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'ACKNOWLEDGED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Emergency & SOS Command Center" subtitle="Real-time Driver Incident Response" />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Active Emergency Banner */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 text-red-900 font-extrabold text-base sm:text-lg">
              <ShieldAlert className="w-7 h-7 text-red-600 animate-bounce" />
              <span>URGENT: {activeAlerts.length} ACTIVE SOS INCIDENT(S) IN PROGRESS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white border border-red-200 rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-gray-900 text-base">
                          {alert.bus?.busNumber}
                        </span>
                        <Badge variant="danger" size="sm" className="animate-pulse">
                          ACTIVE SOS
                        </Badge>
                      </div>
                      <p className="text-xs text-red-600 font-bold mt-1">"{alert.reason}"</p>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2.5 rounded-lg">
                    <p>
                      Driver: <span className="font-bold text-gray-800">{alert.driver?.name}</span>
                    </p>
                    <p className="flex items-center space-x-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{alert.driver?.mobile}</span>
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUpdateStatus(alert.id, 'ACKNOWLEDGED')}
                    >
                      Acknowledge Response
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Incidents History */}
        <Card>
          <CardHeader
            title="Incident Log & History"
            subtitle="Archive of all triggered SOS alerts and resolution audit trails"
            action={
              <Button variant="outline" size="sm" onClick={loadAlerts}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No emergency alerts reported. Fleet running smoothly.
                </div>
              ) : (
                alerts.map((a) => (
                  <div key={a.id} className="p-4 flex items-center justify-between hover:bg-gray-50/70">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          a.status === 'ACTIVE'
                            ? 'bg-red-100 text-red-600'
                            : a.status === 'ACKNOWLEDGED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {a.status === 'ACTIVE' ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {a.bus?.busNumber} ({a.bus?.registrationNumber})
                          </span>
                          <Badge
                            variant={
                              a.status === 'ACTIVE'
                                ? 'danger'
                                : a.status === 'ACKNOWLEDGED'
                                ? 'warning'
                                : 'success'
                            }
                            size="sm"
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 font-medium">"{a.reason}"</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Driver: {a.driver?.name} ({a.driver?.mobile}) • Logged:{' '}
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {a.status === 'ACTIVE' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(a.id, 'ACKNOWLEDGED')}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {a.status !== 'RESOLVED' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdateStatus(a.id, 'RESOLVED')}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
