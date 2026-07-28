import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import apiClient from '../api/apiClient';
import { 
  Search, 
  RefreshCw, 
  Printer, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowLeft,
  Award,
  Lock,
  Smartphone,
  Mail,
  KeyRound,
  Clock,
  X
} from 'lucide-react';

const VerifyHealthCard = () => {
  const [healthId, setHealthId] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [healthCardPhotoUrl, setHealthCardPhotoUrl] = useState('/logo.jpg');

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(300); // 5 minutes
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [verifiedCardToken, setVerifiedCardToken] = useState('');

  // Refs for download
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);

  // Resolve Health Card photo to local blob URL to bypass CORS
  useEffect(() => {
    let active = true;
    let localUrl = '';

    if (cardData && cardData.photoPath) {
      const url = resolveAssetUrl(cardData.photoPath);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setHealthCardPhotoUrl(localUrl);
        })
        .catch((err) => {
          console.error("CORS fetch failed, trying fallback:", err);
          const prodBase = 'https://aagajfoundation.com';
          if (url.includes('localhost') || url.includes('127.0.0.1')) {
            try {
              const urlObj = new URL(url);
              const fallbackUrl = `${prodBase}${urlObj.pathname}`;
              fetch(fallbackUrl)
                .then((res) => {
                  if (!res.ok) throw new Error('Fallback failed');
                  return res.blob();
                })
                .then((blob) => {
                  if (!active) return;
                  localUrl = URL.createObjectURL(blob);
                  setHealthCardPhotoUrl(localUrl);
                })
                .catch(() => {
                  if (active) setHealthCardPhotoUrl('/logo.jpg');
                });
            } catch (e) {
              if (active) setHealthCardPhotoUrl('/logo.jpg');
            }
          } else {
            if (active) setHealthCardPhotoUrl('/logo.jpg');
          }
        });
    } else {
      setHealthCardPhotoUrl('/logo.jpg');
    }

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [cardData]);

  // Timer Effect for 60-second Resend OTP Cooldown
  useEffect(() => {
    let resendInterval = null;
    if (showOtpModal && resendTimer > 0) {
      resendInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (resendInterval) clearInterval(resendInterval);
    };
  }, [showOtpModal, resendTimer]);

  // Timer Effect for 5-minute OTP Expiration Countdown
  useEffect(() => {
    let expiryInterval = null;
    if (showOtpModal && expiryTimer > 0) {
      expiryInterval = setInterval(() => {
        setExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (expiryInterval) clearInterval(expiryInterval);
    };
  }, [showOtpModal, expiryTimer]);

  // Helper to format seconds as MM:SS
  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Step 1: Initiate Health ID Search & Send OTP to Registered Mobile
  const handleInitiateVerification = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCardData(null);
    setOtpError('');

    const inputId = healthId.trim();
    if (!inputId) {
      setErrorMsg('Please enter a Health Card ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/healthcard/request-otp', { healthId: inputId });
      if (response.data?.success) {
        const mob = response.data.maskedMobile || response.data.maskedEmail || '';
        setOtpSessionId(response.data.sessionId);
        setMaskedMobile(mob);
        setResendTimer(response.data.resendTimer || 60);
        setExpiryTimer(300); // 5 minutes
        setAttemptsLeft(5);
        setOtpInput('');
        setShowOtpModal(true);
        setSuccessMsg(`OTP sent to registered mobile number (${mob})`);
      } else {
        setErrorMsg(response.data?.message || 'Failed to request OTP.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Health ID not found. Please check your card number.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setOtpError('');
    setOtpLoading(true);
    try {
      const response = await apiClient.post('/api/healthcard/request-otp', { healthId: healthId.trim() });
      if (response.data?.success) {
        setOtpSessionId(response.data.sessionId);
        setResendTimer(60);
        setExpiryTimer(300);
        setAttemptsLeft(5);
        setOtpInput('');
        setOtpError('A new OTP has been sent to your registered mobile number.');
      } else {
        setOtpError(response.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Error resending OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify OTP and Fetch Health Card
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');

    const trimmedOtp = otpInput.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setOtpError('Please enter the complete OTP sent to your phone.');
      return;
    }

    if (expiryTimer <= 0) {
      setOtpError('OTP has expired. Please click Resend OTP to get a new code.');
      return;
    }

    setOtpLoading(true);
    try {
      const verifyRes = await apiClient.post('/api/healthcard/verify-otp', {
        healthId: healthId.trim(),
        sessionId: otpSessionId,
        otp: trimmedOtp
      });

      if (verifyRes.data?.success) {
        const token = verifyRes.data.cardToken;
        setVerifiedCardToken(token);
        setShowOtpModal(false);

        // Fetch card with authorization header token
        fetchCardWithToken(healthId.trim(), token);
      } else {
        setOtpError(verifyRes.data?.message || 'Invalid OTP.');
        setAttemptsLeft((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'OTP verification failed.';
      setOtpError(msg);
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Fetch Health Card Data using Token
  const fetchCardWithToken = async (id, token) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await apiClient.get(`/api/healthcard/verify/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setCardData(response.data.data);
        setSuccessMsg('Health ID verified and unlocked successfully!');
      } else {
        setErrorMsg(response.data?.message || 'Failed to load Health Card data.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Access denied or session expired. Please verify OTP again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadFrontCard = () => {
    if (!cardFrontRef.current) return;
    html2canvas(cardFrontRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Health_Card_Front_${cardData.fullName.replace(/\s+/g, '_')}_${cardData.healthId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error("Error generating card front canvas:", err);
        alert("Failed to save image. Please try again.");
      });
  };

  const downloadBackCard = () => {
    if (!cardBackRef.current) return;
    html2canvas(cardBackRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Health_Card_Back_${cardData.fullName.replace(/\s+/g, '_')}_${cardData.healthId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error("Error generating card back canvas:", err);
        alert("Failed to save image. Please try again.");
      });
  };

  const resolveAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const normalizedPath = assetPath.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;
    if (normalizedPath.startsWith('/')) return `${baseUrl}${normalizedPath}`;
    return `${baseUrl}/${normalizedPath}`;
  };

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    const prodBase = 'https://aagajfoundation.com';
    
    if (currentSrc && (currentSrc.includes('localhost') || currentSrc.includes('127.0.0.1'))) {
      try {
        const url = new URL(currentSrc);
        e.target.src = `${prodBase}${url.pathname}`;
        return;
      } catch (err) {}
    }
    
    e.target.onerror = null;
    e.target.src = '/logo.jpg';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:min-h-0 print:py-0 print:bg-transparent">
      {/* Back button */}
      <div className="print:hidden max-w-3xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl print:hidden mb-8">
          
          <div className="flex flex-col items-center text-center mb-8 gap-4">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="h-16 w-auto rounded-2xl border border-slate-100 p-1 object-contain shadow-sm" 
              onError={(e) => { e.target.src = '/logo.jpeg'; }}
            />
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold px-3.5 py-1 text-xs uppercase tracking-wide">
                <Award className="h-3.5 w-3.5" /> Swasthya Suraksha Network
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mt-1">Health Card Verification</h2>
              <p className="text-slate-500 font-semibold text-sm">Verify your registered Health ID card number and download/print your digital copy instantly.</p>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleInitiateVerification} className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={healthId}
                onChange={(e) => setHealthId(e.target.value)}
                placeholder="Enter Health ID (e.g., MC-123456 or 123456)"
                className="w-full rounded-2xl border border-slate-350 py-3.5 pl-11 pr-4 text-slate-800 font-bold outline-none focus:border-[#2e3192] transition-all bg-slate-50/50"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-3.5 text-sm font-black shadow-lg shadow-indigo-500/20 tracking-wider uppercase cursor-pointer disabled:opacity-60 transition-all active:scale-95 duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Requesting Security OTP...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify &amp; Send OTP
                </>
              )}
            </button>
          </form>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mt-6 max-w-md mx-auto rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-6 max-w-md mx-auto rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm font-semibold text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Card View and Download Control buttons (Rendered only on verification success) */}
        {cardData && (
          <div className="flex flex-col items-center">
            
            {/* Print/Download Button Panel */}
            <div className="print:hidden w-full max-w-[550px] bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-6 flex flex-col items-center text-center">
              <h3 className="text-base font-extrabold text-slate-850">Health ID Verified Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">Select your choice of action from the buttons below to export your verified digital Health Card.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mt-4">
                <button
                  onClick={downloadFrontCard}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Download className="h-4 w-4" /> Front Side (PNG)
                </button>
                <button
                  onClick={downloadBackCard}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Download className="h-4 w-4" /> Back Side (PNG)
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Printer className="h-4 w-4" /> Print Card
                </button>
              </div>
            </div>

            {/* Front & Back Card Layout for Printing */}
            <div className="flex flex-col gap-6 items-center p-4">
              
              {/* CARD FRONT SIDE */}
              <div 
                ref={cardFrontRef}
                className="w-[550px] min-h-[350px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans"
              >
                {/* Issued under banner strip */}
                <div className="bg-slate-50 text-[#2e3192] text-center py-1 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                  This Card is Being Issued Under Swasthya Suraksha Yojna
                </div>

                {/* Premium Header */}
                <div className="bg-gradient-to-r from-[#2e3192] to-[#1a1c54] h-[72px] text-white py-2.5 px-6 flex justify-between items-center relative">
                  <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-lg bg-white p-0.5" onError={(e) => { e.target.src = '/logo.jpeg'; }} />
                    <span className="text-xl font-black text-[#ed1c24] tracking-wider uppercase">Aagaj.Foundation</span>
                  </div>
                  <div className="text-right flex flex-col items-end justify-center">
                    <span className="inline-block bg-[#ed1c24] text-white text-[7px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase mb-1 leading-none">
                      {cardData.cardType === 'Family' ? 'Family Card' : 'Single Card'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 tracking-wider block leading-none">HEALTH CARD</span>
                    <span className="text-sm font-extrabold text-[#ed1c24] block mt-0.5 leading-none">{cardData.healthId}</span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="flex-grow flex px-6 py-3.5 gap-5 bg-white items-center">
                  {/* Portrait photo */}
                  <div className="w-[105px] h-[130px] rounded-xl border-[3px] border-[#2e3192] bg-slate-50 overflow-hidden shrink-0 shadow-sm p-0.5">
                    <img
                      src={healthCardPhotoUrl}
                      alt="Patient"
                      className="w-full h-full object-cover rounded-lg"
                      crossOrigin="anonymous"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Personal stats particulars */}
                  <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 items-start self-start text-xs text-left">
                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</label>
                      <span className="font-extrabold text-slate-800 text-sm block uppercase truncate">{cardData.fullName}</span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Age / Gender</label>
                      <span className="font-bold text-slate-700 block">{cardData.age} Yrs / {cardData.gender}</span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Blood Group</label>
                      <span className="font-bold text-slate-700 block">{cardData.bloodGroup}</span>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Aadhar Number</label>
                      <span className="font-bold text-slate-700 block tracking-wide font-mono">{cardData.aadhar?.replace(/(\d{4})/g, '$1 ').trim()}</span>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Contact No.</label>
                      <span className="font-extrabold text-[#2e3192] block">+91 {cardData.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* Card Front Footer */}
                <div className="bg-slate-50 border-t-2 border-[#ed1c24] py-2.5 px-6 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 block">VALID IDENTITY</span>
                    <span className="text-[8px] text-slate-400 font-medium">Digitally Secured Profile</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 block">EXPIRY DATE</span>
                    <span className="font-extrabold text-slate-800 text-xs block uppercase">
                      {new Date(cardData.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div 
                ref={cardBackRef}
                className="w-[550px] min-h-[350px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans"
              >
                {/* Back Header Banner */}
                <div className="bg-[#ed1c24] text-white text-center py-2 text-xs font-black uppercase tracking-wider">
                  Residential &amp; Emergency Details
                </div>

                {/* Back Details Grid */}
                <div className="flex-grow px-6 py-4 flex flex-col justify-between bg-white text-xs">
                  
                  <div className="flex items-center justify-between">
                    {/* Multi fields */}
                    {cardData.cardType === 'Family' ? (
                      <div className="flex-grow flex flex-col justify-between text-[10px] text-left pr-4">
                        {/* Address summary */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 mb-2 leading-tight">
                          <strong className="text-slate-500 uppercase text-[8px] block">Address:</strong>
                          <span className="text-slate-800 font-semibold uppercase">
                            {cardData.address?.village}, {cardData.address?.panchayat}, {cardData.address?.block}, {cardData.address?.district}, {cardData.address?.state} - {cardData.address?.pincode}
                          </span>
                        </div>

                        {/* Family table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden flex-grow bg-slate-50/50">
                          <table className="w-full text-left border-collapse text-[9px]">
                            <thead>
                              <tr className="bg-indigo-50/70 text-[#2e3192] font-black uppercase text-[8px] border-b border-slate-200">
                                <th className="py-1 px-2">Relation</th>
                                <th className="py-1 px-2">Name</th>
                                <th className="py-1 px-2 text-center">Age/Sex</th>
                                <th className="py-1 px-2">Aadhar</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cardData.familyMembers && cardData.familyMembers.map((m, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                                  <td className="py-1 px-2 font-black text-slate-500 uppercase text-[8px]">{m.relationship}</td>
                                  <td className="py-1 px-2 font-extrabold text-slate-800 uppercase truncate max-w-[120px]">{m.fullName}</td>
                                  <td className="py-1 px-2 font-bold text-slate-700 text-center">{m.age} / {m.gender?.[0]}</td>
                                  <td className="py-1 px-2 font-bold text-slate-700 font-mono">{m.aadhar?.replace(/(\d{4})/g, '$1 ').trim()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-grow text-xs text-left">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Village</label>
                          <span className="font-bold text-slate-700 block uppercase">{cardData.address?.village}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Panchayat</label>
                          <span className="font-bold text-slate-700 block uppercase">{cardData.address?.panchayat}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Block</label>
                          <span className="font-bold text-slate-700 block uppercase">{cardData.address?.block}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">District</label>
                          <span className="font-bold text-slate-700 block uppercase">{cardData.address?.district}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">State</label>
                          <span className="font-bold text-slate-700 block uppercase">{cardData.address?.state}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pin Code</label>
                          <span className="font-bold text-slate-700 block">{cardData.address?.pincode}</span>
                        </div>
                      </div>
                    )}

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center shrink-0 ml-4 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=HEALTH-ID:${cardData.healthId}%0ANAME:${encodeURIComponent(cardData.fullName)}`}
                        alt="Profile QR Code"
                        className="h-20 w-20 object-contain rounded-md"
                        crossOrigin="anonymous"
                      />
                      <span className="text-[8px] font-black text-slate-800 tracking-wider uppercase mt-1">Scan Profile</span>
                    </div>
                  </div>

                  {/* Foot Note Emergency Strip */}
                  <div className="border border-dashed border-slate-200 bg-slate-50 p-2.5 rounded-2xl text-center mt-2">
                    <p className="text-[9px] font-black text-slate-900 tracking-wider uppercase m-0">AAGAJ FOUNDATION - REG: 1882 ACT</p>
                    <p className="text-[8px] text-slate-400 font-medium m-0 mt-0.5">This card is a digital health identity. If found, please return to the foundation.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* --- OTP VERIFICATION MODAL OVERLAY --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-left relative my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Security OTP Verification</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Health ID: <span className="font-mono text-slate-900 font-bold">{healthId}</span></p>
                </div>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVerifyOtp} className="p-6 space-y-5">
              
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Smartphone className="h-8 w-8 mx-auto text-rose-600 mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-600">
                  Enter the verification code sent to your registered mobile number:
                </p>
                <div className="mt-1 text-sm font-extrabold text-slate-900 font-mono tracking-wider">
                  {maskedMobile ? `+91 ${maskedMobile}` : maskedEmail}
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider text-center mb-1.5">
                  Enter OTP Code
                </label>
                <div className="relative max-w-xs mx-auto">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3 pl-10 pr-4 rounded-2xl border-2 border-rose-200 text-slate-900 focus:border-rose-600 outline-none transition-all shadow-inner bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Expiry & Attempts Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Expires in: <strong className="font-mono text-slate-900">{formatTimer(expiryTimer)}</strong>
                </span>
                <span className={attemptsLeft <= 2 ? 'text-rose-600 font-extrabold' : 'text-slate-600'}>
                  Attempts: {attemptsLeft}/5
                </span>
              </div>

              {/* Error Alert inside Modal */}
              {otpError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={otpLoading || otpInput.trim().length < 4 || expiryTimer <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white py-3.5 text-sm font-black shadow-lg shadow-rose-500/25 tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-200"
              >
                {otpLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    VERIFY OTP &amp; ACCESS CARD
                  </>
                )}
              </button>

              {/* Resend OTP Action */}
              <div className="text-center pt-1 border-t border-slate-100">
                {resendTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    Didn't receive code? Resend available in <strong className="font-mono text-rose-600">{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-600 hover:text-rose-700 cursor-pointer underline transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend OTP via SMS
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyHealthCard;
