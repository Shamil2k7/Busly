'use client';

import React, { useState, useEffect } from 'react';
import { Settings, School, Phone, Mail, MapPin, Save, ShieldCheck } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/schools');
        if (res.success && res.data[0]) {
          setSchool(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!school) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/schools/${school.id}`, school);
      if (res.success) {
        showToast('School profile updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="School Transport Settings" subtitle="Institution Profile, Contact & Busly Integration" />

      <main className="p-6 space-y-6 max-w-4xl">
        <Card>
          <CardHeader
            title="School Profile Information"
            subtitle="Details displayed to parents, drivers, and teachers in their applications"
          />
          <CardContent>
            {school ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="School Name"
                    value={school.name || ''}
                    onChange={(e) => setSchool({ ...school, name: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      School Code (System Ident)
                    </label>
                    <input
                      type="text"
                      value={school.code || ''}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2.5 text-sm font-mono font-bold text-gray-600 cursor-not-allowed"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Used by teachers, drivers, and parents for OTP sign in.
                    </p>
                  </div>
                </div>

                <Input
                  label="Campus Address"
                  icon={MapPin}
                  value={school.address || ''}
                  onChange={(e) => setSchool({ ...school, address: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Emergency Transport Phone"
                    icon={Phone}
                    value={school.phone || ''}
                    onChange={(e) => setSchool({ ...school, phone: e.target.value })}
                  />
                  <Input
                    label="Official Transport Email"
                    icon={Mail}
                    type="email"
                    value={school.email || ''}
                    onChange={(e) => setSchool({ ...school, email: e.target.value })}
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <Button type="submit" variant="primary" loading={saving}>
                    <Save className="w-4 h-4 mr-1.5" /> Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400">Loading settings...</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
