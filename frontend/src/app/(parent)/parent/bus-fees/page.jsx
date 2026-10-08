'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Clock, ArrowRight, Receipt } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api-client';

export default function ParentBusFeesPage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFees = async () => {
      try {
        const res = await api.get('/api/fees/students');
        if (res.success) setFees(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFees();
  }, []);

  const pendingFees = fees.filter((f) => f.status === 'PENDING');
  const paidFees = fees.filter((f) => f.status === 'PAID');

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader title="Bus Transportation Fees" subtitle="School Passes & Invoices" />

      <main className="p-4 space-y-4">
        {/* Pending Invoices */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Pending Due Fees ({pendingFees.length})
          </h3>

          {pendingFees.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-gray-800 text-sm">All Transport Fees Settled</p>
              <p className="text-xs text-gray-400 mt-0.5">
                No outstanding fee invoices for your family.
              </p>
            </Card>
          ) : (
            pendingFees.map((fee) => (
              <Card key={fee.id} className="p-4 border-red-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{fee.student?.name}</h4>
                    <p className="text-xs text-gray-500">
                      Class {fee.student?.class}-{fee.student?.division} • {fee.billingPeriodLabel}
                    </p>
                  </div>
                  <Badge variant="danger" size="sm">
                    DUE
                  </Badge>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500">{fee.feePlan?.name}</span>
                    <p className="font-black text-xl text-gray-900">₹{fee.totalAmount}</p>
                  </div>

                  <Link href={`/parent/payment?feeId=${fee.id}`}>
                    <Button variant="primary" size="md" className="font-bold shadow-sm">
                      Pay Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Paid Invoices Archive */}
        {paidFees.length > 0 && (
          <div className="space-y-3 pt-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Settled Invoices ({paidFees.length})
            </h3>
            {paidFees.map((fee) => (
              <Card key={fee.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                      {fee.student?.name} • {fee.billingPeriodLabel}
                    </h4>
                    <p className="text-[11px] text-gray-500">Amount: ₹{fee.totalAmount}</p>
                  </div>
                  <Badge variant="success" size="sm">
                    PAID
                  </Badge>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="font-mono text-gray-400 text-[11px]">
                    Ref: {fee.payments?.[0]?.receiptNumber || 'RCP'}
                  </span>
                  <Link
                    href={`/parent/payment-history`}
                    className="text-amber-600 font-semibold flex items-center"
                  >
                    View Receipt
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
