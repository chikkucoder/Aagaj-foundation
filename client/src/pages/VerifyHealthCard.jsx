import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  X,
  Layers
} from 'lucide-react';
import SEO from '../components/SEO';
import { 
  generateQrCodeDataUrl, 
  imageUrlToBase64, 
  resolveAssetUrl, 
  renderElementToCanvas, 
  saveOrShareCanvas, 
  downloadCombinedCardImage 
} from '../utils/cardDownloadUtils';

const VerifyHealthCard = () => {
  const [healthId, setHealthId] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null); // 'front' | 'back' | 'full' | null
  const [cardData, setCardData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [healthCardPhotoUrl, setHealthCardPhotoUrl] = useState('/logo.jpg');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

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

  // Preload and Base64-encode Images & Local QR Code for 100% reliable Canvas rendering
  useEffect(() => {
    let active = true;

    if (cardData) {
      // 1. Local QR Code
      const qrData = `AAGAJ-HEALTH-ID:${cardData.healthId}\nNAME:${cardData.fullName}\nTYPE:${cardData.cardType || 'Single'}\nSTATUS:VALID\nEXPIRY:${cardData.expiryDate ? new Date(cardData.expiryDate).toLocaleDateString('en-IN') : '6 Months'}`;
      generateQrCodeDataUrl(qrData).then((qrUrl) => {
        if (active) setQrCodeDataUrl(qrUrl);
      });

      // 2. Safe Base64 Photo loader
      if (cardData.photoPath) {
        const fullUrl = resolveAssetUrl(cardData.photoPath);
        imageUrlToBase64(fullUrl, '/logo.jpg').then((base64) => {
          if (active) setHealthCardPhotoUrl(base64);
        });
      } else {
        setHealthCardPhotoUrl('/logo.jpg');
      }
    }

    return () => {
      active = false;
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

  // Robust Card Download Handlers
  const handleDownloadFront = async () => {
    if (!cardFrontRef.current || !cardData || downloadingType) return;
    setDownloadingType('front');
    try {
      const filename = `Health_Card_Front_${(cardData.fullName || 'User').replace(/\s+/g, '_')}_${cardData.healthId}.png`;
      const canvas = await renderElementToCanvas(cardFrontRef.current);
      await saveOrShareCanvas(canvas, filename);
    } catch (err) {
      console.error('Front card download error:', err);
      alert('Could not download image. Please try again or use the Print Card option.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadBack = async () => {
    if (!cardBackRef.current || !cardData || downloadingType) return;
    setDownloadingType('back');
    try {
      const filename = `Health_Card_Back_${(cardData.fullName || 'User').replace(/\s+/g, '_')}_${cardData.healthId}.png`;
      const canvas = await renderElementToCanvas(cardBackRef.current);
      await saveOrShareCanvas(canvas, filename);
    } catch (err) {
      console.error('Back card download error:', err);
      alert('Could not download image. Please try again or use the Print Card option.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadCombined = async () => {
    if (!cardFrontRef.current || !cardBackRef.current || !cardData || downloadingType) return;
    setDownloadingType('full');
    try {
      const filename = `Health_Card_Complete_${(cardData.fullName || 'User').replace(/\s+/g, '_')}_${cardData.healthId}.png`;
      await downloadCombinedCardImage(cardFrontRef.current, cardBackRef.current, filename);
    } catch (err) {
      console.error('Combined card download error:', err);
      alert('Could not download combined image. Please try downloading Front and Back individually.');
    } finally {
      setDownloadingType(null);
    }
  };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-3 sm:px-6 lg:px-8 print:min-h-0 print:py-0 print:bg-white print:p-0">
      <SEO 
        title="Verify Health Card Online - Aagaj Foundation"
        description="Verify your Swasthya Suraksha Card and search for candidate details using your unique Health ID or mobile number. Secure OTP verification required."
        canonicalUrl="https://www.aagajfoundation.com/medical/verify-healthcard"
        keywords="Verify health card Patna, Health ID status search, check NGO card validation"
        ogTitle="Verify Swasthya Suraksha Card - Aagaj Foundation"
        ogDescription="Verify credentials and download card PDF securely."
        ogImage="https://www.aagajfoundation.com/logo.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.aagajfoundation.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Health Card",
              "item": "https://www.aagajfoundation.com/medical/healthcard"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Verify Health Card",
              "item": "https://www.aagajfoundation.com/medical/verify-healthcard"
            }
          ]
        }}
      />
      {/* Back button */}
      <div className="print:hidden max-w-3xl mx-auto mb-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <Link
          to="/medical/healthcard"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-[#2e3192] hover:bg-indigo-100 shadow-sm transition-all"
        >
          Apply New Health Card &rarr;
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xl print:hidden mb-8">
          
          <div className="flex flex-col items-center text-center mb-8 gap-4">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="h-16 w-auto rounded-2xl border border-slate-100 p-1 object-contain shadow-sm" 
            />
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-extrabold px-3.5 py-1 text-xs uppercase tracking-wide">
                <Award className="h-3.5 w-3.5" /> Swasthya Suraksha Network
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mt-1">Health Card Verification</h1>
              <p className="text-slate-500 font-semibold text-xs sm:text-sm">Verify your registered Health ID card number and download/print your digital copy instantly.</p>
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
          <div className="flex flex-col items-center w-full">
            
            {/* Print/Download Button Panel */}
            <div className="print:hidden w-full max-w-xl bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <ShieldCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-850">Health ID Verified Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Select your choice of action from the buttons below to export or save your verified digital Health Card.</p>
              
              <div className="flex flex-col gap-2.5 w-full mt-5">
                {/* Action Row 1: Full Card & Print */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <button
                    onClick={handleDownloadCombined}
                    disabled={!!downloadingType}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {downloadingType === 'full' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Layers className="h-4 w-4" />
                    )}
                    Download Complete Card (PNG)
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-3 px-4 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Printer className="h-4 w-4" /> Print Card (A4 / PVC)
                  </button>
                </div>

                {/* Action Row 2: Front & Back */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={handleDownloadFront}
                    disabled={!!downloadingType}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-3 text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {downloadingType === 'front' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Front Side Only
                  </button>

                  <button
                    onClick={handleDownloadBack}
                    disabled={!!downloadingType}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-3 text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {downloadingType === 'back' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Back Side Only
                  </button>
                </div>
              </div>
            </div>

            {/* Front & Back Card Layout for Printing (Fully Responsive Scaled Wrapper) */}
            <div className="w-full flex flex-col items-center gap-6 py-2 overflow-x-hidden">
              
              {/* CARD FRONT SIDE */}
              <div className="w-full flex justify-center overflow-visible">
                <div className="transform scale-[0.58] min-[360px]:scale-[0.66] min-[420px]:scale-[0.76] min-[500px]:scale-[0.90] sm:scale-100 origin-top transition-transform duration-200 h-[210px] min-[360px]:h-[240px] min-[420px]:h-[275px] min-[500px]:h-[325px] sm:h-auto">
                  <div 
                    ref={cardFrontRef}
                    className="w-[550px] min-h-[350px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans print:shadow-none print:border-2"
                  >
                    {/* Issued under banner strip */}
                    <div className="bg-slate-50 text-[#2e3192] text-center py-1 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                      This Card is Being Issued Under Swasthya Suraksha Yojna
                    </div>

                    {/* Premium Header */}
                    <div className="bg-gradient-to-r from-[#2e3192] to-[#1a1c54] h-[72px] text-white py-2.5 px-6 flex justify-between items-center relative">
                      <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-lg bg-white p-0.5 object-contain" />
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
                          <span className="font-bold text-slate-700 block tracking-wide font-mono">
                            {cardData.aadhar ? cardData.aadhar.replace(/(\d{4})/g, '$1 ').trim() : 'N/A'}
                          </span>
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
                          {cardData.expiryDate ? new Date(cardData.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '6 MONTHS'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div className="w-full flex justify-center overflow-visible">
                <div className="transform scale-[0.58] min-[360px]:scale-[0.66] min-[420px]:scale-[0.76] min-[500px]:scale-[0.90] sm:scale-100 origin-top transition-transform duration-200 h-[210px] min-[360px]:h-[240px] min-[420px]:h-[275px] min-[500px]:h-[325px] sm:h-auto">
                  <div 
                    ref={cardBackRef}
                    className="w-[550px] min-h-[350px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans print:shadow-none print:border-2"
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
                            <div className="overflow-hidden border border-slate-100 rounded-lg">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-500 text-[8px] font-black uppercase">
                                    <th className="p-1">Member Name</th>
                                    <th className="p-1">Relation</th>
                                    <th className="p-1">Age/Gen</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[9px] font-medium text-slate-700">
                                  {cardData.familyMembers?.map((m, idx) => (
                                    <tr key={idx}>
                                      <td className="p-1 font-bold">{m.fullName || m.name}</td>
                                      <td className="p-1 text-slate-500">{m.relationship || m.relation}</td>
                                      <td className="p-1">{m.age} Y / {m.gender}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-left">
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Village / Colony</label>
                              <span className="font-extrabold text-slate-800 block uppercase truncate">{cardData.address?.village}</span>
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

                        {/* Local QR Code Container */}
                        <div className="flex flex-col items-center shrink-0 ml-4 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                          {qrCodeDataUrl ? (
                            <img
                              src={qrCodeDataUrl}
                              alt="Profile QR Code"
                              className="h-20 w-20 object-contain rounded-md"
                            />
                          ) : (
                            <div className="h-20 w-20 bg-slate-200 animate-pulse rounded-md" />
                          )}
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
