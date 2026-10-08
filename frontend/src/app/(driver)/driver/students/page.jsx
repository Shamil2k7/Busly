'use client';

import React, { useState, useEffect } from 'react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api-client';

export default function DriverStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/students');
        if (res.success) setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Assigned Passengers" subtitle={`${students.length} students on your bus`} />

      <main className="p-4 space-y-3">
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No students currently assigned to this bus.
          </div>
        ) : (
          students.map((st) => (
            <Card key={st.id} className="p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{st.name}</h4>
                <p className="text-xs text-gray-500">
                  Class {st.class}-{st.division} • Stop: {st.pickupStop?.name || 'School Gate'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Parent: {st.family?.parents?.[0]?.name} ({st.family?.parents?.[0]?.mobile})
                </p>
              </div>
              <Badge variant="primary" size="sm">
                Passenger
              </Badge>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
