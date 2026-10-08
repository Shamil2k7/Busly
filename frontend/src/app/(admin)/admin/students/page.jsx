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
  Trash2,
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');

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
    feePlanId: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  const loadData = async () => {
    try {
      const [stRes, bRes, fpRes] = await Promise.all([
        api.get(`/api/students?search=${encodeURIComponent(search)}${filterClass ? `&class=${filterClass}` : ''}`),
        api.get('/api/buses'),
        api.get('/api/fees/plans'),
      ]);

      if (stRes.success) setStudents(stRes.data);
      if (bRes.success) setBuses(bRes.data);
      if (fpRes.success) setFeePlans(fpRes.data);
    } catch (err) {
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterClass]);

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

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-3">
            <div className="w-72">
              <Input
                icon={Search}
                placeholder="Search by student name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                options={[
                  { value: '', label: 'All Classes' },
                  { value: '10', label: 'Class 10' },
                  { value: '9', label: 'Class 9' },
                  { value: '8', label: 'Class 8' },
                  { value: '7', label: 'Class 7' },
                  { value: '6', label: 'Class 6' },
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setCreatedResult(null);
              setFormData({
                name: '',
                studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
                class: '10',
                division: 'A',
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

        {/* Student Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
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
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                options={[
                  { value: '10', label: 'Class 10' },
                  { value: '9', label: 'Class 9' },
                  { value: '8', label: 'Class 8' },
                  { value: '7', label: 'Class 7' },
                  { value: '6', label: 'Class 6' },
                ]}
              />
              <Select
                label="Division"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                options={[
                  { value: 'A', label: 'Division A' },
                  { value: 'B', label: 'Division B' },
                  { value: 'C', label: 'Division C' },
                ]}
              />
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
                <div className="grid grid-cols-2 gap-3">
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
              <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}
