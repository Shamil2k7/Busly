'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  School,
  ArrowLeft,
  Edit,
  UserPlus,
  Shield,
  Save,
  Users,
  Bus,
  Route as RouteIcon,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Plus
} from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function SuperAdminSchoolDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit School Form State
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'PRO',
    status: 'ACTIVE',
  });

  // School Admins State
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const loadSchool = async () => {
    try {
      const res = await api.get(`/api/schools/${id}`);
      if (res.success && res.data) {
        setSchool(res.data);
        setEditForm({
          name: res.data.name || '',
          code: res.data.code || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          subscriptionPlan: res.data.subscriptionPlan || 'PRO',
          status: res.data.status || 'ACTIVE',
        });
      }
    } catch (err) {
      showToast('Failed to load school details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await api.get(`/api/schools/${id}/admins`);
      if (res.success) {
        setAdmins(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSchool();
      loadAdmins();
    }
  }, [id]);

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put(`/api/schools/${id}`, editForm);
      if (res.success) {
        showToast('School details updated successfully', 'success');
        setSchool(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update school details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setIsAddingAdmin(true);
    try {
      const res = await api.post(`/api/schools/${id}/admins`, adminForm);
      if (res.success) {
        showToast(`School Admin "${adminForm.name}" created successfully!`, 'success');
        setAdmins([res.data, ...admins]);
        setAdminForm({ name: '', email: '', password: '', mobile: '' });
        setIsAddAdminModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create school administrator', 'error');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleToggleAdminStatus = async (admin) => {
    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/schools/${id}/admins/${admin.id}/status`, {
        status: newStatus,
      });
      if (res.success) {
        showToast(`Admin status changed to ${newStatus}`, 'success');
        setAdmins(admins.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a)));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminTopNav title="School Management" subtitle="Loading..." />
        <div className="p-8 text-center text-gray-400">Loading school details...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex-1 flex flex-col">
        <AdminTopNav title="School Management" subtitle="Not Found" />
        <div className="p-8 text-center space-y-3">
          <p className="text-gray-600 font-bold">School not found.</p>
          <Link href="/super-admin/schools">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Schools
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav
        title={`Manage: ${school.name}`}
        subtitle={`Tenant Code: ${school.code} • Plan: ${school.subscriptionPlan}`}
      />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Back Navigation & Status Banner */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 min-w-0">
            <Link href="/super-admin/schools" className="flex-shrink-0">
              <Button variant="outline" size="sm" className="h-9 px-3">
                <ArrowLeft className="w-4 h-4 mr-1" /> Schools
              </Button>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900 truncate">{school.name}</h2>
                <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'} size="sm" className="flex-shrink-0">
                  {school.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                School Code: <span className="font-bold text-amber-700">{school.code}</span> • Created: {new Date(school.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddAdminModalOpen(true)}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-amber-400" /> + Add School Admin
            </Button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 block">{school._count?.students || 0}</span>
            <span className="text-xs text-gray-500 font-medium">Students</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 block">{school._count?.buses || 0}</span>
            <span className="text-xs text-gray-500 font-medium">Buses</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 block">{school._count?.drivers || 0}</span>
            <span className="text-xs text-gray-500 font-medium">Drivers</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <span className="text-xl sm:text-2xl font-black text-gray-900 block">{school._count?.teachers || 0}</span>
            <span className="text-xs text-gray-500 font-medium">Teachers</span>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="text-xl sm:text-2xl font-black text-gray-900 block">{admins.length}</span>
            <span className="text-xs text-gray-500 font-medium">School Admins</span>
          </div>
        </div>

        {/* Main Content Grid: Edit School Form (Left) & School Admins (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Edit School Details Form */}
          <div className="lg:col-span-7">
            <Card className="p-4 sm:p-6">
              <CardHeader
                title="Edit School Details"
                subtitle="Update school identity, code, subscription plan, and campus information"
              />
              <form onSubmit={handleSaveSchool} className="space-y-4 mt-4">
                <Input
                  label="School Full Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="School Code (Tenant ID)"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    required
                  />
                  <Select
                    label="Subscription Plan"
                    value={editForm.subscriptionPlan}
                    onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                    options={[
                      { value: 'BASIC', label: 'Basic Fleet' },
                      { value: 'PRO', label: 'Pro (Live Tracking + Fees)' },
                      { value: 'ENTERPRISE', label: 'Enterprise Unlimited' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Tenant Status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    options={[
                      { value: 'ACTIVE', label: 'ACTIVE' },
                      { value: 'INACTIVE', label: 'INACTIVE' },
                    ]}
                  />
                  <Input
                    label="Campus Contact Phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <Input
                  label="Official School Email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />

                <Input
                  label="Campus Physical Address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-1.5" />
                    {isSaving ? 'Saving Changes...' : 'Save School Details'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* RIGHT: School Administrators Roster */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-base flex items-center">
                    <Shield className="w-4 h-4 mr-1.5 text-amber-600" /> School Administrators
                  </h3>
                  <p className="text-xs text-gray-500">
                    Accounts authorized to manage this school
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddAdminModalOpen(true)}
                  className="text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Admin
                </Button>
              </div>

              {loadingAdmins ? (
                <div className="py-8 text-center text-gray-400 text-xs">Loading administrators...</div>
              ) : admins.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 text-center space-y-2">
                  <Users className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-700">No School Administrators assigned.</p>
                  <p className="text-[11px] text-gray-400">
                    Click &quot;Add Admin&quot; to provision login credentials for the school principal or transport manager.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddAdminModalOpen(true)}
                    className="mt-2 text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> Add School Admin
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-gray-900 text-sm">{admin.name}</span>
                          <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                            {admin.status}
                          </Badge>
                        </div>
                        <p className="text-gray-500 font-mono text-[11px] flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" /> {admin.email}
                        </p>
                        {admin.mobile && (
                          <p className="text-gray-400 font-mono text-[10px] flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" /> {admin.mobile}
                          </p>
                        )}
                      </div>

                      <Button
                        variant={admin.status === 'ACTIVE' ? 'outline' : 'success'}
                        size="sm"
                        onClick={() => handleToggleAdminStatus(admin)}
                        className="text-[11px] h-7 px-2.5"
                      >
                        {admin.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* MODAL: Add School Administrator */}
      <Modal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        title="Add School Administrator"
        subtitle={`Provision login access for ${school.name} (${school.code})`}
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <Input
            label="Administrator Full Name"
            placeholder="e.g. Principal Rajesh Sharma"
            value={adminForm.name}
            onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
            required
          />

          <Input
            label="Login Email"
            type="email"
            placeholder="admin@school.com"
            value={adminForm.email}
            onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="At least 6 characters"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
            required
          />

          <Input
            label="Contact Mobile (Optional)"
            placeholder="+91 9876543210"
            value={adminForm.mobile}
            onChange={(e) => setAdminForm({ ...adminForm, mobile: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsAddAdminModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isAddingAdmin}>
              <Plus className="w-4 h-4 mr-1" />
              {isAddingAdmin ? 'Creating Administrator...' : 'Create School Admin'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
