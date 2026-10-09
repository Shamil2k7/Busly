'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Bus,
  KeyRound,
  Phone,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  // Configurable Classes & Divisions
  const [classes, setClasses] = useState(['10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'UKG', 'LKG']);
  const [divisions, setDivisions] = useState(['A', 'B', 'C', 'D']);

  // Add Class & Add Division Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isAddDivisionModalOpen, setIsAddDivisionModalOpen] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState('');

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    class: '10',
    division: 'A',
    parentName: '',
    parentMobile: '',
    parentEmail: '',
    relationship: 'FATHER',
    busId: '',
    pickupStopId: '',
    dropStopId: '',
    feePlanId: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Edit Student Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    studentId: '',
    class: '10',
    division: 'A',
    parentName: '',
    parentMobile: '',
    parentEmail: '',
    relationship: 'FATHER',
    busId: '',
    pickupStopId: '',
    dropStopId: '',
    feePlanId: '',
    status: 'ACTIVE',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Restore custom classes & divisions from localStorage
  useEffect(() => {
    try {
      const savedClasses = localStorage.getItem('busly_classes');
      if (savedClasses) {
        const parsed = JSON.parse(savedClasses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClasses((prev) => Array.from(new Set([...parsed, ...prev])));
        }
      }
      const savedDivs = localStorage.getItem('busly_divisions');
      if (savedDivs) {
        const parsed = JSON.parse(savedDivs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDivisions((prev) => Array.from(new Set([...parsed, ...prev])));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const loadData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filterClass) queryParams.set('class', filterClass);
      if (filterDivision) queryParams.set('division', filterDivision);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [stRes, bRes, fpRes, rRes] = await Promise.all([
        api.get(`/api/students${queryString}`),
        api.get('/api/buses'),
        api.get('/api/fees/plans'),
        api.get('/api/routes'),
      ]);

      if (stRes.success && stRes.data) {
        setStudents(stRes.data);
        const existingClasses = stRes.data.map((s) => s.class).filter(Boolean);
        const existingDivs = stRes.data.map((s) => s.division).filter(Boolean);
        if (existingClasses.length > 0) {
          setClasses((prev) => Array.from(new Set([...prev, ...existingClasses])));
        }
        if (existingDivs.length > 0) {
          setDivisions((prev) => Array.from(new Set([...prev, ...existingDivs])));
        }
      }
      if (bRes.success) setBuses(bRes.data);
      if (fpRes.success) setFeePlans(fpRes.data);
      if (rRes?.success) setRoutes(rRes.data || []);
    } catch (err) {
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterClass, filterDivision]);

  const handleAddClassSubmit = (e) => {
    if (e) e.preventDefault();
    const val = newClassName.trim().replace(/^class\s+/i, '');
    if (!val) {
      showToast('Please enter a class name', 'error');
      return;
    }
    const updated = Array.from(new Set([val, ...classes]));
    setClasses(updated);
    try {
      localStorage.setItem('busly_classes', JSON.stringify(updated));
    } catch (err) {}
    setFormData((prev) => ({ ...prev, class: val }));
    showToast(`Class "${val}" added successfully`, 'success');
    setNewClassName('');
    setIsAddClassModalOpen(false);
  };

  const handleAddDivisionSubmit = (e) => {
    if (e) e.preventDefault();
    const val = newDivisionName.trim().replace(/^div(ision)?\s+/i, '').toUpperCase();
    if (!val) {
      showToast('Please enter a division name', 'error');
      return;
    }
    const updated = Array.from(new Set([...divisions, val]));
    setDivisions(updated);
    try {
      localStorage.setItem('busly_divisions', JSON.stringify(updated));
    } catch (err) {}
    setFormData((prev) => ({ ...prev, division: val }));
    showToast(`Division "${val}" added successfully`, 'success');
    setNewDivisionName('');
    setIsAddDivisionModalOpen(false);
  };

  const handleDeleteClass = (clsToDelete) => {
    if (!confirm(`Are you sure you want to remove Class "${clsToDelete}" from options?`)) return;
    const updated = classes.filter((c) => c !== clsToDelete);
    setClasses(updated);
    try {
      localStorage.setItem('busly_classes', JSON.stringify(updated));
    } catch (e) {}
    if (filterClass === clsToDelete) setFilterClass('');
    if (formData.class === clsToDelete) setFormData((prev) => ({ ...prev, class: updated[0] || '10' }));
    if (editFormData.class === clsToDelete) setEditFormData((prev) => ({ ...prev, class: updated[0] || '10' }));
    showToast(`Class "${clsToDelete}" removed`, 'success');
  };

  const handleDeleteDivision = (divToDelete) => {
    if (!confirm(`Are you sure you want to remove Division "${divToDelete}" from options?`)) return;
    const updated = divisions.filter((d) => d !== divToDelete);
    setDivisions(updated);
    try {
      localStorage.setItem('busly_divisions', JSON.stringify(updated));
    } catch (e) {}
    if (filterDivision === divToDelete) setFilterDivision('');
    if (formData.division === divToDelete) setFormData((prev) => ({ ...prev, division: updated[0] || 'A' }));
    if (editFormData.division === divToDelete) setEditFormData((prev) => ({ ...prev, division: updated[0] || 'A' }));
    showToast(`Division "${divToDelete}" removed`, 'success');
  };

  const handleOpenEditStudent = (st) => {
    setEditingStudent(st);
    const primaryParent = st.family?.parents?.[0] || {};
    setEditFormData({
      name: st.name || '',
      studentId: st.studentId || '',
      class: st.class || '10',
      division: st.division || 'A',
      parentName: primaryParent.name || '',
      parentMobile: primaryParent.mobile || '',
      parentEmail: primaryParent.email || '',
      relationship: primaryParent.relationship || 'FATHER',
      busId: st.busId || st.bus?.id || '',
      pickupStopId: st.pickupStopId || st.pickupStop?.id || '',
      dropStopId: st.dropStopId || st.dropStop?.id || '',
      feePlanId: st.feePlanId || st.feePlan?.id || '',
      status: st.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditSubmitting(true);
    try {
      const res = await api.put(`/api/students/${editingStudent.id}`, editFormData);
      if (res.success) {
        showToast('Student details updated successfully', 'success');
        setIsEditModalOpen(false);
        setEditingStudent(null);
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update student', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await api.post('/api/students', formData);
      if (res.success) {
        showToast(res.message, 'success');
        setCreatedResult(res.data);
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create student', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      const res = await api.delete(`/api/students/${id}`);
      if (res.success) {
        showToast('Student deleted', 'success');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Students Directory" subtitle="Manage Enrolled Transport Passengers" />

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5">
            <div className="w-full sm:w-64">
              <Input
                icon={Search}
                placeholder="Search student or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-36">
              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-36">
              <Select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
              >
                <option value="">All Divisions</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>Division {d}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewClassName('');
                setIsAddClassModalOpen(true);
              }}
              className="flex-1 sm:flex-none font-bold border-gray-300 text-slate-700 hover:bg-amber-50"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-amber-500" /> Add Class
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewDivisionName('');
                setIsAddDivisionModalOpen(true);
              }}
              className="flex-1 sm:flex-none font-bold border-gray-300 text-slate-700 hover:bg-amber-50"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-amber-500" /> Add Division
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto font-bold shadow-md"
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  name: '',
                  studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
                  class: classes[0] || '10',
                  division: divisions[0] || 'A',
                  parentName: '',
                  parentMobile: '',
                  parentEmail: '',
                  relationship: 'FATHER',
                  busId: buses[0]?.id || '',
                  feePlanId: feePlans[0]?.id || '',
                });
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Enroll Student
            </Button>
          </div>
        </div>

        {/* Student Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Family Code</th>
                  <th className="py-3 px-4">Parent / Guardian</th>
                  <th className="py-3 px-4">Assigned Bus</th>
                  <th className="py-3 px-4">Fee Plan</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No students found. Enroll a student to begin.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{st.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{st.studentId}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {st.class}-{st.division}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                          {st.family?.familyCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-gray-800">
                          {st.family?.parents?.[0]?.name || 'N/A'}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          {st.family?.parents?.[0]?.mobile || ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {st.bus ? (
                          <div className="flex items-center space-x-1.5 text-gray-800">
                            <Bus className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold">{st.bus.busNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {st.feePlan?.name || 'Standard Plan'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditStudent(st)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student & Generate Family Code"
        subtitle="Registers student, parent contact, transport assignment, and fee plan"
        maxWidth="max-w-lg"
      >
        {createdResult ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Student Enrolled Successfully!</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-800 font-semibold mb-1">Generated Family Code:</p>
              <p className="text-3xl font-black font-mono tracking-wider text-amber-900">
                {createdResult.familyCode}
              </p>
              <p className="text-[11px] text-amber-700 mt-2">
                Share this Family Code with the parent to enable their mobile app login.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => setIsAddModalOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Student Full Name"
                placeholder="e.g. Maya Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Class
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewClassName('');
                      setIsAddClassModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-0.5" /> Add Class
                  </button>
                </div>
                <Select
                  value={formData.class}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setNewClassName('');
                      setIsAddClassModalOpen(true);
                    } else {
                      setFormData({ ...formData, class: e.target.value });
                    }
                  }}
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                  <option value="__ADD_NEW__" className="text-amber-600 font-bold">
                    + Add New Class...
                  </option>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Division
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDivisionName('');
                      setIsAddDivisionModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-0.5" /> Add Division
                  </button>
                </div>
                <Select
                  value={formData.division}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setNewDivisionName('');
                      setIsAddDivisionModalOpen(true);
                    } else {
                      setFormData({ ...formData, division: e.target.value });
                    }
                  }}
                >
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      Division {d}
                    </option>
                  ))}
                  <option value="__ADD_NEW__" className="text-amber-600 font-bold">
                    + Add New Division...
                  </option>
                </Select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Parent / Guardian Information
              </p>
              <div className="space-y-3">
                <Input
                  label="Parent Name"
                  placeholder="e.g. Suresh Nair"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Mobile Number (For OTP)"
                    type="tel"
                    placeholder="10-digit number"
                    value={formData.parentMobile}
                    onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                    required
                  />
                  <Select
                    label="Relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    options={[
                      { value: 'FATHER', label: 'Father' },
                      { value: 'MOTHER', label: 'Mother' },
                      { value: 'GUARDIAN', label: 'Guardian' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Transport & Fee Allocation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Assigned Bus"
                  value={formData.busId}
                  onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                >
                  <option value="">Select bus...</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.registrationNumber})
                    </option>
                  ))}
                </Select>
                <Select
                  label="Fee Plan"
                  value={formData.feePlanId}
                  onChange={(e) => setFormData({ ...formData, feePlanId: e.target.value })}
                >
                  <option value="">Select plan...</option>
                  {feePlans.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name} (₹{fp.amount})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Morning Pickup Stop
                  </label>
                  <Select
                    value={formData.pickupStopId}
                    onChange={(e) => setFormData({ ...formData, pickupStopId: e.target.value })}
                  >
                    <option value="">Default (School Gate)</option>
                    {routes.map((route) => (
                      <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                        {(route.stops || []).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Evening Drop-off Stop
                  </label>
                  <Select
                    value={formData.dropStopId}
                    onChange={(e) => setFormData({ ...formData, dropStopId: e.target.value })}
                  >
                    <option value="">Default (School Gate)</option>
                    {routes.map((route) => (
                      <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                        {(route.stops || []).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={formSubmitting}>
                Save & Generate Code
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={selectedStudent.name}
          subtitle={`Student ID: ${selectedStudent.studentId}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
              <p className="text-gray-500">
                Class: <span className="font-bold text-gray-900">{selectedStudent.class}-{selectedStudent.division}</span>
              </p>
              <p className="text-gray-500">
                Family Code:{' '}
                <span className="font-mono font-bold text-amber-700">
                  {selectedStudent.family?.familyCode}
                </span>
              </p>
              <p className="text-gray-500">
                Parent:{' '}
                <span className="font-bold text-gray-900">
                  {selectedStudent.family?.parents?.[0]?.name} ({selectedStudent.family?.parents?.[0]?.mobile})
                </span>
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl space-y-1.5">
              <p className="font-bold text-gray-800">Transport Assignment:</p>
              <p className="text-gray-600">
                Bus: <span className="font-semibold">{selectedStudent.bus?.busNumber || 'None'}</span>
              </p>
              <p className="text-gray-600">
                Pickup Stop: <span className="font-semibold">{selectedStudent.pickupStop?.name || 'School Gate'}</span>
              </p>
              <p className="text-gray-600">
                Drop Stop: <span className="font-semibold">{selectedStudent.dropStop?.name || 'School Gate'}</span>
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        title="Add New School Class"
        subtitle="Define a grade or class level for student grouping"
      >
        <form onSubmit={handleAddClassSubmit} className="space-y-4">
          <Input
            label="Class Name / Number"
            placeholder="e.g. 11, 12, Pre-KG, Nursery, UKG"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['11', '12', 'Nursery', 'LKG', 'UKG', 'Pre-KG', 'Playgroup'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNewClassName(suggestion)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-700 border border-gray-200 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Configured Classes ({classes.length}) • Click ✕ to remove
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {classes.map((cls) => (
                <div
                  key={cls}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-sm"
                >
                  <span>Class {cls}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(cls)}
                    className="text-gray-400 hover:text-red-600 rounded p-0.5"
                    title={`Delete Class ${cls}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setIsAddClassModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="font-bold shadow-md">
              Add Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Division Modal */}
      <Modal
        isOpen={isAddDivisionModalOpen}
        onClose={() => setIsAddDivisionModalOpen(false)}
        title="Add / Manage Division or Section"
        subtitle="Define a section (e.g. A, B, C, D, or house/group names)"
      >
        <form onSubmit={handleAddDivisionSubmit} className="space-y-4">
          <Input
            label="Division Name"
            placeholder="e.g. D, E, F, Blue, Ruby"
            value={newDivisionName}
            onChange={(e) => setNewDivisionName(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['D', 'E', 'F', 'G', 'H', 'Lotus', 'Rose'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNewDivisionName(suggestion)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-700 border border-gray-200 transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Configured Divisions ({divisions.length}) • Click ✕ to remove
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {divisions.map((div) => (
                <div
                  key={div}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-sm"
                >
                  <span>Division {div}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDivision(div)}
                    className="text-gray-400 hover:text-red-600 rounded p-0.5"
                    title={`Delete Division ${div}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setIsAddDivisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="font-bold shadow-md">
              Add Division
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingStudent(null);
          }}
          title={`Edit Student: ${editingStudent.name}`}
          subtitle={`Student ID: ${editingStudent.studentId} • Update details, class, transport, or parent contact`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Student Full Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
              <Input
                label="Student ID"
                value={editFormData.studentId}
                onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Class
                </label>
                <Select
                  value={editFormData.class}
                  onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                >
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Division
                </label>
                <Select
                  value={editFormData.division}
                  onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                >
                  {divisions.map((d) => (
                    <option key={d} value={d}>
                      Division {d}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Parent / Guardian Information
              </p>
              <div className="space-y-3">
                <Input
                  label="Parent Name"
                  value={editFormData.parentName}
                  onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Mobile Number (For OTP Login)"
                    type="tel"
                    value={editFormData.parentMobile}
                    onChange={(e) => setEditFormData({ ...editFormData, parentMobile: e.target.value })}
                    required
                  />
                  <Select
                    label="Relationship"
                    value={editFormData.relationship}
                    onChange={(e) => setEditFormData({ ...editFormData, relationship: e.target.value })}
                    options={[
                      { value: 'FATHER', label: 'Father' },
                      { value: 'MOTHER', label: 'Mother' },
                      { value: 'GUARDIAN', label: 'Guardian' },
                    ]}
                  />
                </div>
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={editFormData.parentEmail}
                  onChange={(e) => setEditFormData({ ...editFormData, parentEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Transport & Status
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Assigned Bus"
                  value={editFormData.busId}
                  onChange={(e) => setEditFormData({ ...editFormData, busId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Fee Plan"
                  value={editFormData.feePlanId}
                  onChange={(e) => setEditFormData({ ...editFormData, feePlanId: e.target.value })}
                >
                  <option value="">No Plan</option>
                  {feePlans.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE' },
                    { value: 'INACTIVE', label: 'INACTIVE' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Morning Pickup Stop
                  </label>
                  <Select
                    value={editFormData.pickupStopId}
                    onChange={(e) => setEditFormData({ ...editFormData, pickupStopId: e.target.value })}
                  >
                    <option value="">Default (School Gate)</option>
                    {routes.map((route) => (
                      <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                        {(route.stops || []).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Evening Drop-off Stop
                  </label>
                  <Select
                    value={editFormData.dropStopId}
                    onChange={(e) => setEditFormData({ ...editFormData, dropStopId: e.target.value })}
                  >
                    <option value="">Default (School Gate)</option>
                    {routes.map((route) => (
                      <optgroup key={route.id} label={`${route.name} (${route.bus?.busNumber || 'Bus'})`}>
                        {(route.stops || []).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            Stop {stop.sequence}: {stop.name} {stop.estimatedArrival ? `• ${stop.estimatedArrival}` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
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
