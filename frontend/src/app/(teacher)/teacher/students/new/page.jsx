'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Bus,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function TeacherAddStudentPage() {
  const router = useRouter();
  const [buses, setBuses] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    studentId: `STU-${Math.floor(100 + Math.random() * 900)}`,
    class: '10',
    division: 'A',
    parentName: '',
    parentMobile: '',
    parentEmail: '',
    relationship: 'FATHER',
    busId: '',
    feePlanId: '',
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [bRes, fpRes] = await Promise.all([
          api.get('/api/buses'),
          api.get('/api/fees/plans'),
        ]);
        if (bRes.success && bRes.data) {
          setBuses(bRes.data);
          if (bRes.data[0]) {
            setFormData((prev) => ({ ...prev, busId: bRes.data[0].id }));
          }
        }
        if (fpRes.success && fpRes.data) {
          setFeePlans(fpRes.data);
          if (fpRes.data[0]) {
            setFormData((prev) => ({ ...prev, feePlanId: fpRes.data[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/students', formData);
      if (res.success) {
        showToast('Student enrolled successfully!', 'success');
        setCreatedResult(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to enroll student', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Add New Student"
        subtitle="Enrollment & Family Code Generation"
        rightAction={
          <Link href="/teacher/students">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        {createdResult ? (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-green-200 p-6 text-center shadow-sm space-y-3">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Student Enrolled!</h2>
              <p className="text-xs text-gray-600">
                {createdResult.student?.name} is registered for school transportation.
              </p>

              {/* Crucial Generated Family Code Display */}
              <div className="my-5 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-center shadow-inner">
                <div className="flex items-center justify-center space-x-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Generated Family Code</span>
                </div>
                <p className="text-4xl font-black font-mono tracking-widest text-amber-900 my-2">
                  {createdResult.familyCode}
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Provide this code to parent: <span className="font-bold">{formData.parentName}</span> ({formData.parentMobile})
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 text-left text-xs space-y-1.5 border border-gray-100">
                <p className="font-bold text-gray-700">Login Instructions for Parent:</p>
                <ol className="list-decimal list-inside text-gray-600 space-y-0.5 text-[11px]">
                  <li>Open Busly Parent Portal or Mobile App</li>
                  <li>Enter School Code: <span className="font-bold text-gray-900">ABC123</span></li>
                  <li>Enter Family Code: <span className="font-bold font-mono text-amber-800">{createdResult.familyCode}</span></li>
                  <li>Enter Registered Mobile: <span className="font-bold text-gray-900">{formData.parentMobile}</span></li>
                  <li>Verify 6-digit OTP to access child live tracking & fees!</li>
                </ol>
              </div>

              <div className="pt-2 flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
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
                  }}
                >
                  Enroll Another
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => router.push('/teacher/students')}
                >
                  Go to Roster
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Info Card */}
            <Card>
              <CardHeader title="Student Details" subtitle="Academic identity" />
              <CardContent className="space-y-3">
                <Input
                  label="Student Full Name"
                  placeholder="e.g. Rahul Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Student ID"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                  />
                  <Select
                    label="Class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    options={[
                      { value: '10', label: '10' },
                      { value: '9', label: '9' },
                      { value: '8', label: '8' },
                      { value: '7', label: '7' },
                      { value: '6', label: '6' },
                    ]}
                  />
                  <Select
                    label="Division"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    options={[
                      { value: 'A', label: 'A' },
                      { value: 'B', label: 'B' },
                      { value: 'C', label: 'C' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parent Info Card */}
            <Card>
              <CardHeader
                title="Parent / Guardian Contact"
                subtitle="Used for OTP authentication & Family Code creation"
              />
              <CardContent className="space-y-3">
                <Input
                  label="Parent Full Name"
                  placeholder="e.g. Arun Kumar"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Registered Mobile (OTP)"
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

                <Input
                  label="Parent Email (Optional)"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                />
              </CardContent>
            </Card>

            {/* Transport & Fee Plan */}
            <Card>
              <CardHeader title="Transport & Fee Plan" subtitle="Bus routing" />
              <CardContent className="space-y-3">
                <Select
                  label="Assigned Bus"
                  value={formData.busId}
                  onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                >
                  <option value="">Select a bus...</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.registrationNumber})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Assigned Fee Plan"
                  value={formData.feePlanId}
                  onChange={(e) => setFormData({ ...formData, feePlanId: e.target.value })}
                >
                  <option value="">Select fee plan...</option>
                  {feePlans.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name} (₹{fp.amount}/{fp.billingPeriod.toLowerCase()})
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md"
              loading={loading}
            >
              Enroll Student & Generate Family Code
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}
