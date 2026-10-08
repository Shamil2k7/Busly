'use client';

import React, { useState, useEffect } from 'react';
import { School, Plus, Search, CheckCircle2, XCircle, Edit } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function SuperAdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'PRO',
  });

  const loadSchools = async () => {
    try {
      const res = await api.get('/api/schools');
      if (res.success) setSchools(res.data);
    } catch (err) {
      showToast('Failed to load schools', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/schools', form);
      if (res.success) {
        showToast('School tenant provisioned successfully', 'success');
        setIsModalOpen(false);
        loadSchools();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (school) => {
    const newStatus = school.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.put(`/api/schools/${school.id}`, { status: newStatus });
      if (res.success) {
        showToast(`School status updated to ${newStatus}`, 'success');
        loadSchools();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="School Tenant Provisioning" subtitle="Manage Multi-Tenant Schools & Subscription Tiers" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Enrolled Schools: {schools.length}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setForm({
                name: '',
                code: `SCH${Math.floor(100 + Math.random() * 900)}`,
                address: '',
                phone: '',
                email: '',
                subscriptionPlan: 'PRO',
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Provision New School
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{school.name}</h3>
                      <p className="font-mono text-xs font-bold text-amber-800">
                        Code: {school.code}
                      </p>
                    </div>
                  </div>
                  <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                    {school.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-3">
                  <p>
                    Plan: <span className="font-bold text-gray-800">{school.subscriptionPlan}</span>
                  </p>
                  <p>Address: <span className="text-gray-700">{school.address || 'N/A'}</span></p>
                  <p>Phone: <span className="font-mono">{school.phone || 'N/A'}</span></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {school._count?.students || 0} students enrolled
                </span>
                <Button
                  variant={school.status === 'ACTIVE' ? 'outline' : 'success'}
                  size="sm"
                  onClick={() => handleToggleStatus(school)}
                >
                  {school.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Provision School Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision New School Tenant"
        subtitle="Registers a new tenant boundary and unique school code"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="School Name"
            placeholder="e.g. St. Mary's International School"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unique School Code"
              placeholder="e.g. STMARY"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <Select
              label="Subscription Plan"
              value={form.subscriptionPlan}
              onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}
              options={[
                { value: 'BASIC', label: 'Basic Fleet' },
                { value: 'PRO', label: 'Pro (Live Tracking + Fees)' },
                { value: 'ENTERPRISE', label: 'Enterprise Unlimited' },
              ]}
            />
          </div>

          <Input
            label="Campus Address"
            placeholder="City, State"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
