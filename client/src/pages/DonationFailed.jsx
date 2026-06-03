import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RefreshCw, Home } from 'lucide-react';

const DonationFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-100 space-y-6 text-center">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <X className="h-10 w-10 stroke-[3]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Donation Failed</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Your transaction was declined or cancelled. If your bank account was debited, the amount will be refunded in 3-5 working days.
          </p>
        </div>

        <div className="flex flex-col gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/donate')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold py-3 shadow transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Retry Donation
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-3 shadow transition-all"
          >
            <Home className="h-4 w-4" /> Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default DonationFailed;
