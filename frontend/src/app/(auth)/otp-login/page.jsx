'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bus, Smartphone, School, KeyRound, ArrowRight, ShieldCheck, Sparkles, Hash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function OtpLoginContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'PARENT';
  const initialMode = searchParams.get('mode') || 'FAMILY_CODE'; // 'FAMILY_CODE' or 'MOBILE_OTP'

  const { requestOtp, verifyOtp, loginByFamilyCode } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [parentLoginMode, setParentLoginMode] = useState(initialMode); // 'FAMILY_CODE' | 'MOBILE_OTP'
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
    if (searchParams.get('mode')) {
      setParentLoginMode(searchParams.get('mode'));
    }
  }, [searchParams]);

  // Set default demo numbers when role switches
  useEffect(() => {
    setError('');
    setStep(1);
    if (role === 'PARENT') {
      setMobile('9876543220');
      setFamilyCode('FAM7824');
      setSchoolCode('ABC123');
    } else if (role === 'TEACHER') {
      setMobile('9876543210');
      setSchoolCode('ABC123');
      setFamilyCode('');
    } else if (role === 'DRIVER') {
      setMobile('9876543211');
      setSchoolCode('ABC123');
      setFamilyCode('');
    }
  }, [role]);

  // Option 1: Direct Family Code Only Login
  const handleFamilyCodeLogin = async (e) => {
    e.preventDefault();
    if (!familyCode || !familyCode.trim()) {
      setError('Please enter your Family Code');
      return;
    }

    setError('');
    setLoading(true);
    const res = await loginByFamilyCode(familyCode.trim().toUpperCase());
    if (!res.success) {
      setError(res.error || 'Invalid Family Code. Please check and try again.');
    }
    setLoading(false);
  };

  // Option 2: Mobile Number & School Code OTP Login
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!schoolCode || !mobile) {
      setError('Please enter both School Code and Mobile Number');
      return;
    }

    setError('');
    setLoading(true);
    const res = await requestOtp({
      role,
      schoolCode: schoolCode.trim().toUpperCase(),
      mobile: mobile.trim(),
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
          {role === 'PARENT' ? 'Parent Portal Access' : 'Secure Staff Login'}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {role === 'PARENT'
            ? 'Sign in using your Family Code or Mobile Number & School Code'
            : 'No password needed. Simple, verified mobile authentication.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-8">
          {/* Main Role Switcher Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-5">
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

          {/* PARENT TWO-OPTION TOGGLE */}
          {role === 'PARENT' && (
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider text-center">
                Choose Parent Login Method
              </p>
              <div className="grid grid-cols-2 p-1 bg-blue-50/70 border border-blue-100 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setParentLoginMode('FAMILY_CODE');
                    setError('');
                    setStep(1);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    parentLoginMode === 'FAMILY_CODE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-900 hover:bg-blue-100/60'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>1. Family Code Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParentLoginMode('MOBILE_OTP');
                    setError('');
                    setStep(1);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    parentLoginMode === 'MOBILE_OTP'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-900 hover:bg-blue-100/60'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>2. Mobile & School Code</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* PARENT OPTION 1: FAMILY CODE ONLY */}
          {role === 'PARENT' && parentLoginMode === 'FAMILY_CODE' ? (
            <form onSubmit={handleFamilyCodeLogin} className="space-y-4">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-950">
                <div className="flex items-center space-x-1.5 font-bold text-blue-900">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>Zero-Friction Instant Access</span>
                </div>
                <p className="mt-1 text-gray-600 text-[11px] leading-relaxed">
                  Enter your unique 7-character Family Code (e.g. <span className="font-mono font-bold text-gray-900">FAM7824</span>) provided by your school. No password or OTP required.
                </p>
              </div>

              <Input
                label="Family Code"
                icon={KeyRound}
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                placeholder="e.g. FAM7824"
                helperText="Provided on your child's bus pass or admission record"
                className="uppercase font-mono font-bold tracking-widest text-base"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                loading={loading}
              >
                Access Family Portal <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          ) : step === 1 ? (
            /* PARENT OPTION 2 (MOBILE + SCHOOL CODE) OR TEACHER/DRIVER OTP STEP 1 */
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {role === 'PARENT' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 mb-1">
                  <p className="text-[11px] leading-relaxed">
                    Verify via OTP using your school code and registered mobile number. No family code required.
                  </p>
                </div>
              )}

              <Input
                label="School Code"
                icon={School}
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="e.g. ABC123"
                helperText="Provided by your school administration"
                required
              />

              <Input
                label="Registered Mobile Number"
                type="tel"
                icon={Smartphone}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                helperText="Mobile number registered with school records"
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
            /* OTP VERIFY STEP 2 */
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
                Change mobile or school code
              </button>
            </form>
          )}

          {/* Preset Buttons for Demo */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
              Seeded Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => {
                  setRole('PARENT');
                  setParentLoginMode('FAMILY_CODE');
                  setFamilyCode('FAM7824');
                  setError('');
                }}
                className="p-2 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-xs"
              >
                <p className="font-bold text-blue-900 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-blue-600" />
                  Parent (Family Code)
                </p>
                <p className="text-[10px] text-blue-700 font-mono">Code: FAM7824</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('PARENT');
                  setParentLoginMode('MOBILE_OTP');
                  setSchoolCode('ABC123');
                  setMobile('9876543220');
                  setStep(1);
                  setError('');
                }}
                className="p-2 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-xs"
              >
                <p className="font-bold text-blue-900 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-blue-600" />
                  Parent (Mobile OTP)
                </p>
                <p className="text-[10px] text-blue-700 font-mono">ABC123 | 9876543220</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('TEACHER');
                  setSchoolCode('ABC123');
                  setMobile('9876543210');
                  setStep(1);
                  setError('');
                }}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs"
              >
                <p className="font-bold text-gray-800">Anu (Teacher)</p>
                <p className="text-[10px] text-gray-500 font-mono">ABC123 | 9876543210</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('DRIVER');
                  setSchoolCode('ABC123');
                  setMobile('9876543211');
                  setStep(1);
                  setError('');
                }}
                className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs"
              >
                <p className="font-bold text-gray-800">Rajesh (Driver)</p>
                <p className="text-[10px] text-gray-500 font-mono">ABC123 | 9876543211</p>
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
