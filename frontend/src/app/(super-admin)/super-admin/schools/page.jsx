'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  School,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  UserPlus,
  Users,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock
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

export default function SuperAdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Provision New School Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'PRO',
  });

  // 2. Edit School Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'PRO',
    status: 'ACTIVE',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // 3. School Admins Management & Add Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [activeSchoolForAdmins, setActiveSchoolForAdmins] = useState(null);
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

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

  // Handle Provisioning
  const handleProvision = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/schools', provisionForm);
      if (res.success) {
        showToast('School tenant provisioned successfully', 'success');
        setIsProvisionModalOpen(false);
        loadSchools();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (school) => {
    setEditingSchool(school);
    setEditForm({
      name: school.name || '',
      code: school.code || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      subscriptionPlan: school.subscriptionPlan || 'PRO',
      status: school.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  // Handle Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSchool) return;
    setIsSavingEdit(true);
    try {
      const res = await api.put(`/api/schools/${editingSchool.id}`, editForm);
      if (res.success) {
        showToast(`"${editForm.name}" updated successfully`, 'success');
        setIsEditModalOpen(false);
        loadSchools();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update school details', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Manage Admins Modal
  const handleOpenAdmins = async (school) => {
    setActiveSchoolForAdmins(school);
    setAdminForm({ name: '', email: '', password: '', mobile: '' });
    setIsAdminModalOpen(true);
    setLoadingAdmins(true);
    try {
      const res = await api.get(`/api/schools/${school.id}/admins`);
      if (res.success) {
        setSchoolAdmins(res.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load school administrators', 'error');
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Handle Create Admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!activeSchoolForAdmins) return;
    setIsAddingAdmin(true);
    try {
      const res = await api.post(`/api/schools/${activeSchoolForAdmins.id}/admins`, adminForm);
      if (res.success) {
        showToast(`School Admin "${adminForm.name}" added successfully!`, 'success');
        setSchoolAdmins([res.data, ...schoolAdmins]);
        setAdminForm({ name: '', email: '', password: '', mobile: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to add school administrator', 'error');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Toggle Admin Status
  const handleToggleAdminStatus = async (admin) => {
    if (!activeSchoolForAdmins) return;
    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/api/schools/${activeSchoolForAdmins.id}/admins/${admin.id}/status`, {
        status: newStatus,
      });
      if (res.success) {
        showToast(`Admin status changed to ${newStatus}`, 'success');
        setSchoolAdmins(
          schoolAdmins.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Toggle School Active / Inactive
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

  const filteredSchools = schools.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="School Tenant Provisioning" subtitle="Manage Multi-Tenant Schools, School Details & Administrators" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search school by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-busly-yellow/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              {filteredSchools.length} {filteredSchools.length === 1 ? 'School' : 'Schools'}
            </span>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setProvisionForm({
                  name: '',
                  code: `SCH${Math.floor(100 + Math.random() * 900)}`,
                  address: '',
                  phone: '',
                  email: '',
                  subscriptionPlan: 'PRO',
                });
                setIsProvisionModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Provision New School
            </Button>
          </div>
        </div>

        {/* School Tenants Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Loading schools...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8 space-y-3">
            <School className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-bold text-gray-700">No schools found</p>
            <p className="text-xs text-gray-400">Try adjusting your search query or provision a new school.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <Card key={school.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shadow-sm flex-shrink-0">
                        <School className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-base leading-snug">{school.name}</h3>
                        <p className="font-mono text-xs font-bold text-amber-700">
                          Code: {school.code}
                        </p>
                      </div>
                    </div>
                    <Badge variant={school.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                      {school.status}
                    </Badge>
                  </div>

                  {/* Metadata Box */}
                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Plan:</span>
                      <Badge variant="warning" size="sm" className="font-bold">
                        {school.subscriptionPlan}
                      </Badge>
                    </div>
                    {school.address && (
                      <p className="flex items-center space-x-1.5 text-gray-700 truncate">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{school.address}</span>
                      </p>
                    )}
                    {school.phone && (
                      <p className="flex items-center space-x-1.5 font-mono text-gray-700">
                        <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span>{school.phone}</span>
                      </p>
                    )}
                    {school.email && (
                      <p className="flex items-center space-x-1.5 text-gray-700 truncate">
                        <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{school.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Operational Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mt-3 pt-3 border-t border-gray-100 text-[11px]">
                    <div className="bg-slate-50 p-1.5 rounded-xl">
                      <span className="font-black text-gray-900 block">{school._count?.students || 0}</span>
                      <span className="text-gray-400 text-[10px]">Students</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-xl">
                      <span className="font-black text-gray-900 block">{school._count?.buses || 0}</span>
                      <span className="text-gray-400 text-[10px]">Buses</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-xl">
                      <span className="font-black text-gray-900 block">{school._count?.drivers || 0}</span>
                      <span className="text-gray-400 text-[10px]">Drivers</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-xl">
                      <span className="font-black text-gray-900 block">{school._count?.teachers || 0}</span>
                      <span className="text-gray-400 text-[10px]">Teachers</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(school)}
                      className="flex-1 text-xs font-bold"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1 text-amber-600" /> Edit Details
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAdmins(school)}
                      className="flex-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1 text-amber-400" /> Admins
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <Link
                      href={`/super-admin/schools/${school.id}`}
                      className="text-amber-800 hover:text-amber-900 font-bold flex items-center hover:underline"
                    >
                      Full Details <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(school)}
                      className={`text-[11px] font-bold ${
                        school.status === 'ACTIVE'
                          ? 'text-rose-600 hover:text-rose-800'
                          : 'text-emerald-600 hover:text-emerald-800'
                      }`}
                    >
                      {school.status === 'ACTIVE' ? 'Deactivate School' : 'Activate School'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* MODAL 1: Provision New School */}
      <Modal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        title="Provision New School Tenant"
        subtitle="Registers a new tenant boundary and unique school code"
      >
        <form onSubmit={handleProvision} className="space-y-4">
          <Input
            label="School Name"
            placeholder="e.g. St. Mary's International School"
            value={provisionForm.name}
            onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Unique School Code"
              placeholder="e.g. STMARY"
              value={provisionForm.code}
              onChange={(e) => setProvisionForm({ ...provisionForm, code: e.target.value })}
              required
            />
            <Select
              label="Subscription Plan"
              value={provisionForm.subscriptionPlan}
              onChange={(e) => setProvisionForm({ ...provisionForm, subscriptionPlan: e.target.value })}
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
            value={provisionForm.address}
            onChange={(e) => setProvisionForm({ ...provisionForm, address: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              placeholder="+91 9876543210"
              value={provisionForm.phone}
              onChange={(e) => setProvisionForm({ ...provisionForm, phone: e.target.value })}
            />
            <Input
              label="Official Email"
              type="email"
              placeholder="admin@school.com"
              value={provisionForm.email}
              onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => setIsProvisionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Tenant
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit School Details */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit School Details"
        subtitle={editingSchool ? `Update parameters for ${editingSchool.name}` : ''}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="School Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              label="Contact Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          <Input
            label="Official Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />

          <Input
            label="Campus Address"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSavingEdit}>
              {isSavingEdit ? 'Saving Changes...' : 'Save School Details'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Manage & Add School Administrators */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title="School Administrators"
        subtitle={activeSchoolForAdmins ? `Manage administrators for ${activeSchoolForAdmins.name} (${activeSchoolForAdmins.code})` : ''}
      >
        <div className="space-y-5">
          {/* List of Existing Admins */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-amber-600" /> Active Administrators
              </h4>
              <span className="text-[11px] font-bold text-gray-400">
                {schoolAdmins.length} {schoolAdmins.length === 1 ? 'Admin' : 'Admins'}
              </span>
            </div>

            {loadingAdmins ? (
              <p className="text-xs text-gray-400 py-3 text-center">Loading administrators...</p>
            ) : schoolAdmins.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-center space-y-1">
                <p className="font-bold">No school administrator assigned yet.</p>
                <p className="text-[11px] text-amber-700">Use the form below to create the first admin for this school.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {schoolAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-gray-900">{admin.name}</span>
                        <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                          {admin.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 font-mono mt-0.5">{admin.email}</p>
                      {admin.mobile && (
                        <p className="text-[10px] text-gray-400 font-mono">Mobile: {admin.mobile}</p>
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
          </div>

          {/* Form to Add New Admin */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider mb-3 flex items-center">
              <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-600" /> + Add New School Admin
            </h4>

            <form onSubmit={handleAddAdmin} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <Input
                label="Admin Full Name"
                placeholder="e.g. Principal Rajesh Sharma"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  placeholder="Min 6 characters"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Contact Mobile (Optional)"
                placeholder="+91 9876543210"
                value={adminForm.mobile}
                onChange={(e) => setAdminForm({ ...adminForm, mobile: e.target.value })}
              />

              <div className="pt-1 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isAddingAdmin}
                  className="font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {isAddingAdmin ? 'Creating Admin...' : 'Add School Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
