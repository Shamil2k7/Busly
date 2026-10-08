'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Play, CheckCircle2, Bus, Route, Clock, Users } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminTripsPage() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    busId: '',
    routeId: '',
    type: 'MORNING',
  });

  const loadData = async () => {
    try {
      const [tRes, bRes, rRes] = await Promise.all([
        api.get('/api/trips'),
        api.get('/api/buses'),
        api.get('/api/routes'),
      ]);
      if (tRes.success) setTrips(tRes.data);
      if (bRes.success) setBuses(bRes.data);
      if (rRes.success) setRoutes(rRes.data);
    } catch (err) {
      showToast('Failed to load trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/trips', form);
      if (res.success) {
        showToast('Trip scheduled successfully', 'success');
        setIsModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStartTrip = async (id) => {
    try {
      const res = await api.post(`/api/trips/${id}/start`, {});
      if (res.success) {
        showToast('Trip started! Live tracking broadcast active.', 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEndTrip = async (id) => {
    try {
      const res = await api.post(`/api/trips/${id}/end`, {});
      if (res.success) {
        showToast('Trip marked completed.', 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Trip Management" subtitle="Schedule, Monitor & Close Bus Runs" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Trips Logged: {trips.length}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({
                busId: buses[0]?.id || '',
                routeId: routes[0]?.id || '',
                type: 'MORNING',
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Schedule Trip
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bus & Run</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Scheduled Start</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No trips found. Schedule a trip to begin operations.
                    </td>
                  </tr>
                ) : (
                  trips.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{t.bus?.busNumber}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {t.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {t.bus?.registrationNumber}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {t.route?.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800">{t.driver?.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{t.driver?.mobile}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                        {t.scheduledStart ? new Date(t.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            t.status === 'ACTIVE'
                              ? 'success'
                              : t.status === 'COMPLETED'
                              ? 'default'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {t.status === 'SCHEDULED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartTrip(t.id)}
                          >
                            <Play className="w-3.5 h-3.5 mr-1" /> Start
                          </Button>
                        )}
                        {t.status === 'ACTIVE' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleEndTrip(t.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Schedule Trip Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Bus Trip"
        subtitle="Create a morning or afternoon transport run"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Assigned Bus"
            value={form.busId}
            onChange={(e) => setForm({ ...form, busId: e.target.value })}
            required
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.busNumber} ({b.registrationNumber})
              </option>
            ))}
          </Select>

          <Select
            label="Route"
            value={form.routeId}
            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
            required
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>

          <Select
            label="Trip Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'MORNING', label: 'MORNING (Pickup to School)' },
              { value: 'AFTERNOON', label: 'AFTERNOON (Drop to Home)' },
            ]}
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Run
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
