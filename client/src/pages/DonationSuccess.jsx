import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Printer, Home } from 'lucide-react';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('paymentId') || 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-100 space-y-6 text-center" id="receipt-print-area">
        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-10 w-10 stroke-[3]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Thank You!</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Your generous donation was successfully received. A receipt has been generated below.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 text-xs font-semibold text-slate-600 space-y-2.5">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Payment Status:</span>
            <span className="text-green-600 font-extrabold uppercase">Success</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Payment ID:</span>
            <span className="text-slate-800 font-bold font-mono">{paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-slate-800 font-bold">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-2.5 shadow text-sm transition-all"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-6 py-2.5 shadow text-sm transition-all"
          >
            <Home className="h-4 w-4" /> Back Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default DonationSuccess;
