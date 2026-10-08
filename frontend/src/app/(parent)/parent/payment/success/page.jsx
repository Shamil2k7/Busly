'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Download, ArrowRight } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Button from '@/components/ui/Button';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const receiptNumber = searchParams.get('receiptNumber') || 'RCP-2026-0001';
  const amount = searchParams.get('amount') || '1500';
  const student = searchParams.get('student') || 'Student';

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Payment Success" subtitle="Official Tax Receipt" />

      <main className="p-4 space-y-4 text-center my-auto">
        <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-xl font-extrabold text-gray-900">Payment Successful!</h2>
          <p className="text-xs text-gray-500">
            Transport fee for <span className="font-bold text-gray-800">{student}</span> has been received and credited.
          </p>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 my-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt Number:</span>
              <span className="font-mono font-bold text-gray-900">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Settled:</span>
              <span className="font-bold text-emerald-600 text-sm">₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status:</span>
              <span className="font-semibold text-green-700">COMPLETED</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              variant="dark"
              className="w-full"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-1.5" /> Print / Save PDF Receipt
            </Button>

            <Link href="/parent/home">
              <Button variant="outline" className="w-full">
                Back to Home <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-xs text-gray-500">Loading receipt...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
