import React, { useState } from 'react';
import {
  KeyRound,
  Phone,
  ShieldCheck,
  ArrowRight,
  School,
  Lock,
  Bus,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { mobileApi } from '../../config/api';

export default function AuthScreen() {
  const { switchRole, setUser, showToast } = useMobileAuth();
  const [selectedRole, setSelectedRole] = useState('PARENT'); // PARENT, TEACHER, DRIVER
  const [parentLoginMode, setParentLoginMode] = useState('FAMILY_CODE'); // FAMILY_CODE or OTP

  // Form states
  const [schoolCode, setSchoolCode] = useState('ABC123');
  const [familyCode, setFamilyCode] = useState('FAM7824');
  const [mobileNumber, setMobileNumber] = useState('9876543220');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleParentFamilyLogin = async (e) => {
    e.preventDefault();
    if (!familyCode) {
      showToast('Please enter your Family Code', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.post('/api/auth/family-login', {
        familyCode: familyCode.trim().toUpperCase(),
        schoolCode: schoolCode.trim().toUpperCase(),
      });
      if (res.success && res.data) {
        mobileApi.setToken(res.data.token);
        setUser(res.data.user);
        showToast('Logged in successfully!', 'success');
      }
    } catch (err) {
      showToast('Backend offline, loading Parent Demo', 'info');
      switchRole('PARENT');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!mobileNumber) {
      showToast('Please enter registered mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.post('/api/auth/otp/request', {
        role: selectedRole,
        schoolCode: schoolCode.trim().toUpperCase(),
        mobile: mobileNumber.trim(),
      });
      if (res.success) {
        setOtpRequested(true);
        setOtp(res.data?.devOtp || '123456');
        showToast('OTP sent! Code: ' + (res.data?.devOtp || '123456'), 'success');
      }
    } catch (err) {
      setOtpRequested(true);
      setOtp('123456');
      showToast('Demo OTP generated: 123456', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter 6-digit OTP', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await mobileApi.post('/api/auth/otp/verify', {
        sessionId: 'demo-session',
        role: selectedRole,
        mobile: mobileNumber.trim(),
        otp: otp.trim(),
      });
      if (res.success && res.data) {
        mobileApi.setToken(res.data.token);
        setUser(res.data.user);
        showToast('Authenticated successfully!', 'success');
      }
    } catch (err) {
      switchRole(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-5 safe-top safe-bottom overflow-y-auto no-scrollbar font-sans">
      {/* Brand Header */}
      <div className="text-center my-3 space-y-2">
        <div className="inline-flex w-12 h-12 rounded-xl bg-busly-primary text-slate-900 items-center justify-center font-black text-2xl shadow-sm">
          <Bus className="w-6 h-6 fill-current" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">BUSLY</h2>
        <p className="text-xs text-gray-500">
          {selectedRole === 'PARENT'
            ? 'Parent Portal Access'
            : selectedRole === 'TEACHER'
            ? 'Teacher Transport Portal'
            : 'Driver Mobile Cockpit'}
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-4 border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setSelectedRole('PARENT');
            setOtpRequested(false);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            selectedRole === 'PARENT'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Parent</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('TEACHER');
            setOtpRequested(false);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            selectedRole === 'TEACHER'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Teacher</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedRole('DRIVER');
            setOtpRequested(false);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            selectedRole === 'DRIVER'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Driver</span>
        </button>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Parent-Only Login Method Selector */}
        {selectedRole === 'PARENT' && (
          <div className="grid grid-cols-2 p-1 bg-blue-50/70 border border-blue-100 rounded-xl gap-1 mb-2">
            <button
              type="button"
              onClick={() => setParentLoginMode('FAMILY_CODE')}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                parentLoginMode === 'FAMILY_CODE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900 hover:bg-blue-100/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Family Code</span>
            </button>
            <button
              type="button"
              onClick={() => setParentLoginMode('OTP')}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                parentLoginMode === 'OTP'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900 hover:bg-blue-100/60'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Phone OTP</span>
            </button>
          </div>
        )}

        {/* Parent Family Code Flow */}
        {selectedRole === 'PARENT' && parentLoginMode === 'FAMILY_CODE' ? (
          <form onSubmit={handleParentFamilyLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                School Code
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus-within:border-amber-500 focus-within:bg-white transition">
                <School className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="bg-transparent flex-1 text-sm font-bold uppercase focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                Family Code
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus-within:border-amber-500 focus-within:bg-white transition">
                <KeyRound className="w-4 h-4 text-amber-500 mr-2" />
                <input
                  type="text"
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FAM7824"
                  className="bg-transparent flex-1 text-sm font-mono font-bold uppercase tracking-wider focus:outline-none text-gray-900"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Provided during admission (e.g. <span className="text-amber-600 font-mono font-bold">FAM7824</span>)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-busly-primary hover:bg-busly-primary-hover text-slate-900 font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 touch-press"
            >
              <span>{loading ? 'Accessing...' : 'Open Family Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* OTP Flow */
          <form onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                School Code
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus-within:border-amber-500 focus-within:bg-white transition">
                <School className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="bg-transparent flex-1 text-sm font-bold uppercase focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                Registered Mobile Number
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus-within:border-amber-500 focus-within:bg-white transition">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="bg-transparent flex-1 text-sm font-mono focus:outline-none"
                  required
                />
              </div>
            </div>

            {otpRequested && (
              <div className="animate-fade-in">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                  6-Digit OTP Code
                </label>
                <div className="flex items-center bg-amber-50 border border-amber-400 rounded-xl px-3 py-2 text-gray-900">
                  <Lock className="w-4 h-4 text-amber-600 mr-2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="bg-transparent flex-1 text-center font-mono font-black text-lg tracking-widest text-gray-900 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-busly-primary hover:bg-busly-primary-hover text-slate-900 font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 touch-press"
            >
              <span>{loading ? 'Verifying...' : otpRequested ? 'Verify & Sign In' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Instant 1-Tap Evaluation Logins */}
      <div className="mt-5 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Instant Demo Evaluation
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => switchRole('PARENT')}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-amber-400 text-center transition shadow-2xs hover:shadow-sm"
          >
            <span className="text-xl block">👨‍👩‍👦</span>
            <span className="text-[10px] font-bold text-gray-800 block mt-1">Parent</span>
            <span className="text-[9px] text-amber-700 font-mono block">FAM7824</span>
          </button>

          <button
            onClick={() => switchRole('TEACHER')}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-amber-400 text-center transition shadow-2xs hover:shadow-sm"
          >
            <span className="text-xl block">👩‍🏫</span>
            <span className="text-[10px] font-bold text-gray-800 block mt-1">Teacher</span>
            <span className="text-[9px] text-indigo-700 font-mono block">Class 10</span>
          </button>

          <button
            onClick={() => switchRole('DRIVER')}
            className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-amber-400 text-center transition shadow-2xs hover:shadow-sm"
          >
            <span className="text-xl block">🚍</span>
            <span className="text-[10px] font-bold text-gray-800 block mt-1">Driver</span>
            <span className="text-[9px] text-emerald-700 font-mono block">BUS 01</span>
          </button>
        </div>
      </div>
    </div>
  );
}
