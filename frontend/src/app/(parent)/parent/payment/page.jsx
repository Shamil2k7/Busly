'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Smartphone,
  Lock,
  Building,
} from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api-client';
import { showToast } from '@/components/ui/Toast';

function ParentPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feeId = searchParams.get('feeId');

  const [fee, setFee] = useState(null);
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadFee = async () => {
      try {
        const res = await api.get('/api/fees/students');
        if (res.success && res.data) {
          const match = res.data.find((f) => f.id === feeId) || res.data[0];
          setFee(match);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFee();
  }, [feeId]);

  const handlePayNow = async () => {
    if (!fee) return;
    setProcessing(true);
    try {
      // 1. Initialize intent
      await api.post('/api/payments/checkout-intent', {
        studentFeeId: fee.id,
        paymentMethod: method,
      });

      // 2. Process via safe payment abstraction
      const res = await api.post('/api/payments/process', {
        studentFeeId: fee.id,
        paymentMethod: method,
      });

      if (res.success) {
        showToast('Payment successful! Generating receipt...', 'success');
        router.push(
          `/parent/payment/success?receiptNumber=${res.data.receiptNumber}&amount=${res.data.amount}&student=${encodeURIComponent(
            fee.student?.name || 'Student'
          )}`
        );
      }
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-xs text-gray-500">Loading checkout invoice...</p>
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="flex-1 flex flex-col p-6 items-center justify-center space-y-3">
        <p className="text-sm text-gray-600">No pending fee found to pay.</p>
        <Link href="/parent/bus-fees">
          <Button variant="primary">Return to Bus Fees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Payment Checkout"
        subtitle="Safe School Transport Pass Settlement"
        rightAction={
          <Link href="/parent/bus-fees">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-4">
        {/* Invoice Summary */}
        <Card className="border-amber-200">
          <CardHeader title="Order Summary" subtitle="Transport fee invoice details" />
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Student:</span>
              <span className="font-bold text-gray-900">{fee.student?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pass Plan:</span>
              <span className="font-semibold text-gray-800">{fee.feePlan?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Billing Period:</span>
              <span className="font-semibold text-gray-800">{fee.billingPeriodLabel}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700">Total Payable:</span>
              <span className="text-2xl font-black text-gray-900">₹{fee.totalAmount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Provider / Method Options */}
        <Card>
          <CardHeader
            title="Select Payment Method"
            subtitle="Safe sandbox payment simulation"
          />
          <CardContent className="space-y-2.5">
            {[
              { id: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: Smartphone },
              { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
              { id: 'NET_BANKING', label: 'Net Banking (HDFC, SBI, ICICI)', icon: Building },
              { id: 'MOCK', label: 'Safe Sandbox Mock Provider', icon: Lock },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'border-busly-primary bg-amber-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-busly-primary text-slate-900' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-gray-900">{m.label}</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Security Assurance */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center space-x-2 text-xs text-gray-500">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Encrypted 256-bit payment pipeline. Instant receipt generated upon approval.</span>
        </div>

        {/* Submit */}
        <Button
          variant="primary"
          size="lg"
          className="w-full font-black text-base shadow-lg"
          onClick={handlePayNow}
          loading={processing}
        >
          Pay ₹{fee.totalAmount} Now
        </Button>
      </main>
    </div>
  );
}

export default function ParentPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-xs text-gray-500">Loading checkout...</p></div>}>
      <ParentPaymentContent />
    </Suspense>
  );
}
