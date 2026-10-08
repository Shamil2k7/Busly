'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bus,
  ShieldCheck,
  Navigation,
  CreditCard,
  Users,
  BellRing,
  ArrowRight,
  Sparkles,
  Smartphone,
  School,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  const roles = [
    {
      title: 'School Admin Portal',
      desc: 'Complete oversight of fleet, routes, staff, students, fees & emergency command.',
      href: '/login',
      tag: 'Desktop First',
      color: 'bg-slate-900 text-white',
      demo: 'admin@abcschool.test / Password123!',
    },
    {
      title: 'Teacher Portal',
      desc: 'Roster management, Add Student flow with automatic Family Code generation.',
      href: '/otp-login?role=TEACHER',
      tag: 'Mobile First',
      color: 'bg-amber-500 text-slate-900',
      demo: 'School: ABC123 | Mobile: 9876543210',
    },
    {
      title: 'Driver Cockpit',
      desc: 'Live trip execution, GPS location sharing, boarding checklist & instant SOS.',
      href: '/otp-login?role=DRIVER',
      tag: 'One-Touch Interface',
      color: 'bg-emerald-600 text-white',
      demo: 'School: ABC123 | Mobile: 9876543211',
    },
    {
      title: 'Parent App',
      desc: 'Track child’s bus live, monitor pickup/drop ETA, pay transport fees & receipts.',
      href: '/otp-login?role=PARENT',
      tag: 'Family Code Access',
      color: 'bg-blue-600 text-white',
      demo: 'School: ABC123 | Family: FAM7824 | Mobile: 9876543220',
    },
  ];

  return (
    <div className="min-h-screen bg-busly-bg text-busly-dark flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-busly-primary text-busly-dark flex items-center justify-center font-black text-xl shadow-sm">
              <Bus className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">BUSLY</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                Smart School Transport
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/otp-login">
              <Button variant="outline" size="sm">
                OTP Login
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Admin Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-busly-primary" />
            <span>Next-Generation Multi-Tenant School Transport SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Safe, Predictable & Connected <br />
            <span className="text-amber-500">School Transportation</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Busly connects schools, teachers, drivers, and parents in real time with live GPS tracking, student boarding status, instant SOS alerts, and seamless bus fee collections.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="primary" className="shadow-md">
                Launch School Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/otp-login?role=PARENT">
              <Button size="lg" variant="dark">
                Parent Tracking Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Persona Portals Grid */}
        <section className="py-12 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tailored Experiences for Every Role
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Click any persona below to experience the dedicated workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((r) => (
                <div
                  key={r.title}
                  className="bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-gray-700 border border-gray-200 mb-3">
                      {r.tag}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{r.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{r.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/80">
                    <p className="text-[11px] text-gray-500 font-mono bg-white p-2 rounded-lg border border-gray-200 mb-3 truncate">
                      {r.demo}
                    </p>
                    <Link href={r.href}>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>Open Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live GPS Bus Tracking</h3>
              <p className="text-sm text-gray-600">
                Real-time WebSocket telemetry gives parents accurate stop ETAs and provides school administrators an overview of the entire active fleet.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Student Boarding & Safety</h3>
              <p className="text-sm text-gray-600">
                Drivers verify student pickup and drop-off with a single tap. Instant notifications keep parents informed as children board and arrive safely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Integrated Bus Fees</h3>
              <p className="text-sm text-gray-600">
                Automated monthly and quarterly transport pass billing with safe online payments, instant digital receipts, and collection reconciliation.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-4 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">BUSLY — Smart School Transport SaaS</p>
        <p className="mt-1">Production-ready full-stack multi-tenant platform.</p>
      </footer>
    </div>
  );
}
