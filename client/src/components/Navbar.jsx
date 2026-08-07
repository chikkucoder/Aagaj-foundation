import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, User, Heart, Shield, Search, Scissors, ShieldCheck, Printer, RefreshCw, AlertTriangle, Award, Download, Lock, Smartphone, KeyRound, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas-pro';
import { transliterateToHindi } from '../utils/transliterate';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  // Silayi Verification Modal States
  const [isSilayiModalOpen, setIsSilayiModalOpen] = useState(false);
  const [silayiSearchQuery, setSilayiSearchQuery] = useState('');
  const [silayiVerifyResult, setSilayiVerifyResult] = useState(null);
  const [silayiVerifyError, setSilayiVerifyError] = useState('');
  const [silayiLoading, setSilayiLoading] = useState(false);

  // OTP Verification Modal States for Silayi Registration
  const [showSilayiRegOtpModal, setShowSilayiRegOtpModal] = useState(false);
  const [silayiRegOtpSessionId, setSilayiRegOtpSessionId] = useState('');
  const [silayiRegMaskedMobile, setSilayiRegMaskedMobile] = useState('');
  const [silayiRegOtpInput, setSilayiRegOtpInput] = useState('');
  const [silayiRegOtpLoading, setSilayiRegOtpLoading] = useState(false);
  const [silayiRegOtpError, setSilayiRegOtpError] = useState('');
  const [silayiRegResendTimer, setSilayiRegResendTimer] = useState(60);
  const [silayiRegExpiryTimer, setSilayiRegExpiryTimer] = useState(300);

  const openSilayiModal = () => {
    setIsSilayiModalOpen(true);
    setSilayiSearchQuery('');
    setSilayiVerifyResult(null);
    setSilayiVerifyError('');
    setShowSilayiRegOtpModal(false);
    setSilayiRegOtpInput('');
    setSilayiRegOtpError('');
  };

  const closeSilayiModal = () => {
    setIsSilayiModalOpen(false);
    setShowSilayiRegOtpModal(false);
    setSilayiRegOtpInput('');
    setSilayiRegOtpError('');
  };

  // Timer Effect for 60-second Resend OTP Cooldown (Silayi Registration)
  useEffect(() => {
    let resendInterval = null;
    if (showSilayiRegOtpModal && silayiRegResendTimer > 0) {
      resendInterval = setInterval(() => {
        setSilayiRegResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (resendInterval) clearInterval(resendInterval);
    };
  }, [showSilayiRegOtpModal, silayiRegResendTimer]);

  // Timer Effect for 5-minute OTP Expiration Countdown (Silayi Registration)
  useEffect(() => {
    let expiryInterval = null;
    if (showSilayiRegOtpModal && silayiRegExpiryTimer > 0) {
      expiryInterval = setInterval(() => {
        setSilayiRegExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (expiryInterval) clearInterval(expiryInterval);
    };
  }, [showSilayiRegOtpModal, silayiRegExpiryTimer]);

  // Silayi Certificate Verification Modal States
  const [isSilayiCertModalOpen, setIsSilayiCertModalOpen] = useState(false);
  const [silayiCertSearchQuery, setSilayiCertSearchQuery] = useState('');
  const [silayiCertVerifyResult, setSilayiCertVerifyResult] = useState(null);
  const [silayiCertVerifyError, setSilayiCertVerifyError] = useState('');
  const [silayiCertLoading, setSilayiCertLoading] = useState(false);

  // OTP Verification Modal States for Silayi Certificate
  const [showSilayiCertOtpModal, setShowSilayiCertOtpModal] = useState(false);
  const [silayiCertOtpSessionId, setSilayiCertOtpSessionId] = useState('');
  const [silayiCertMaskedMobile, setSilayiCertMaskedMobile] = useState('');
  const [silayiCertOtpInput, setSilayiCertOtpInput] = useState('');
  const [silayiCertOtpLoading, setSilayiCertOtpLoading] = useState(false);
  const [silayiCertOtpError, setSilayiCertOtpError] = useState('');
  const [silayiCertResendTimer, setSilayiCertResendTimer] = useState(60);
  const [silayiCertExpiryTimer, setSilayiCertExpiryTimer] = useState(300);

  const publicCertRef = useRef(null);

  const openSilayiCertModal = () => {
    setIsSilayiCertModalOpen(true);
    setSilayiCertSearchQuery('');
    setSilayiCertVerifyResult(null);
    setSilayiCertVerifyError('');
    setShowSilayiCertOtpModal(false);
    setSilayiCertOtpInput('');
    setSilayiCertOtpError('');
  };

  const closeSilayiCertModal = () => {
    setIsSilayiCertModalOpen(false);
    setShowSilayiCertOtpModal(false);
    setSilayiCertOtpInput('');
    setSilayiCertOtpError('');
  };

  // Timer Effect for 60-second Resend OTP Cooldown
  useEffect(() => {
    let resendInterval = null;
    if (showSilayiCertOtpModal && silayiCertResendTimer > 0) {
      resendInterval = setInterval(() => {
        setSilayiCertResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (resendInterval) clearInterval(resendInterval);
    };
  }, [showSilayiCertOtpModal, silayiCertResendTimer]);

  // Timer Effect for 5-minute OTP Expiration Countdown
  useEffect(() => {
    let expiryInterval = null;
    if (showSilayiCertOtpModal && silayiCertExpiryTimer > 0) {
      expiryInterval = setInterval(() => {
        setSilayiCertExpiryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (expiryInterval) clearInterval(expiryInterval);
    };
  }, [showSilayiCertOtpModal, silayiCertExpiryTimer]);

  // Helper to format seconds as MM:SS
  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Clean print mode class from body after printing finishes
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-receipt');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleSilayiVerify = async (e) => {
    if (e) e.preventDefault();
    if (!silayiSearchQuery.trim()) {
      setSilayiVerifyError('कृपया आधार, मोबाइल या क्रमांक संख्या प्रविष्ट करें।');
      return;
    }

    setSilayiLoading(true);
    setSilayiVerifyResult(null);
    setSilayiVerifyError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: silayiSearchQuery.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setSilayiRegOtpSessionId(result.sessionId);
        setSilayiRegMaskedMobile(result.maskedMobile);
        setSilayiRegResendTimer(60);
        setSilayiRegExpiryTimer(300);
        setSilayiRegOtpInput('');
        setSilayiRegOtpError('');
        setShowSilayiRegOtpModal(true);
      } else {
        setSilayiVerifyError(result.message || 'पंजीकरण रिकॉर्ड नहीं मिला। कृपया इनपुट की जांच करें।');
      }
    } catch (err) {
      console.error(err);
      setSilayiVerifyError('रिकॉर्ड सत्यापन विफलता।');
    } finally {
      setSilayiLoading(false);
    }
  };

  const handleResendSilayiRegOtp = async () => {
    if (silayiRegResendTimer > 0 || silayiRegOtpLoading) return;
    setSilayiRegOtpError('');
    setSilayiRegOtpLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: silayiSearchQuery.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setSilayiRegOtpSessionId(result.sessionId);
        setSilayiRegResendTimer(60);
        setSilayiRegExpiryTimer(300);
        setSilayiRegOtpInput('');
        setSilayiRegOtpError('पंजीकृत मोबाइल नंबर पर एक नया OTP भेजा गया है।');
      } else {
        setSilayiRegOtpError(result.message || 'OTP पुनः भेजने में विफल।');
      }
    } catch (err) {
      setSilayiRegOtpError('OTP भेजने में त्रुटि।');
    } finally {
      setSilayiRegOtpLoading(false);
    }
  };

  const handleVerifySilayiRegOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmedOtp = silayiRegOtpInput.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setSilayiRegOtpError('कृपया फोन पर प्राप्त पूरा OTP दर्ज करें।');
      return;
    }

    setSilayiRegOtpLoading(true);
    setSilayiRegOtpError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: silayiRegOtpSessionId,
          otp: trimmedOtp
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setSilayiVerifyResult(result.data);
        setShowSilayiRegOtpModal(false);
      } else {
        setSilayiRegOtpError(result.message || 'अमान्य OTP (Invalid OTP)');
      }
    } catch (err) {
      console.error(err);
      setSilayiRegOtpError('OTP सत्यापन विफल');
    } finally {
      setSilayiRegOtpLoading(false);
    }
  };

  const handlePrintSilayi = () => {
    document.body.classList.add('printing-receipt');
    window.print();
  };

  const formatToIndianDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSilayiCertVerify = async (e) => {
    if (e) e.preventDefault();
    if (!silayiCertSearchQuery.trim()) {
      setSilayiCertVerifyError('कृपया प्रमाणपत्र संख्या, आधार या मोबाइल दर्ज करें।');
      return;
    }

    setSilayiCertLoading(true);
    setSilayiCertVerifyResult(null);
    setSilayiCertVerifyError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: silayiCertSearchQuery.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setSilayiCertOtpSessionId(result.sessionId);
        setSilayiCertMaskedMobile(result.maskedMobile);
        setSilayiCertResendTimer(60);
        setSilayiCertExpiryTimer(300);
        setSilayiCertOtpInput('');
        setSilayiCertOtpError('');
        setShowSilayiCertOtpModal(true);
      } else {
        setSilayiCertVerifyError(result.message || 'सत्यापन रिकॉर्ड नहीं मिला। कृपया इनपुट की जांच करें।');
      }
    } catch (err) {
      console.error(err);
      setSilayiCertVerifyError('प्रमाणपत्र सत्यापन विफलता।');
    } finally {
      setSilayiCertLoading(false);
    }
  };

  const handleResendSilayiCertOtp = async () => {
    if (silayiCertResendTimer > 0 || silayiCertOtpLoading) return;
    setSilayiCertOtpError('');
    setSilayiCertOtpLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: silayiCertSearchQuery.trim() })
      });
      const result = await response.json();
      if (result.success) {
        setSilayiCertOtpSessionId(result.sessionId);
        setSilayiCertResendTimer(60);
        setSilayiCertExpiryTimer(300);
        setSilayiCertOtpInput('');
        setSilayiCertOtpError('पंजीकृत मोबाइल नंबर पर एक नया OTP भेजा गया है।');
      } else {
        setSilayiCertOtpError(result.message || 'OTP पुनः भेजने में विफल।');
      }
    } catch (err) {
      setSilayiCertOtpError('OTP भेजने में त्रुटि।');
    } finally {
      setSilayiCertOtpLoading(false);
    }
  };

  const handleVerifySilayiCertOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmedOtp = silayiCertOtpInput.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setSilayiCertOtpError('कृपया फोन पर प्राप्त पूरा OTP दर्ज करें।');
      return;
    }

    setSilayiCertOtpLoading(true);
    setSilayiCertOtpError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/silayi/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: silayiCertOtpSessionId,
          otp: trimmedOtp
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        if (result.data.certificateIssued) {
          setSilayiCertVerifyResult(result.data);
          setShowSilayiCertOtpModal(false);
        } else {
          setSilayiCertOtpError('पंजीकरण रिकॉर्ड मिल गया है, लेकिन प्रमाणपत्र अभी तक जारी नहीं किया गया है।');
        }
      } else {
        setSilayiCertOtpError(result.message || 'अमान्य OTP (Invalid OTP)');
      }
    } catch (err) {
      console.error(err);
      setSilayiCertOtpError('OTP सत्यापन विफल');
    } finally {
      setSilayiCertOtpLoading(false);
    }
  };

  const handleDownloadSilayiCert = () => {
    if (!publicCertRef.current) return;
    html2canvas(publicCertRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Certificate_${silayiCertVerifyResult.certificateNo.replace(/\//g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error("Error generating certificate canvas:", err);
        alert("Failed to save image. Please try again.");
      });
  };

  const handlePrintSilayiCert = () => {
    if (!publicCertRef.current) return;
    
    // Copy all parent stylesheets (both links and style blocks) to preserve Tailwind CSS classes/variables
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(style => style.outerHTML)
      .join('\n');

    const printable = publicCertRef.current.outerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <base href="${window.location.origin}/">
          ${styles}
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: #fff;
            }
            @page {
              size: A4 landscape;
              margin: 0;
            }
            .cert-container {
              width: 842px;
              height: 595px;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="cert-container">${printable}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const renderSilayiCertificate = (data) => {
    return (
      <div 
        ref={publicCertRef}
        className="w-[842px] h-[595px] bg-white p-3 select-none relative font-sans text-slate-800 shrink-0 border-[3px] border-[#ff6600]"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #fdfcf9 0%, #ffffff 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div className="w-full h-full border-[3px] border-[#000080] p-1 relative">
          <div className="w-full h-full border-2 border-[#ff6600] p-4 flex flex-col justify-between relative bg-white/95">
            
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] font-black text-[#ff6600] tracking-wide uppercase">
                  REG NO : 759445
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <img src="/logo.jpg" alt="Aagaj Logo" className="h-10 w-10 object-contain rounded-full" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black text-[#000080] leading-none tracking-wide">AAGAJ</span>
                    <span className="text-[8px] font-bold text-slate-500 leading-none">FOUNDATION</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-[#ff6600] tracking-wide uppercase">
                  NGO DARPAN NO – BR/2020/0260968
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <img 
                    src="/skill_india.png" 
                    alt="Skill India Logo" 
                    className="h-10 object-contain" 
                    crossOrigin="anonymous"
                    onError={(e) => { e.target.src = '/logo.jpg'; }}
                  />
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-[#000080] leading-none">Skill India</span>
                    <span className="text-[7px] font-bold text-[#ff6600] leading-none mt-0.5">कौशल भारत - कुशल भारत</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow py-2 text-center">
              <h1 className="text-4xl font-extrabold text-[#0056b3] tracking-wide font-serif mb-1.5" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                आगाज फाउंडेशन
              </h1>

              <div className="border-[3px] border-[#ffb900] bg-white rounded-xl px-8 py-1.5 shadow-sm mb-2 max-w-md">
                <h2 className="text-xl font-extrabold text-[#800000] tracking-wider uppercase font-serif">
                  महिला सिलाई प्रशिक्षण केंद्र
                </h2>
              </div>

              <div className="relative mb-3 flex flex-col items-center">
                <h3 className="text-2xl font-black text-[#0056b3] tracking-[0.2em] uppercase font-sans">
                  CERTIFICATE
                </h3>
                <div className="w-40 h-[3px] bg-[#0056b3] mt-1 relative">
                  <div className="absolute inset-x-0 -bottom-[3px] h-[1px] bg-[#0056b3]"></div>
                </div>
              </div>

              <div className="flex justify-between items-center w-full px-6 mb-4 text-xs font-bold text-slate-800">
                <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl px-4 py-1.5 text-center shadow-sm">
                  प्रमाण पत्र संख्या : <span className="font-extrabold font-mono text-indigo-900 select-all">{data.certificateNo}</span>
                </div>
                <div className="pr-4">
                  दिनांक : <span className="font-extrabold text-slate-900">{formatToIndianDate(data.certificateDate)}</span>
                </div>
              </div>

              <div className="w-full px-8 text-center text-sm font-semibold text-slate-700 leading-relaxed space-y-2">
                <p className="m-0 text-base">
                  प्रमाणित किया जाता हैं कि सुश्री/श्रीमती &nbsp;
                  <strong className="text-slate-950 text-lg font-black border-b border-dashed border-slate-650 px-2 py-0.5 select-all">
                    {data.nameInHindi || transliterateToHindi(data.name)}
                  </strong>
                  &nbsp;&nbsp; पति/पिता - &nbsp;
                  <strong className="text-slate-900 font-extrabold select-all">
                    {data.guardianNameInHindi || transliterateToHindi(data.guardianName || 'N/A')}
                  </strong>
                </p>
                
                <p className="m-0">
                  इस संस्था द्वारा निर्धारित अवधि दिनांक
                </p>

                <div className="inline-block border border-indigo-200 bg-[#f4f7fc] text-[#000080] font-black rounded-xl px-6 py-1.5 shadow-sm text-sm my-1">
                  {formatToIndianDate(data.trainingStartDate)} &nbsp; से &nbsp; {formatToIndianDate(data.trainingEndDate)} &nbsp; ({data.trainingDuration || '2 माह'}) माह / वर्ष के
                </div>

                <p className="m-0 text-slate-800">
                  महिला सिलाई प्रशिक्षण पाठ्यक्रम में संस्था के नियमानुसार सिलाई प्रशिक्षण प्राप्त किया हैं |
                </p>
                <p className="m-0 text-slate-800">
                  इनके द्वारा पाठ्यक्रम प्रशिक्षण के दौरान &nbsp;
                  <strong className="text-emerald-700 font-black text-base border-b border-dashed border-emerald-500 px-2">
                    {data.trainingGrade || 'उत्कृष्ट'}
                  </strong>
                  &nbsp; प्रशिक्षण किया गया |
                </p>
              </div>
            </div>

            <div className="flex justify-between items-end w-full pt-2 border-t border-slate-100">
              <div className="text-center w-36 text-[10px] leading-tight font-semibold text-slate-500">
                <div className="h-10"></div>
                <div className="border-t border-slate-300 pt-1 uppercase">
                  <p className="font-bold text-slate-700 m-0 text-[9px]">Settler Cum Secretary</p>
                  <span className="text-[8px] text-slate-400">AAGAJ FOUNDATION</span>
                </div>
              </div>

              <div className="text-center w-36 text-[10px] leading-tight font-semibold text-slate-500">
                <div className="h-10"></div>
                <div className="border-t border-slate-300 pt-1 uppercase">
                  <p className="font-bold text-slate-700 m-0 text-[9px]">Settler Cum President</p>
                  <span className="text-[8px] text-slate-400">AAGAJ FOUNDATION</span>
                </div>
              </div>

              <div className="text-center w-28 text-[10px] leading-tight font-semibold text-slate-600 relative">
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 rotate-[-12deg] w-[70px] h-[70px] rounded-full border-2 border-indigo-600/60 flex flex-col items-center justify-center text-center opacity-85 select-none pointer-events-none bg-white/20">
                  <div className="absolute inset-0.5 rounded-full border border-dashed border-indigo-500/60"></div>
                  <span className="text-[5px] text-indigo-750 font-black uppercase leading-none tracking-tight">AAGAJ FOUNDATION</span>
                  <span className="text-[4px] text-indigo-600 leading-none mt-0.5">Reg. No.</span>
                  <span className="text-[5px] text-indigo-700 font-extrabold leading-none">759445/2020</span>
                  <span className="absolute text-[8px] text-indigo-500/35 font-bold italic rotate-[15deg]">Aagaj</span>
                </div>
                <div className="h-10"></div>
                <div className="border-t border-slate-300 pt-1 uppercase text-center">
                  <span className="font-black text-slate-800 text-[10px]">समन्वयक</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pr-2 select-none">
                <div className="flex flex-col items-center p-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=AAGAJ-CERT:${data.certificateNo}%0ANAME:${encodeURIComponent(data.name)}`}
                    alt="Verification QR"
                    className="h-12 w-12 object-contain"
                    crossOrigin="anonymous"
                  />
                  <span className="text-[5px] font-black text-slate-400 mt-0.5">SCAN VERIFY</span>
                </div>

                <div className="w-14 h-14 rounded-full border-[3px] border-yellow-500 bg-[#0056b3] text-white flex flex-col items-center justify-center text-center shadow relative shrink-0">
                  <div className="absolute inset-[0.5px] rounded-full border border-yellow-400 border-dashed"></div>
                  <span className="text-[5px] font-black text-yellow-300 uppercase leading-none tracking-widest">ISO</span>
                  <span className="text-[8px] font-black text-white leading-none my-0.5">9001:2015</span>
                  <span className="text-[4px] font-semibold text-yellow-300 leading-none">CERTIFIED</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleSilayiImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/logo.jpg';
  };

  const renderSilayiVirtualForm = (data) => {
    return (
      <div className="bg-white p-8 border border-slate-300 rounded-2xl max-w-2xl mx-auto shadow-md relative font-sans text-slate-800 text-left print:border-none print:shadow-none print:p-0">
        
        {/* Verification Success Tag for non-printed views */}
        <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-300 print:hidden flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> VERIFIED
        </div>

        {/* Est year & Reg No Row */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2 font-mono">
          <div>Reg. No- <span className="text-slate-900 font-black text-sm">{data.serialNumber}</span></div>
          <div>Est year: 2020</div>
        </div>

        {/* Logo and Foundation Name */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-red-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-red-600 tracking-wider">आगाज फाउंडेशन</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">पता – भूपतिपुर मोड़, सुरभी विहार पटना–20</div>
        </div>

        {/* Form title and fee */}
        <div className="text-center mt-4 mb-6 relative">
          <h2 className="text-xl font-extrabold text-red-600 underline underline-offset-4">प्रशिक्षण पंजीकरण फार्म</h2>
          <div className="text-right text-xs font-black text-red-600 mt-1">प्रशिक्षण शुल्क फॉर्म: RS 799</div>
        </div>

        {/* Form Details Grid with Photo Box */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Side: Fields */}
          <div className="md:col-span-3 space-y-3 font-semibold text-xs leading-loose">
            <div><span className="text-slate-500 font-bold">क्रमांक सं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.serialNumber}</span></div>
            <div><span className="text-slate-500 font-bold">नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.name}</span></div>
            <div><span className="text-slate-500 font-bold">पिता / पति का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.guardianName}</span></div>
            <div><span className="text-slate-500 font-bold">पता:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.address}</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">मो.नं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.mobileNumber}</span></div>
              <div><span className="text-slate-500 font-bold">लिंग:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.gender}</span></div>
            </div>
            <div><span className="text-slate-500 font-bold">Email Id:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.email || 'N/A'}</span></div>
            <div><span className="text-slate-500 font-bold">आधार नं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.aadharNumber}</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">उम्र:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.age}</span></div>
              <div><span className="text-slate-500 font-bold">जाति:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.caste || 'N/A'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">प्रशिक्षण का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingName || 'N/A'}</span></div>
              <div><span className="text-slate-500 font-bold">मौजूदा कौशल:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.existingSkills || 'N/A'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">प्रशिक्षण अवधि:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingDuration || 'N/A'}</span></div>
              <div><span className="text-slate-500 font-bold">प्रशिक्षण का तारीख:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingDate || 'N/A'}</span></div>
            </div>
          </div>

          {/* Right Side: Photo Box */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-28 h-36 border-2 border-slate-400 rounded overflow-hidden flex items-center justify-center bg-slate-50 shadow-inner">
              {data.photoUrl ? (
                <img 
                  src={data.photoUrl.startsWith('http') ? data.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${data.photoUrl}`} 
                  alt="Beneficiary Photo" 
                  className="w-full h-full object-cover" 
                  onError={handleSilayiImageError} 
                />
              ) : (
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">PHOTO</span>
              )}
            </div>
          </div>
        </div>

        {/* Signatures Row */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 mt-12 pt-4">
          <div>ऑफिस का हस्ताक्षर</div>
          <div>पंचायत कोर्डिनेटर हस्ताक्षर</div>
          <div>आवेदक का हस्ताक्षर</div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-dashed border-slate-500 my-8"></div>

        {/* bottom half: OFFICE USE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-800 tracking-wider">OFFICE USE</h3>
            <span className="text-xs font-black text-red-600 underline underline-offset-2">प्राप्ति रसीद</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold text-xs leading-loose">
            <div><span className="text-slate-500 font-bold">क्रमांक सं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.serialNumber}</span></div>
            <div><span className="text-slate-500 font-bold">नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.name}</span></div>
            <div className="md:col-span-2"><span className="text-slate-500 font-bold">पिता / पति का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.guardianName}</span></div>
            <div className="md:col-span-2"><span className="text-slate-500 font-bold">पता:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">भूपतिपुर मोड़, पटना – 20</span></div>
          </div>

          {/* Contact details */}
          <div className="text-[10px] font-bold text-slate-600 mt-2 font-mono">
            ऑफिस मो.नं. 0612465270, 7361936198
          </div>

          {/* bottom Signatures */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 mt-8">
            <div>ऑफिस का हस्ताक्षर</div>
            <div>पंचायत कोर्डिनेटर हस्ताक्षर</div>
            <div>आवेदक का हस्ताक्षर</div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const designation = sessionStorage.getItem('loggedInDesignation') || '';
  const isDistrictCoordinator = designation.toString().toLowerCase() === 'district coordinator';
  const showSwasthya = role === 'admin' || isDistrictCoordinator;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-rose-50 to-pink-50 shadow-md border-b border-rose-200 print:hidden">
      {/* Top accent strip */}
      <div className="h-1 bg-gradient-to-r from-[#ED1C24] via-[#fdd831] to-[#ED1C24]"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.jpeg" 
                alt="Aagaj Foundation Logo" 
                className="h-16 w-auto rounded-lg transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              About
            </NavLink>

            <NavLink 
              to="/about/founder" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Founder
            </NavLink>

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setServicesOpen(true);
                setCareersOpen(false);
                setMedicalOpen(false);
              }}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button 
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setCareersOpen(false);
                  setMedicalOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Services <ChevronDown className="h-4 w-4" />
              </button>
              {servicesOpen && (
                <div className="absolute right-0 top-full pt-2 w-64 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/schemes/silayi" 
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Mahila Silayi Prasikshan Yojana
                    </Link>
                    <Link 
                      to="/schemes/swarojgaar" 
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Mahila Swarojgaar Yojana
                    </Link>
                    <button 
                      onClick={() => {
                        setServicesOpen(false);
                        openSilayiModal();
                      }}
                      className="w-full text-left block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24] cursor-pointer"
                    >
                      Verify Silayi Registration
                    </button>
                    <button 
                      onClick={() => {
                        setServicesOpen(false);
                        openSilayiCertModal();
                      }}
                      className="w-full text-left block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24] cursor-pointer"
                    >
                      Verify Silayi Certificate
                    </button>
                    {user ? (
                      <>
                        {showSwasthya && (
                          <Link 
                            to="/schemes/swasthya-suraksha" 
                            onClick={() => setServicesOpen(false)}
                            className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                          >
                            Swasthya Suraksha Yojana
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link 
                        to="/login" 
                        onClick={() => setServicesOpen(false)}
                        className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                      >
                        Employee Login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink 
              to="/gallery" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Gallery
            </NavLink>

            <NavLink 
              to="/blogs" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Blog
            </NavLink>

            {/* Careers Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setCareersOpen(true);
                setServicesOpen(false);
                setMedicalOpen(false);
              }}
              onMouseLeave={() => setCareersOpen(false)}
            >
              <button 
                onClick={() => {
                  setCareersOpen(!careersOpen);
                  setServicesOpen(false);
                  setMedicalOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Careers <ChevronDown className="h-4 w-4" />
              </button>
              {careersOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/membership/register" 
                      onClick={() => setCareersOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border-l-4 border-rose-600"
                    >
                      ★ Membership Form
                    </Link>
                    <Link 
                      to="/careers/ngo-jobs" 
                      onClick={() => setCareersOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      NGO Jobs
                    </Link>
                    <Link 
                      to="/careers/general-jobs" 
                      onClick={() => setCareersOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      General Jobs
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setMedicalOpen(true);
                setServicesOpen(false);
                setCareersOpen(false);
              }}
              onMouseLeave={() => setMedicalOpen(false)}
            >
              <button 
                onClick={() => {
                  setMedicalOpen(!medicalOpen);
                  setServicesOpen(false);
                  setCareersOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Medical Facility <ChevronDown className="h-4 w-4" />
              </button>
              {medicalOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/medical/healthcard" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Health Card Registration
                    </Link>
                    <Link 
                      to="/medical/verify-healthcard" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Verify Health Card
                    </Link>
                    <Link 
                      to="/medical/appointment" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Appointment
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Donate Us Link */}
            <Link 
              to="/donate"
              className="ml-2 flex items-center gap-1.5 rounded-full bg-[#fdd831] px-5 py-2 text-sm font-extrabold text-slate-800 shadow-md hover:bg-amber-400 hover:shadow-lg transition-all active:scale-95 duration-200"
            >
              <Heart className="h-4 w-4 text-[#ED1C24] fill-[#ED1C24]" /> Donate Us
            </Link>

            {/* Admin / Portal Action Button */}
            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link 
                  to={
                    role === 'admin' 
                      ? '/admin/dashboard' 
                      : role === 'hospital' 
                      ? '/hospital/dashboard' 
                      : '/employee/dashboard'
                  }
                  className="flex items-center gap-1 rounded-full bg-[#ED1C24] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#b0151b] transition-all"
                >
                  <User className="h-4 w-4" /> {user.fullName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-800 rounded-full hover:bg-rose-50 hover:text-[#ED1C24] transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="ml-4 flex items-center gap-1 border-2 border-slate-800 rounded-full px-4 py-1.5 text-sm font-bold text-slate-800 hover:bg-[#ED1C24] hover:text-white hover:border-[#ED1C24] transition-all duration-300"
              >
                <Shield className="h-4 w-4" /> Portal Login
              </Link>
            )}

          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden border-t-2 border-rose-200 bg-white py-4 px-4 shadow-inner space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            About
          </Link>

          <Link 
            to="/about/founder" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Founder Biography
          </Link>

          {/* Mobile Services */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Services</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/schemes/silayi" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Mahila Silayi Prasikshan Yojana
              </Link>
              <Link 
                to="/schemes/swarojgaar" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Mahila Swarojgaar Yojana
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  openSilayiModal();
                }}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Verify Silayi Registration
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  openSilayiCertModal();
                }}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Verify Silayi Certificate
              </button>
              {user ? (
                <>
                  {showSwasthya && (
                    <Link 
                      to="/schemes/swasthya-suraksha" 
                      onClick={() => setIsOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Swasthya Suraksha Yojana
                    </Link>
                  )}
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                >
                  Employee Login
                </Link>
              )}
            </div>
          </div>

          <Link 
            to="/gallery" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Gallery
          </Link>

          <Link 
            to="/blogs" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Blog
          </Link>

          {/* Mobile Careers */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Careers</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/membership/register" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-bold text-rose-700 bg-rose-50 border-l-4 border-rose-600"
              >
                ★ Membership Form
              </Link>
              <Link 
                to="/careers/ngo-jobs" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                NGO Jobs
              </Link>
              <Link 
                to="/careers/general-jobs" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                General Jobs
              </Link>
            </div>
          </div>

          {/* Mobile Medical */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Medical Facility</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/medical/healthcard" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Health Card Registration
              </Link>
              <Link 
                to="/medical/verify-healthcard" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Verify Health Card
              </Link>
              <Link 
                to="/medical/appointment" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Appointment
              </Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Link 
              to="/donate" 
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#fdd831] py-2.5 text-base font-extrabold text-slate-800"
            >
              <Heart className="h-5 w-5 text-[#ED1C24] fill-[#ED1C24]" /> Donate Us
            </Link>

            {user ? (
              <>
                <Link 
                  to={
                    role === 'admin' 
                      ? '/admin/dashboard' 
                      : role === 'hospital' 
                      ? '/hospital/dashboard' 
                      : '/employee/dashboard'
                  }
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ED1C24] py-2.5 text-base font-bold text-white"
                >
                  <User className="h-5 w-5" /> {user.fullName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2.5 text-base font-bold text-slate-700 hover:bg-rose-50"
                >
                  <LogOut className="h-5 w-5" /> Log Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-slate-800 py-2.5 text-base font-bold text-slate-800"
              >
                <Shield className="h-5 w-5" /> Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Silayi Verification Popup Modal */}
      {isSilayiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={closeSilayiModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-4 mb-6">
              <div className="inline-flex items-center justify-center p-2.5 bg-red-50 text-[#ED1C24] rounded-2xl">
                <Scissors className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight Hindi-font">
                सिलाई प्रशिक्षण सत्यापन एवं रसीद
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                Verify Registration Status & Download Receipt Card
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner mb-6">
              <form onSubmit={handleSilayiVerify} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label htmlFor="modal_silayi_query" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    पंजीकरण संख्या, आधार संख्या या मोबाइल संख्या दर्ज करें (Enter Reg No, Aadhar, or Mobile)
                  </label>
                  <div className="relative">
                    <input
                      id="modal_silayi_query"
                      type="text"
                      value={silayiSearchQuery}
                      onChange={(e) => setSilayiSearchQuery(e.target.value)}
                      placeholder="e.g. 2600001, 12-digit Aadhar, 10-digit Mobile"
                      className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] transition-all font-bold text-sm"
                      disabled={silayiLoading}
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-black uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  disabled={silayiLoading}
                >
                  {silayiLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5" />
                      सत्यापन हो रहा है (Verifying...)
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      सत्यापन एवं रसीद खोजें (Verify & Search Receipt)
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {silayiVerifyError && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-3 text-left">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    {silayiVerifyError}
                  </div>
                </div>
              )}
            </div>

            {/* Results Display inside Modal */}
            {silayiVerifyResult && (
              <div className="space-y-6">
                
                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm">सत्यापित (Verified!)</h4>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-semibold">Reg Serial: {silayiVerifyResult.serialNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handlePrintSilayi}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 shadow transition-all active:scale-95 text-xs cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> रसीद प्रिंट करें
                    </button>
                    <button
                      onClick={() => {
                        setSilayiVerifyResult(null);
                        setSilayiSearchQuery('');
                        setSilayiVerifyError('');
                      }}
                      className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-4 py-2.5 transition-all text-xs cursor-pointer"
                    >
                      रीसेट
                    </button>
                  </div>
                </div>

                {/* Inline preview for display inside the modal (hidden during print) */}
                <div className="border border-slate-200 rounded-3xl p-2 bg-slate-50/50 print:hidden">
                  {renderSilayiVirtualForm(silayiVerifyResult)}
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Silayi Certificate Verification Popup Modal */}
      {isSilayiCertModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 relative shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={closeSilayiCertModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-4 mb-6">
              <div className="inline-flex items-center justify-center p-2.5 bg-red-50 text-[#ED1C24] rounded-2xl">
                <Award className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight Hindi-font">
                सिलाई प्रशिक्षण प्रमाणपत्र सत्यापन (Verify Silayi Certificate)
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                Verify Issued Training Certificates & Download/Print
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner mb-6 text-left">
              <form onSubmit={handleSilayiCertVerify} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="modal_silayi_cert_query" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    प्रमाणपत्र संख्या, आधार संख्या या मोबाइल संख्या दर्ज करें (Enter Certificate No, Aadhar, or Mobile)
                  </label>
                  <div className="relative">
                    <input
                      id="modal_silayi_cert_query"
                      type="text"
                      value={silayiCertSearchQuery}
                      onChange={(e) => setSilayiCertSearchQuery(e.target.value)}
                      placeholder="e.g. MUZ/25-26/KUD/001, 12-digit Aadhar, 10-digit Mobile"
                      className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] transition-all font-bold text-sm"
                      disabled={silayiCertLoading}
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#000080] hover:bg-slate-900 text-white font-black uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  disabled={silayiCertLoading}
                >
                  {silayiCertLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5" />
                      सत्यापन हो रहा है (Verifying...)
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      प्रमाणपत्र खोजें (Search & Verify Certificate)
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {silayiCertVerifyError && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    {silayiCertVerifyError}
                  </div>
                </div>
              )}
            </div>

            {/* Results Display inside Modal */}
            {silayiCertVerifyResult && (
              <div className="space-y-6">
                
                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm">प्रमाणपत्र सत्यापित (Certificate Verified!)</h4>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-semibold">Cert No: {silayiCertVerifyResult.certificateNo}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadSilayiCert}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 shadow transition-all active:scale-95 text-xs cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> डाउनलोड करें (Download PNG)
                    </button>
                    <button
                      onClick={handlePrintSilayiCert}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-4 py-2.5 shadow transition-all active:scale-95 text-xs cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> प्रिंट करें (Print Certificate)
                    </button>
                  </div>
                </div>

                {/* Inline preview for display inside the modal (hidden during print) */}
                <div className="w-full flex justify-center items-center overflow-hidden h-[240px] sm:h-[380px] md:h-[480px] lg:h-[610px] bg-slate-50 border border-slate-200 rounded-3xl print:hidden">
                  <div className="origin-center scale-[0.38] sm:scale-[0.58] md:scale-[0.8] lg:scale-100 shrink-0">
                    {renderSilayiCertificate(silayiCertVerifyResult)}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* --- SILAYI CERTIFICATE OTP VERIFICATION MODAL --- */}
      {showSilayiCertOtpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-left relative my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-[#000080]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">सिलाई प्रमाणपत्र OTP सत्यापन</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Security Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowSilayiCertOtpModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVerifySilayiCertOtpSubmit} className="p-6 space-y-5">
              
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Smartphone className="h-8 w-8 mx-auto text-[#000080] mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-600">
                  पंजीकृत मोबाइल नंबर पर भेजा गया सत्यापन कोड दर्ज करें:
                </p>
                <div className="mt-1 text-sm font-extrabold text-slate-900 font-mono tracking-wider">
                  +91 {silayiCertMaskedMobile}
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
                    value={silayiCertOtpInput}
                    onChange={(e) => setSilayiCertOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3 pl-10 pr-4 rounded-2xl border-2 border-indigo-200 text-slate-900 focus:border-[#000080] outline-none transition-all shadow-inner bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Expiry Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Expires in: <strong className="font-mono text-slate-900">{formatTimer(silayiCertExpiryTimer)}</strong>
                </span>
                <span className="text-slate-600">
                  Attempts: 5/5
                </span>
              </div>

              {/* Error Alert inside Modal */}
              {silayiCertOtpError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{silayiCertOtpError}</span>
                </div>
              )}

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={silayiCertOtpLoading || silayiCertOtpInput.trim().length < 4 || silayiCertExpiryTimer <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#000080] hover:bg-slate-900 text-white py-3.5 text-sm font-black shadow-lg shadow-indigo-900/25 tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-200"
              >
                {silayiCertOtpLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    VERIFY OTP &amp; VIEW CERTIFICATE
                  </>
                )}
              </button>

              {/* Resend OTP Action */}
              <div className="text-center pt-1 border-t border-slate-100">
                {silayiCertResendTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    Didn't receive code? Resend available in <strong className="font-mono text-[#000080]">{silayiCertResendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendSilayiCertOtp}
                    disabled={silayiCertOtpLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#000080] hover:text-indigo-900 cursor-pointer underline transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend OTP via SMS
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- SILAYI REGISTRATION OTP VERIFICATION MODAL --- */}
      {showSilayiRegOtpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-left relative my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-[#ED1C24]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">सिलाई पंजीकरण OTP सत्यापन</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Security Verification</p>
                </div>
              </div>
              <button
                onClick={() => setShowSilayiRegOtpModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleVerifySilayiRegOtpSubmit} className="p-6 space-y-5">
              
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Smartphone className="h-8 w-8 mx-auto text-[#ED1C24] mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-600">
                  पंजीकृत मोबाइल नंबर पर भेजा गया सत्यापन कोड दर्ज करें:
                </p>
                <div className="mt-1 text-sm font-extrabold text-slate-900 font-mono tracking-wider">
                  +91 {silayiRegMaskedMobile}
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
                    value={silayiRegOtpInput}
                    onChange={(e) => setSilayiRegOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3 pl-10 pr-4 rounded-2xl border-2 border-red-200 text-slate-900 focus:border-[#ED1C24] outline-none transition-all shadow-inner bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Expiry Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Expires in: <strong className="font-mono text-slate-900">{formatTimer(silayiRegExpiryTimer)}</strong>
                </span>
                <span className="text-slate-600">
                  Attempts: 5/5
                </span>
              </div>

              {/* Error Alert inside Modal */}
              {silayiRegOtpError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{silayiRegOtpError}</span>
                </div>
              )}

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={silayiRegOtpLoading || silayiRegOtpInput.trim().length < 4 || silayiRegExpiryTimer <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] text-white py-3.5 text-sm font-black shadow-lg shadow-red-900/25 tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-200"
              >
                {silayiRegOtpLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    VERIFY OTP &amp; VIEW RECEIPT
                  </>
                )}
              </button>

              {/* Resend OTP Action */}
              <div className="text-center pt-1 border-t border-slate-100">
                {silayiRegResendTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    Didn't receive code? Resend available in <strong className="font-mono text-[#ED1C24]">{silayiRegResendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendSilayiRegOtp}
                    disabled={silayiRegOtpLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ED1C24] hover:text-red-900 cursor-pointer underline transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend OTP via SMS
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

      {/* React Portal for robust page-independent printing (attached directly to body) */}
      {silayiVerifyResult && createPortal(
        <div className="printable-receipt-container hidden print:block">
          {renderSilayiVirtualForm(silayiVerifyResult)}
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
