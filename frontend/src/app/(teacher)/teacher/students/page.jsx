'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Bus, KeyRound, Phone } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api-client';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/students?search=${encodeURIComponent(search)}`);
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Student Roster"
        subtitle={`Enrolled: ${students.length} students`}
        rightAction={
          <Link href="/teacher/students/new">
            <Button variant="primary" size="sm" className="px-2.5 py-1 text-xs">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        <Input
          icon={Search}
          placeholder="Search by student name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No students found in your roster.
            </div>
          ) : (
            students.map((st) => (
              <Card key={st.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{st.name}</h3>
                    <p className="text-xs text-gray-500">
                      Class {st.class}-{st.division} • {st.studentId}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                    {st.family?.familyCode}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold">{st.bus?.busNumber || 'No Bus'}</span>
                  </div>
                  <span className="text-gray-500">
                    Parent: {st.family?.parents?.[0]?.name} ({st.family?.parents?.[0]?.mobile})
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
