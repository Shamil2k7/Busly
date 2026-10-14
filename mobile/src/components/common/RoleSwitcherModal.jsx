import React, { useState } from 'react';
import { X, Check, Server, Bus, Users, Shield, Gauge } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { mobileApi } from '../../config/api';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { user, switchRole } = useMobileAuth();
  const [apiUrl, setApiUrl] = useState(mobileApi.getBaseUrl());
  const [showApiConfig, setShowApiConfig] = useState(false);

  if (!isOpen) return null;

  const handleSelectRole = (role) => {
    switchRole(role);
    onClose();
  };

  const handleSaveApiUrl = () => {
    mobileApi.setBaseUrl(apiUrl);
    setShowApiConfig(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in font-sans">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl text-gray-900 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-busly-primary text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm">
              <Bus className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Switch Mobile Persona</h3>
              <p className="text-[11px] text-gray-500">Test different user experiences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Options */}
        <div className="space-y-2">
          {/* Parent Persona */}
          <button
            onClick={() => handleSelectRole('PARENT')}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              user?.role === 'PARENT'
                ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                👨‍👩‍👦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">Parent Portal</span>
                  <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                    FAM7824
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Arun Kumar • 2 Kids (Rahul & Anu)</p>
              </div>
            </div>
            {user?.role === 'PARENT' && <Check className="w-4 h-4 text-amber-600 font-bold" />}
          </button>

          {/* Teacher Persona */}
          <button
            onClick={() => handleSelectRole('TEACHER')}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              user?.role === 'TEACHER'
                ? 'bg-indigo-50/80 border-indigo-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-sm">
                👩‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">Teacher Portal</span>
                  <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-1.5 py-0.2 rounded font-mono font-bold">
                    Class 10
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Anu Thomas • Quick Admissions & Roster</p>
              </div>
            </div>
            {user?.role === 'TEACHER' && <Check className="w-4 h-4 text-indigo-600 font-bold" />}
          </button>

          {/* Driver Persona */}
          <button
            onClick={() => handleSelectRole('DRIVER')}
            className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
              user?.role === 'DRIVER'
                ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm">
                🚍
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">Driver Cockpit</span>
                  <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-bold">
                    BUS 01
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">Rajesh Kumar • Telemetry & Manifest</p>
              </div>
            </div>
            {user?.role === 'DRIVER' && <Check className="w-4 h-4 text-emerald-600 font-bold" />}
          </button>
        </div>

        {/* API Connection Settings Toggle */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-900"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Server className="w-3.5 h-3.5 text-amber-500" />
              API Server: <span className="font-mono text-gray-700">{mobileApi.getBaseUrl()}</span>
            </span>
            <span className="text-[10px] text-amber-600 font-bold underline">Configure</span>
          </button>

          {showApiConfig && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <label className="text-[11px] text-gray-600 font-medium">Backend Base URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:5000 or http://192.168.1.5:5000"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveApiUrl}
                className="w-full py-1.5 rounded-lg bg-busly-primary text-slate-900 text-xs font-bold hover:bg-busly-primary-hover transition"
              >
                Save URL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
