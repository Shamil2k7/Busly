import React, { useState } from 'react';
import { Search, Phone, MapPin } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function TeacherRosterScreen({ onOpenAddStudent }) {
  const { tripState } = useMobileAuth();
  const [search, setSearch] = useState('');
  const [filterDiv, setFilterDiv] = useState('ALL');

  const students = tripState.students || [];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesDiv = filterDiv === 'ALL' || s.class.includes(filterDiv);
    return matchesSearch && matchesDiv;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_BUS':
        return { label: 'On Bus', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'DROPPED_OFF':
        return { label: 'Dropped', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'ABSENT':
        return { label: 'Absent', bg: 'bg-red-50 text-red-800 border-red-200' };
      case 'WAITING':
      default:
        return { label: 'Waiting', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-3.5 overflow-y-auto no-scrollbar font-sans">
      {/* Header and Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Class 10 Student Roster ({filteredStudents.length})
          </h3>
          <button
            onClick={onOpenAddStudent}
            className="text-[11px] font-bold text-slate-900 bg-busly-primary hover:bg-busly-primary-hover px-2.5 py-1 rounded-lg shadow-2xs transition"
          >
            + Enroll
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 shadow-2xs focus-within:border-amber-500">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name or ID..."
            className="bg-transparent flex-1 focus:outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Division Filter Pills */}
        <div className="flex gap-1.5 pt-1">
          {['ALL', '10-A', '10-B'].map((div) => (
            <button
              key={div}
              onClick={() => setFilterDiv(div)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filterDiv === div
                  ? 'bg-busly-primary text-slate-900 font-extrabold shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {div === 'ALL' ? 'All Classes' : div}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards List */}
      <div className="space-y-2.5">
        {filteredStudents.map((st) => {
          const badge = getStatusBadge(st.status);

          return (
            <div
              key={st.id}
              className="bg-white border border-gray-200/80 rounded-xl p-3.5 space-y-2.5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{st.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Class {st.class} • ID: <span className="font-mono text-gray-700">{st.studentId}</span>
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              {/* Stop & Parent info */}
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[11px] text-gray-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{st.stop || 'Nilambur Stop'}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Parent: {st.parentName || 'Guardian'}
                  </p>
                </div>

                {st.parentMobile && (
                  <a
                    href={`tel:${st.parentMobile}`}
                    className="p-1.5 px-2.5 rounded-lg bg-white text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-300 flex items-center gap-1 text-[11px] font-bold transition shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Parent</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
