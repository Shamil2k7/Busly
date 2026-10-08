'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Phone, Bus, ShieldCheck } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    licenseNumber: '',
  });

  const loadDrivers = async () => {
    try {
      const res = await api.get('/api/drivers');
      if (res.success) setDrivers(res.data);
    } catch (err) {
      showToast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/drivers', form);
      if (res.success) {
        showToast('Driver registered successfully', 'success');
        setIsModalOpen(false);
        loadDrivers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Driver Management" subtitle="Manage Licensed Drivers & Bus Assignments" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Drivers: {drivers.length}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({
                name: '',
                mobile: '',
                licenseNumber: `DL-KL-10-2026-00${drivers.length + 1}`,
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Driver
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((d) => (
            <Card key={d.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{d.name}</h3>
                      <p className="font-mono text-xs text-gray-400">{d.licenseNumber}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {d.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-3">
                  <p className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono font-medium">{d.mobile}</span>
                  </p>
                  <p className="text-gray-500 pt-1">
                    Assigned Bus:{' '}
                    <span className="font-bold text-gray-800">
                      {d.buses?.[0]?.busNumber || 'None'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Driver Mobile OTP Ready
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Register Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Driver"
        subtitle="Registers driver credentials and mobile number for Cockpit access"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Driver Full Name"
            placeholder="e.g. Rajesh Kumar"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Mobile Number (For Cockpit OTP)"
            type="tel"
            placeholder="10-digit number"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
          />
          <Input
            label="Commercial Driver License Number"
            placeholder="e.g. DL-KL-10-2020-0099"
            value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            required
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Driver
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
