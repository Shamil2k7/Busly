'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, KeyRound, Phone, Users, Search } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api-client';

export default function AdminParentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
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

      <main className="p-6 space-y-6 max-w-7xl">
        <div className="w-80">
          <Input
            icon={Search}
            placeholder="Search by family code, parent, or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Parents / Guardians
                    </p>
                    {fam.parents.map((p) => (
                      <div key={p.id} className="text-xs text-gray-800 font-medium mt-1">
                        <p className="font-bold">{p.name} ({p.relationship})</p>
                        <p className="text-[11px] text-gray-500 font-mono flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{p.mobile}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
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
    </div>
  );
}
