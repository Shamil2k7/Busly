'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, KeyRound, Phone, Mail, Users, Search, Edit } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminParentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Parent Modal State
  const [editingParent, setEditingParent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [parentForm, setParentForm] = useState({
    name: '',
    mobile: '',
    email: '',
    relationship: 'FATHER',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    try {
      const res = await api.get('/api/students');
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load parent records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditParent = (parent) => {
    setEditingParent(parent);
    setParentForm({
      name: parent.name || '',
      mobile: parent.mobile || '',
      email: parent.email || '',
      relationship: parent.relationship || 'GUARDIAN',
      status: parent.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    if (!editingParent) return;
    setEditSubmitting(true);
    try {
      const res = await api.put(`/api/students/parents/${editingParent.id}`, parentForm);
      if (res.success) {
        showToast('Parent contact updated successfully', 'success');
        setIsEditModalOpen(false);
        setEditingParent(null);
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update parent details', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Group by Family
  const familiesMap = {};
  students.forEach((st) => {
    const code = st.family?.familyCode;
    if (!code) return;
    if (!familiesMap[code]) {
      familiesMap[code] = {
        familyCode: code,
        parents: st.family?.parents || [],
        children: [],
      };
    }
    familiesMap[code].children.push(st);
  });

  const families = Object.values(familiesMap).filter((f) => {
    if (!search) return true;
    const matchCode = f.familyCode.toLowerCase().includes(search.toLowerCase());
    const matchParent = f.parents.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    const matchChild = f.children.some((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return matchCode || matchParent || matchChild;
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Parents & Families" subtitle="Family Codes & Parent Guardian Access Directory" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search by family code, parent, or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Total Families: {families.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {families.map((fam) => (
            <Card key={fam.familyCode} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    <span className="font-mono text-base font-extrabold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      {fam.familyCode}
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">
                    {fam.children.length} Children
                  </Badge>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Parents / Guardians
                    </p>
                    <div className="space-y-1.5">
                      {fam.parents.map((p) => (
                        <div
                          key={p.id}
                          className="text-xs text-gray-800 font-medium p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-gray-900">
                              {p.name} <span className="text-[11px] font-semibold text-gray-500">({p.relationship})</span>
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{p.mobile}</span>
                            </p>
                            {p.email && (
                              <p className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>{p.email}</span>
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditParent(p)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Parent Contact"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Associated Students
                    </p>
                    <div className="space-y-1">
                      {fam.children.map((c) => (
                        <div key={c.id} className="text-xs bg-gray-50 p-2 rounded-lg flex items-center justify-between">
                          <span className="font-bold text-gray-800">{c.name}</span>
                          <span className="text-[11px] text-gray-500">
                            Class {c.class}-{c.division} • {c.bus?.busNumber || 'No Bus'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                Single sign-on for all listed siblings
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Edit Parent Modal */}
      {editingParent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingParent(null);
          }}
          title={`Edit Parent: ${editingParent.name}`}
          subtitle="Update contact phone for Parent Portal OTP access"
        >
          <form onSubmit={handleUpdateParent} className="space-y-4">
            <Input
              label="Parent Full Name"
              value={parentForm.name}
              onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number (For Login OTP)"
                type="tel"
                value={parentForm.mobile}
                onChange={(e) => setParentForm({ ...parentForm, mobile: e.target.value })}
                required
              />
              <Select
                label="Relationship"
                value={parentForm.relationship}
                onChange={(e) => setParentForm({ ...parentForm, relationship: e.target.value })}
                options={[
                  { value: 'FATHER', label: 'Father' },
                  { value: 'MOTHER', label: 'Mother' },
                  { value: 'GUARDIAN', label: 'Guardian' },
                ]}
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              value={parentForm.email}
              onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
              placeholder="parent@example.com"
            />
            <Select
              label="Account Status"
              value={parentForm.status}
              onChange={(e) => setParentForm({ ...parentForm, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' },
              ]}
            />
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingParent(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={editSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
