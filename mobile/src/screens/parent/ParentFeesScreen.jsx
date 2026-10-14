import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { DEMO_FEES } from '../../data/mockData';

export default function ParentFeesScreen() {
  const { user, showToast } = useMobileAuth();
  const [fees, setFees] = useState(DEMO_FEES);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPending = fees
    .filter((f) => f.status === 'PENDING')
    .reduce((sum, f) => sum + f.totalAmount, 0);

  const totalPaid = fees
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + f.totalAmount, 0);

  const handlePayFee = (fee) => {
    setSelectedFeeForPayment(fee);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const updatedFees = fees.map((f) => {
        if (f.id === selectedFeeForPayment.id) {
          const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          return {
            ...f,
            status: 'PAID',
            paidAt: new Date().toISOString().split('T')[0],
            receiptNumber,
          };
        }
        return f;
      });
      setFees(updatedFees);
      showToast('Payment successful! Digital receipt generated.', 'success');

      // Open receipt immediately
      const paidItem = updatedFees.find((f) => f.id === selectedFeeForPayment.id);
      setSelectedFeeForPayment(null);
      setSelectedReceipt(paidItem);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-gray-900 flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-amber-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Pending Fees</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">₹{totalPending}</p>
          <p className="text-[10px] text-gray-400">Due by Oct 25, 2026</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>Total Settled</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600">₹{totalPaid}</p>
          <p className="text-[10px] text-gray-400">Academic Year 2026</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Fee Invoices & Statements
        </h3>

        {fees.map((fee) => {
          const isPending = fee.status === 'PENDING';

          return (
            <div
              key={fee.id}
              className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block">
                    {fee.studentName} ({fee.studentId})
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">{fee.billingPeriod} Bus Fee</h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isPending
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isPending ? 'PAYMENT DUE' : 'PAID'}
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Base Transport Fee:</span>
                  <span className="font-mono text-gray-900">₹{fee.baseAmount}</span>
                </div>
                {fee.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Early Concession:</span>
                    <span className="font-mono">-₹{fee.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Payable:</span>
                  <span className="font-mono text-amber-600 text-sm">₹{fee.totalAmount}</span>
                </div>
              </div>

              {/* Action Button */}
              {isPending ? (
                <button
                  onClick={() => handlePayFee(fee)}
                  className="w-full py-2.5 rounded-xl bg-busly-primary text-slate-900 font-bold text-xs hover:bg-busly-primary-hover transition flex items-center justify-center gap-1.5 shadow-sm touch-press"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{fee.totalAmount} Now</span>
                </button>
              ) : (
                <button
                  onClick={() => setSelectedReceipt(fee)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200 transition flex items-center justify-center gap-1.5 border border-gray-200"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>View Official Receipt</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Checkout Payment Modal */}
      {selectedFeeForPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl text-gray-900 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-busly-primary text-slate-900 flex items-center justify-center font-bold text-sm">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Busly Secure Checkout</h3>
                  <p className="text-[10px] text-gray-500">{user?.schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeeForPayment(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 text-center">
              <span className="text-[10px] text-amber-800 uppercase tracking-wider block font-bold">
                Total Amount Due
              </span>
              <span className="text-2xl font-black text-amber-900">
                ₹{selectedFeeForPayment.totalAmount}
              </span>
              <span className="text-[10px] text-gray-600 block mt-0.5">
                {selectedFeeForPayment.billingPeriod} • {selectedFeeForPayment.studentName}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-600 uppercase">Payment Method</label>

              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                  paymentMethod === 'UPI'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>📱</span> UPI (Google Pay, PhonePe, Paytm)
                </span>
                {paymentMethod === 'UPI' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </button>

              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>💳</span> Debit / Credit Card
                </span>
                {paymentMethod === 'CARD' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </button>

              <button
                onClick={() => setPaymentMethod('NETBANKING')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                  paymentMethod === 'NETBANKING'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🏦</span> Net Banking (All Indian Banks)
                </span>
                {paymentMethod === 'NETBANKING' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </button>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-busly-primary text-slate-900 font-bold text-sm hover:bg-busly-primary-hover transition shadow-sm flex items-center justify-center gap-2 touch-press"
            >
              {isProcessing ? (
                <span>Securing Transaction...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Pay ₹{selectedFeeForPayment.totalAmount}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Official Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm bg-white text-gray-900 rounded-2xl p-5 shadow-2xl space-y-4 relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">ABC Public School</h3>
                <p className="text-[10px] text-gray-500 font-medium">Digital Bus Fee Receipt</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-bold text-gray-900">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student Name:</span>
                <span className="font-bold text-gray-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student ID:</span>
                <span className="font-mono text-gray-900">{selectedReceipt.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Period:</span>
                <span className="font-bold text-gray-900">{selectedReceipt.billingPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid Date:</span>
                <span className="font-mono text-gray-900">{selectedReceipt.paidAt || '2026-10-14'}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 font-mono">₹{selectedReceipt.totalAmount}</span>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="p-2 border border-dashed border-emerald-500 bg-emerald-50 rounded-xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>OFFICIALLY VERIFIED & SETTLED</span>
            </div>

            <button
              onClick={() => {
                showToast('Receipt saved to device', 'success');
                setSelectedReceipt(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Digital Receipt (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
