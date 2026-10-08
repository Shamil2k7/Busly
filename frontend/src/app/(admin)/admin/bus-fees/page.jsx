'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Users,
  Search,
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminBusFeesPage() {
  const [plans, setPlans] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [activeTab, setActiveTab] = useState('student-fees'); // 'student-fees' or 'plans'
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // New Plan Form
  const [planForm, setPlanForm] = useState({
    name: '',
    amount: '',
    billingPeriod: 'MONTHLY',
    dueDay: '10',
    lateFee: '50',
  });

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    feePlanId: '',
    billingPeriodLabel: 'November 2026',
    targetType: 'ALL',
  });

  const loadData = async () => {
    try {
      const [pRes, fRes] = await Promise.all([
        api.get('/api/fees/plans'),
        api.get(`/api/fees/students${statusFilter ? `?status=${statusFilter}` : ''}`),
      ]);
      if (pRes.success) setPlans(pRes.data);
      if (fRes.success) setStudentFees(fRes.data);
    } catch (err) {
      showToast('Failed to load fee records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/fees/plans', planForm);
      if (res.success) {
        showToast('Fee plan created successfully', 'success');
        setIsPlanModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAssignFees = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/fees/assign', assignForm);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAssignModalOpen(false);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Bus Fee Management" subtitle="Transport Passes, Billing & Collection Tracking" />

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'student-fees', label: 'Student Billing Records', badge: studentFees.length },
              { id: 'plans', label: 'Configured Fee Plans', badge: plans.length },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlanModalOpen(true)}
            >
              + Create Fee Plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (plans.length > 0) {
                  setAssignForm({ ...assignForm, feePlanId: plans[0].id });
                }
                setIsAssignModalOpen(true);
              }}
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Assign Monthly Billing
            </Button>
          </div>
        </div>

        {activeTab === 'student-fees' ? (
          <Card>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Filter Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Billing Cycle</th>
                    <th className="py-3 px-4">Plan Name</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentFees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No student fee records found.
                      </td>
                    </tr>
                  ) : (
                    studentFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50/70">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{fee.student?.name}</p>
                          <p className="text-[11px] text-gray-400">
                            Class {fee.student?.class}-{fee.student?.division} • {fee.student?.bus?.busNumber || 'Bus'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                          {fee.billingPeriodLabel}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          {fee.feePlan?.name}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          ₹{fee.totalAmount}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={fee.status === 'PAID' ? 'success' : 'danger'}
                            size="sm"
                          >
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                          {fee.payments?.[0]?.paymentReference || 'Unpaid'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* Plans List */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <Card key={p.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                    <Badge variant="primary" size="sm">
                      {p.billingPeriod}
                    </Badge>
                  </div>
                  <p className="text-3xl font-black text-gray-900 my-3">
                    ₹{p.amount}{' '}
                    <span className="text-xs font-normal text-gray-500">/{p.billingPeriod.toLowerCase()}</span>
                  </p>
                  <div className="space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <p>Due Day of Month: <span className="font-bold">{p.dueDay}th</span></p>
                    <p>Late Fee: <span className="font-bold">₹{p.lateFee}</span></p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  {p._count?.students || 0} students assigned
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create New Bus Fee Plan"
        subtitle="Define a recurring transport fee plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. Monthly Standard Pass"
            value={planForm.name}
            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="1500"
              value={planForm.amount}
              onChange={(e) => setPlanForm({ ...planForm, amount: e.target.value })}
              required
            />
            <Select
              label="Billing Cycle"
              value={planForm.billingPeriod}
              onChange={(e) => setPlanForm({ ...planForm, billingPeriod: e.target.value })}
              options={[
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'QUARTERLY', label: 'Quarterly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Day of Month"
              type="number"
              value={planForm.dueDay}
              onChange={(e) => setPlanForm({ ...planForm, dueDay: e.target.value })}
            />
            <Input
              label="Late Fee (₹)"
              type="number"
              value={planForm.lateFee}
              onChange={(e) => setPlanForm({ ...planForm, lateFee: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Fees Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Generate Billing Run"
        subtitle="Assign this billing cycle to active transport passengers"
      >
        <form onSubmit={handleAssignFees} className="space-y-4">
          <Select
            label="Select Fee Plan"
            value={assignForm.feePlanId}
            onChange={(e) => setAssignForm({ ...assignForm, feePlanId: e.target.value })}
            required
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (₹{p.amount})
              </option>
            ))}
          </Select>

          <Input
            label="Billing Period Label"
            placeholder="e.g. November 2026"
            value={assignForm.billingPeriodLabel}
            onChange={(e) => setAssignForm({ ...assignForm, billingPeriodLabel: e.target.value })}
            required
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate Invoices
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
