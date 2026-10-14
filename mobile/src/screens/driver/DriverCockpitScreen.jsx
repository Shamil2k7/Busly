import React, { useState } from 'react';
import {
  MapPin,
  Play,
  Square,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function DriverCockpitScreen({ onNavigate, onOpenSos }) {
  const { user, tripState, nextStop, startTrip, endTrip } = useMobileAuth();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const stops = tripState.stops;
  const currentStop = stops[tripState.currentStopIndex] || stops[0];
  const nextStopObj = stops[tripState.currentStopIndex + 1];

  const students = tripState.students || [];
  const boardedCount = students.filter((s) => s.status === 'ON_BUS' || s.status === 'PICKED_UP').length;
  const waitingCount = students.filter((s) => s.status === 'WAITING').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;

  const isTripActive = tripState.status === 'ACTIVE';

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      {/* Cockpit Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 font-mono">
                {user?.assignedBus?.busNumber || 'BUS 01'}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {user?.assignedBus?.registrationNumber || 'KL-10-AZ-1001'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Driver: {user?.name}</p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              isTripActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {isTripActive ? 'TRIP ACTIVE' : 'STANDBY'}
          </span>
        </div>

        {/* Speed & Telemetry HUD */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-900 text-white rounded-xl p-3 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Speedometer
            </span>
            <div className="flex items-baseline justify-center gap-1 my-0.5">
              <span className="text-3xl font-black text-white font-mono">{tripState.speed}</span>
              <span className="text-xs text-amber-400 font-bold">km/h</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">● GPS Broadcasting</span>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-3 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Passenger Manifest
            </span>
            <div className="flex items-baseline justify-center gap-1 my-0.5">
              <span className="text-3xl font-black text-amber-400 font-mono">{boardedCount}</span>
              <span className="text-xs text-slate-400 font-bold">/ {students.length}</span>
            </div>
            <span className="text-[9px] text-slate-300 font-medium">{waitingCount} Waiting • {absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* Current Stop & Next Stop Information */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-bold uppercase tracking-wider">
            Stop {tripState.currentStopIndex + 1} of {stops.length}
          </span>
          <span className="text-amber-600 font-mono font-bold">{currentStop.eta}</span>
        </div>

        {/* Current Stop Box */}
        <div className="bg-amber-50/60 p-3.5 rounded-xl border-2 border-amber-300 space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> Current Station
          </span>
          <h3 className="text-base font-extrabold text-gray-900">{currentStop.name}</h3>
          <p className="text-xs text-gray-600">
            Scheduled arrival: <span className="font-semibold text-gray-800">{currentStop.eta}</span>
          </p>
        </div>

        {/* Next Stop Preview */}
        {nextStopObj && (
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-semibold">Upcoming Stop:</span>
              <span className="font-bold text-gray-800">{nextStopObj.name}</span>
            </div>
            <span className="text-gray-500 font-mono text-[11px] font-semibold">{nextStopObj.eta}</span>
          </div>
        )}
      </div>

      {/* Driver Controls */}
      <div className="space-y-2 pt-1">
        {isTripActive ? (
          <>
            {/* Advance Next Stop Button */}
            <button
              onClick={nextStop}
              disabled={tripState.currentStopIndex >= stops.length - 1}
              className="w-full py-3 rounded-xl bg-busly-primary text-slate-900 font-bold text-sm hover:bg-busly-primary-hover transition shadow-sm flex items-center justify-center gap-2 touch-press"
            >
              <span>Arrive at Next Stop ({nextStopObj ? nextStopObj.name : 'End of Route'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Manifest View Button */}
            <button
              onClick={() => onNavigate('manifest')}
              className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Mark Student Boarding ({waitingCount} Waiting)</span>
            </button>

            {/* End Trip Button */}
            <button
              onClick={() => setShowEndConfirm(true)}
              className="w-full py-2 rounded-xl bg-white text-gray-500 hover:text-red-600 font-semibold text-xs border border-gray-200 transition flex items-center justify-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Complete & End Trip</span>
            </button>
          </>
        ) : (
          <button
            onClick={startTrip}
            className="w-full py-3.5 rounded-xl bg-green-600 text-white font-bold text-base hover:bg-green-700 transition shadow-sm flex items-center justify-center gap-2 touch-press"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START MORNING TRIP</span>
          </button>
        )}
      </div>

      {/* End Trip Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-gray-900">End Current Trip?</h3>
            <p className="text-xs text-gray-500">
              This will complete the trip log and notify school dispatch and parents.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  endTrip();
                  setShowEndConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                End Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
