import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function Toast() {
  const { toast } = useMobileAuth();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error' || toast.type === 'danger';

  return (
    <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none flex justify-center animate-bounce-in">
      <div
        className={`px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 max-w-sm border backdrop-blur text-xs font-semibold ${
          isSuccess
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : isError
            ? 'bg-red-50 text-red-900 border-red-200'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
        {isError && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-4 h-4 text-amber-600 shrink-0" />}
        <span className="flex-1 leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
