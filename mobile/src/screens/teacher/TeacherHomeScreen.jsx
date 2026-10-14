import React from 'react';
import {
  Users,
  PlusCircle,
  Bus,
  ArrowRight,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function TeacherHomeScreen({ onNavigate, onOpenAddStudent }) {
  const { user, tripState } = useMobileAuth();

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      {/* Quick Add Student Callout Banner (Matching web app) */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-slate-900 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded">
              Quick Action
            </span>
            <h3 className="font-extrabold text-base mt-1">Enroll New Student</h3>
            <p className="text-xs text-slate-900/80 mt-0.5">
              Add student & generate their Parent Family Code.
            </p>
          </div>
          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow flex items-center gap-1 touch-press"
          >
            <PlusCircle className="w-4 h-4 mr-0.5 text-amber-400" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Grid (Matching web Card style) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">My Students</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">{tripState.students?.length || 24}</p>
          <p className="text-[10px] text-gray-400 font-medium">Class roster</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-3.5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">Active Buses</span>
            <Bus className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-gray-900">2</p>
          <p className="text-[10px] text-emerald-600 font-semibold">On transit</p>
        </div>
      </div>

      {/* Today's Bus Operations (Matching web Card) */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Today’s Bus Runs</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live status of school transport</p>
          </div>
          <button
            onClick={() => onNavigate('fleet')}
            className="text-xs text-amber-600 font-bold flex items-center gap-0.5 hover:underline"
          >
            <span>Track Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {/* Bus 01 Item */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-busly-primary text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                01
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">BUS 01 (Nilambur Route)</h4>
                <p className="text-[10px] text-gray-500">Driver: Rajesh Kumar • Speed: {tripState.speed} km/h</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>

          {/* Bus 02 Item */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">BUS 02 (Town Church Route)</h4>
                <p className="text-[10px] text-gray-500">Driver: Suresh Babu • Standing at Stop 2</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
