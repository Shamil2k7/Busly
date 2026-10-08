'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, Download, ArrowLeft, Eye, CheckCircle2 } from 'lucide-react';
import MobileHeader from '@/components/navigation/MobileHeader';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';

export default function ParentPaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/payments');
        if (res.success) setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader
        title="Payment Receipts"
        subtitle="History of Settled Invoices"
        rightAction={
          <Link href="/parent/home">
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
        }
      />

      <main className="p-4 space-y-3">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No payments recorded yet.
          </div>
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{p.student?.name}</h4>
                  <p className="text-[11px] font-mono text-gray-400">{p.receiptNumber}</p>
                </div>
                <span className="font-black text-base text-emerald-600">₹{p.amount}</span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReceipt(p)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Receipt
                </Button>
              </div>
            </Card>
          ))
        )}
      </main>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Digital Receipt"
          subtitle={selectedReceipt.receiptNumber}
        >
          <div className="space-y-3 text-xs p-2">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Passenger Student:</span>
                <span className="font-bold text-gray-900">{selectedReceipt.student?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Family Code:</span>
                <span className="font-mono font-bold text-amber-800">
                  {selectedReceipt.family?.familyCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{selectedReceipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono">{selectedReceipt.paymentReference}</span>
              </div>
            </div>

            <Button
              variant="dark"
              className="w-full mt-2"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
