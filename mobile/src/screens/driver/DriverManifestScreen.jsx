import React, { useState } from 'react';
import { Phone, MapPin } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function DriverManifestScreen() {
  const { tripState, updateStudentStatus } = useMobileAuth();
  const [filterStop, setFilterStop] = useState('ALL');

  const students = tripState.students || [];
  const stops = tripState.stops || [];

  const filteredStudents = students.filter((s) => {
    if (filterStop === 'ALL') return true;
    return s.stop === filterStop;
  });

  const currentStopName = stops[tripState.currentStopIndex]?.name;

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-3.5 overflow-y-auto no-scrollbar font-sans">
      {/* Header and Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Passenger Boarding Manifest
            </h3>
            <p className="text-[11px] text-gray-500">Tap to mark boarding status</p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg">
            {students.length} Total Students
          </span>
        </div>

        {/* Quick Stop Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterStop('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition ${
              filterStop === 'ALL'
                ? 'bg-busly-primary text-slate-900 font-extrabold shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Stops
          </button>
          {currentStopName && (
            <button
              onClick={() => setFilterStop(currentStopName)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition flex items-center gap-1 ${
                filterStop === currentStopName
                  ? 'bg-busly-primary text-slate-900 font-extrabold shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <span>Current: {currentStopName}</span>
            </button>
          )}
          {stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => setFilterStop(stop.name)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition ${
                filterStop === stop.name
                  ? 'bg-busly-primary text-slate-900 font-extrabold shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {stop.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manifest Cards List */}
      <div className="space-y-2.5">
        {filteredStudents.map((st) => {
          const isOnBus = st.status === 'ON_BUS' || st.status === 'PICKED_UP';
          const isDropped = st.status === 'DROPPED_OFF';
          const isAbsent = st.status === 'ABSENT';
          const isWaiting = st.status === 'WAITING';

          return (
            <div
              key={st.id}
              className={`bg-white border rounded-xl p-3 space-y-2.5 transition shadow-2xs ${
                isOnBus
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : isDropped
                  ? 'border-blue-300 bg-blue-50/30'
                  : isAbsent
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-gray-200/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{st.name}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Class {st.class} • <span className="font-mono text-gray-700">{st.studentId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isOnBus
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isDropped
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : isAbsent
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isOnBus
                      ? 'BOARDED'
                      : isDropped
                      ? 'DROPPED'
                      : isAbsent
                      ? 'ABSENT'
                      : 'WAITING'}
                  </span>

                  {st.parentMobile && (
                    <a
                      href={`tel:${st.parentMobile}`}
                      className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition border border-gray-200"
                      title="Call Parent"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stop tag */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Stop: <strong className="text-gray-800">{st.stop}</strong></span>
              </div>

              {/* One-Tap Status Toggles */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => updateStudentStatus(st.id, 'ON_BUS')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    isOnBus
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  ✓ Boarded
                </button>

                <button
                  onClick={() => updateStudentStatus(st.id, 'DROPPED_OFF')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    isDropped
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  ↓ Dropped
                </button>

                <button
                  onClick={() => updateStudentStatus(st.id, 'ABSENT')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    isAbsent
                      ? 'bg-red-600 text-white border-red-600 shadow-2xs font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-700'
                  }`}
                >
                  ✗ Absent
                </button>

                <button
                  onClick={() => updateStudentStatus(st.id, 'WAITING')}
                  className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    isWaiting
                      ? 'bg-busly-primary text-slate-900 border-amber-400 shadow-2xs font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  ⌛ Waiting
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
