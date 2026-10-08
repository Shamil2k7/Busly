'use client';

import React, { useState, useEffect } from 'react';
import { Bus, Plus, Users, UserCheck, Route, Trash2, Edit } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminBusesPage() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: '30',
    driverId: '',
    routeId: '',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    try {
      const [bRes, dRes, rRes] = await Promise.all([
        api.get('/api/buses'),
        api.get('/api/drivers'),
        api.get('/api/routes'),
      ]);
      if (bRes.success) setBuses(bRes.data);
      if (dRes.success) setDrivers(dRes.data);
      if (rRes.success) setRoutes(rRes.data);
    } catch (err) {
      showToast('Failed to load fleet data', 'error');
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
      const res = await api.post('/api/buses', formData);
      if (res.success) {
        showToast('Bus added successfully', 'success');
        setIsModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Fleet & Bus Management" subtitle="Manage School Buses, Drivers & Capacities" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Fleet: {buses.length} Vehicles
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData({
                busNumber: `BUS 0${buses.length + 1}`,
                registrationNumber: `KL-10-AZ-${Math.floor(1000 + Math.random() * 9000)}`,
                capacity: '35',
                driverId: drivers[0]?.id || '',
                routeId: routes[0]?.id || '',
                status: 'ACTIVE',
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add New Bus
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((bus) => (
            <Card key={bus.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{bus.busNumber}</h3>
                      <p className="font-mono text-xs text-gray-500">{bus.registrationNumber}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      bus.status === 'ACTIVE'
                        ? 'success'
                        : bus.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {bus.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100 mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-bold text-gray-900">{bus.capacity} seats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Driver:</span>
                    <span className="font-bold text-gray-900">
                      {bus.driver?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Operating Route:</span>
                    <span className="font-bold text-gray-900">
                      {bus.route?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passenger Students:</span>
                    <span className="font-bold text-amber-700">
                      {bus._count?.students || 0} students
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono text-[11px]">
                  ID: {bus.id.slice(0, 8)}...
                </span>
                <span className="text-emerald-600 font-semibold">GPS Active</span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Add Bus Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Bus"
        subtitle="Add a vehicle to your school transport fleet"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Bus Number"
              placeholder="e.g. BUS 03"
              value={formData.busNumber}
              onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. KL-10-AZ-3003"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Seating Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
            <Select
              label="Fleet Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'MAINTENANCE', label: 'MAINTENANCE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
          </div>

          <Select
            label="Assigned Driver"
            value={formData.driverId}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
          >
            <option value="">Select driver...</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.licenseNumber})
              </option>
            ))}
          </Select>

          <Select
            label="Assigned Route"
            value={formData.routeId}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
          >
            <option value="">Select route...</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Bus
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
