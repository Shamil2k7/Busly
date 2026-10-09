'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, Award, Trash2 } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    employeeId: '',
    assignedClasses: '10-A, 10-B',
  });

  const loadTeachers = async () => {
    try {
      const res = await api.get('/api/teachers');
      if (res.success) setTeachers(res.data);
    } catch (err) {
      showToast('Failed to load teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/teachers', form);
      if (res.success) {
        showToast('Teacher registered successfully', 'success');
        setIsModalOpen(false);
        loadTeachers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Teacher Directory" subtitle="Manage Teaching Staff & Student Add Permissions" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Teachers: {teachers.length}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              setForm({
                name: '',
                mobile: '',
                email: '',
                employeeId: `TCH-00${teachers.length + 1}`,
                assignedClasses: '10-A, 10-B',
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Teacher
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {teachers.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{t.name}</h3>
                      <p className="font-mono text-xs text-gray-400">{t.employeeId}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {t.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-3">
                  <p className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono font-medium">{t.mobile}</span>
                  </p>
                  {t.email && (
                    <p className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t.email}</span>
                    </p>
                  )}
                  <p className="text-gray-500 pt-1">
                    Assigned Classes: <span className="font-bold text-gray-800">{t.assignedClasses || 'All'}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="text-[11px] text-green-700 font-semibold">Authorized to Enroll Students</span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Register Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Teacher"
        subtitle="Empowers teacher to enroll students & access assigned bus telemetry"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Teacher Name"
            placeholder="e.g. Anu Thomas"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Employee ID"
              placeholder="e.g. TCH-002"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            />
            <Input
              label="Mobile Number (For OTP)"
              type="tel"
              placeholder="10-digit number"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="anu.thomas@school.test"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Assigned Classes"
            placeholder="e.g. 10-A, 10-B, 9-A"
            value={form.assignedClasses}
            onChange={(e) => setForm({ ...form, assignedClasses: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
