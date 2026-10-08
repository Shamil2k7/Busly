'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bus, Smartphone, School, KeyRound, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function OtpLoginContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'PARENT';

  const { requestOtp, verifyOtp } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify

  const [schoolCode, setSchoolCode] = useState('ABC123');
  const [familyCode, setFamilyCode] = useState('FAM7824');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('role')) {
      setRole(searchParams.get('role'));
    }
  }, [searchParams]);

  // Set default demo numbers when role switches
  useEffect(() => {
    setError('');
    setStep(1);
    if (role === 'PARENT') {
      setMobile('9876543220');
      setFamilyCode('FAM7824');
    } else if (role === 'TEACHER') {
      setMobile('9876543210');
      setFamilyCode('');
    } else if (role === 'DRIVER') {
      setMobile('9876543211');
      setFamilyCode('');
    }
  }, [role]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!schoolCode || !mobile || (role === 'PARENT' && !familyCode)) {
      setError('Please fill all required fields');
      return;
    }

    setError('');
    setLoading(true);
    const res = await requestOtp({
      role,
      schoolCode: schoolCode.trim().toUpperCase(),
      mobile: mobile.trim(),
      familyCode: role === 'PARENT' ? familyCode.trim().toUpperCase() : undefined,
    });

    if (res.success) {
      setSessionId(res.data.sessionId);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        setOtp(res.data.devOtp); // Auto-fill in dev mode
      }
      setStep(2);
    } else {
      setError(res.error || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);
    const res = await verifyOtp({
      sessionId,
      role,
      mobile: mobile.trim(),
      otp: otp.trim(),
    });

    if (!res.success) {
      setError(res.error || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-busly-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="w-11 h-11 rounded-xl bg-busly-primary text-busly-dark flex items-center justify-center font-black text-xl shadow-sm">
            <Bus className="w-6 h-6 fill-current" />
          </div>
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">BUSLY</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">
          Secure OTP Verification
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          No password needed. Simple, verified mobile authentication.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-8">
          {/* Role Switcher Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            {['PARENT', 'TEACHER', 'DRIVER'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  role === r
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r === 'PARENT' ? 'Parent' : r === 'TEACHER' ? 'Teacher' : 'Driver'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                label="School Code"
                icon={School}
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="e.g. ABC123"
                helperText="Provided by your school administration"
                required
              />

              {role === 'PARENT' && (
                <Input
                  label="Family Code"
                  icon={KeyRound}
                  value={familyCode}
                  onChange={(e) => setFamilyCode(e.target.value)}
                  placeholder="e.g. FAM7824"
                  helperText="Unique family identifier for all your children"
                  required
                />
              )}

              <Input
                label="Registered Mobile Number"
                type="tel"
                icon={Smartphone}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                loading={loading}
              >
                Send Verification OTP <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {devOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-2">
                  <span className="font-bold">Sandbox Dev OTP: </span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-extrabold text-sm ml-1">
                    {devOtp}
                  </span>
                </div>
              )}

              <Input
                label="Enter 6-Digit OTP"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="text-center font-mono tracking-widest text-lg"
                required
                autoFocus
              />

              <p className="text-xs text-gray-500 text-center">
                Sent to <span className="font-semibold text-gray-800">+91 {mobile}</span>
              </p>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-gray-500 hover:text-gray-800 text-center pt-2"
              >
                Change mobile or codes
              </button>
            </form>
          )}

          {/* Preset Buttons for Demo */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
              Seeded Test Profiles
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => {
                  setRole('PARENT');
                  setSchoolCode('ABC123');
                  setFamilyCode('FAM7824');
                  setMobile('9876543220');
                }}
                className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-700"
              >
                Arun (Parent)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('TEACHER');
                  setSchoolCode('ABC123');
                  setMobile('9876543210');
                }}
                className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-700"
              >
                Anu (Teacher)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('DRIVER');
                  setSchoolCode('ABC123');
                  setMobile('9876543211');
                }}
                className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-medium text-gray-700"
              >
                Rajesh (Driver)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-600">
            School Administrator?{' '}
            <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 underline">
              Admin Password Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OtpLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-xs text-gray-500">Loading portal...</p></div>}>
      <OtpLoginContent />
    </Suspense>
  );
}
