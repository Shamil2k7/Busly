'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, CheckCircle2, Download, Eye } from 'lucide-react';
import AdminTopNav from '@/components/navigation/AdminTopNav';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api-client';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    try {
      const res = await api.get('/api/payments');
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopNav title="Payments & Digital Receipts" subtitle="Transport Collection Ledger & Audit Trail" />

      <main className="p-6 space-y-6 max-w-7xl">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student & Class</th>
                  <th className="py-3 px-4">Family Code</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Paid Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{p.student?.name}</p>
                        <p className="text-[11px] text-gray-400">
                          Class {p.student?.class}-{p.student?.division}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-amber-800">
                        {p.family?.familyCode}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 text-base">
                        ₹{p.amount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800">{p.paymentMethod}</span>
                        <p className="text-[10px] text-gray-400 font-mono truncate max-w-xs">
                          {p.paymentReference}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 font-mono">
                        {new Date(p.paidAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(p)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Digital Payment Receipt"
          subtitle={`Receipt: ${selectedReceipt.receiptNumber}`}
        >
          <div className="space-y-4 border border-gray-200 p-5 rounded-2xl bg-white shadow-sm text-xs sm:text-sm">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <p className="font-black text-lg text-gray-900">BUSLY TRANSPORT</p>
                <p className="text-gray-500 text-xs">Official Fee Collection Receipt</p>
              </div>
              <Badge variant="success" size="md">
                SETTLED
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Passenger Student</p>
                <p className="font-bold text-gray-900">{selectedReceipt.student?.name}</p>
                <p className="text-gray-500">ID: {selectedReceipt.student?.studentId}</p>
              </div>
              <div>
                <p className="text-gray-400">Family Code</p>
                <p className="font-mono font-bold text-amber-800">
                  {selectedReceipt.family?.familyCode}
                </p>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Transport Fee Amount:</span>
                <span className="font-bold text-gray-900">₹{selectedReceipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-semibold">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Reference:</span>
                <span className="font-mono">{selectedReceipt.paymentReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time:</span>
                <span>{new Date(selectedReceipt.paidAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-gray-400 italic">
                This is a computer-generated tax receipt from Busly. No signature required.
              </p>
            </div>

            <Button
              variant="dark"
              className="w-full mt-4"
              onClick={() => {
                window.print();
              }}
            >
              <Download className="w-4 h-4 mr-1.5" /> Print / Save Receipt
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
