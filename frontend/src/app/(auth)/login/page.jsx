'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bus, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    setError('');
    setLoading(true);
    const res = await loginAdmin(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed');
    }
    setLoading(false);
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
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
          Administrator Sign In
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Sign in to manage your school’s transportation network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.test"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Sign In to Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@abcschool.test', 'Password123!')}
                className="p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs"
              >
                <p className="font-bold text-gray-800 truncate">School Admin</p>
                <p className="text-[10px] text-gray-500">ABC Public School</p>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('superadmin@busly.test', 'Password123!')}
                className="p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs"
              >
                <p className="font-bold text-gray-800 truncate">Super Admin</p>
                <p className="text-[10px] text-gray-500">Platform SaaS</p>
              </button>
            </div>
          </div>

          {/* Switch to OTP */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Teacher, Driver, or Parent?{' '}
            <Link href="/otp-login" className="font-semibold text-amber-600 hover:text-amber-700 underline">
              Use OTP Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
