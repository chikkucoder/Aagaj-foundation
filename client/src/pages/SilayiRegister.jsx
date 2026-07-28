import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Camera, Printer, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, Scissors, Search, UserCheck, Lock, X, Smartphone, KeyRound, Clock } from 'lucide-react';
import { createSilayiOrder, verifySilayiPayment } from '../api/paymentApi';
import apiClient from '../api/apiClient';

const SilayiRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status');
  const orderIdParam = searchParams.get('orderId');
  const paymentIdParam = searchParams.get('paymentId');

  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'verify'
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Verification Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(300);

  // Image capture states
  const [capturedFile, setCapturedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Form setup
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      guardianName: '',
      address: '',
      mobileNumber: '',
      gender: 'Female',
      email: '',
      aadharNumber: '',
      age: '',
      caste: '',
      trainingName: 'Sewing (सिलाई)',
      existingSkills: 'None',
      trainingDuration: '3 Months (3 महीने)',
      trainingDate: new Date().toISOString().split('T')[0]
    }
  });

  // Load Razorpay SDK on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch restored beneficiary details on payment success
  useEffect(() => {
    if (statusParam === 'success' && orderIdParam) {
      const fetchRecord = async () => {
        setLoading(true);
        try {
          const res = await apiClient.get(`/api/schemes/get-by-order/${orderIdParam}`);
          if (res.data?.success && res.data.data) {
            setSuccessData(res.data.data);
          } else {
            alert('पंजीकरण डेटा लोड करने में असमर्थ। (Unable to load registration data)');
          }
        } catch (error) {
          console.error(error);
          alert('त्रुटि: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [statusParam, orderIdParam]);

  // Camera Functions
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (e) {
        alert('कैमरा एक्सेस करने में असमर्थ। (Unable to access camera)');
        setCameraActive(false);
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `silayi-captured-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedFile(file);
          setPhotoPreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('कृपया 5MB से कम साइज की फोटो अपलोड करें।');
        return;
      }
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form and launch Razorpay checkout
  const handleRegister = async (data) => {
    if (!capturedFile) {
      alert('कृपया पंजीकरण के लिए फोटो संलग्न करें या कैमरे से कैप्चर करें।');
      return;
    }

    const payBtn = document.getElementById('silayiPayBtn');
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Processing Payment Order...';

    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('guardianName', data.guardianName.trim());
      formData.append('address', data.address.trim());
      formData.append('mobileNumber', data.mobileNumber.trim());
      formData.append('gender', data.gender);
      formData.append('email', data.email.trim());
      formData.append('aadharNumber', data.aadharNumber.trim());
      formData.append('age', data.age);
      formData.append('caste', data.caste.trim());
      formData.append('trainingName', data.trainingName);
      formData.append('existingSkills', data.existingSkills);
      formData.append('trainingDuration', data.trainingDuration);
      formData.append('trainingDate', data.trainingDate);
      formData.append('photo', capturedFile);
      formData.append(
        'registeredBy',
        sessionStorage.getItem('loggedInRole') === 'Admin'
          ? 'Admin/Self'
          : (sessionStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUser') || 'Self')
      );

      const orderRes = await createSilayiOrder(formData);

      if (!orderRes.success) {
        alert('भुगतान आर्डर बनाने में त्रुटि: ' + (orderRes.message || 'Unknown error'));
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;
        return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        order_id: orderRes.orderId,
        name: 'Aagaj Foundation',
        description: 'Silayi Yojana Registration Fee',
        prefill: {
          name: data.name,
          contact: data.mobileNumber,
          email: data.email || ''
        },
        theme: {
          color: '#ED1C24'
        },
        handler: async function (rzpResponse) {
          try {
            setLoading(true);
            const verifyRes = await verifySilayiPayment({
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
              pendingOrderId: orderRes.pendingOrderId
            });

            if (verifyRes.success) {
              navigate(`/silayi/register?status=success&orderId=${verifyRes.orderId}&paymentId=${verifyRes.paymentId}`);
            } else {
              navigate('/silayi/register?status=failed');
            }
          } catch (e) {
            console.error(e);
            navigate('/silayi/register?status=failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            payBtn.disabled = false;
            payBtn.innerHTML = originalText;
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('पंजीकरण आर्डर सेटअप विफलता: ' + (error.response?.data?.message || error.message));
      payBtn.disabled = false;
      payBtn.innerHTML = originalText;
    }
  };

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

  const formatTimer = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Verify Registration Lookup Handler (Requests OTP)
  const handleVerifySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert('कृपया आधार, मोबाइल या क्रमांक संख्या प्रविष्ट करें।');
      return;
    }

    setLoading(true);
    setVerifyResult(null);
    setVerifyError('');

    try {
      const res = await apiClient.post('/api/silayi/request-otp', {
        query: searchQuery.trim()
      });
      if (res.data?.success) {
        setOtpSessionId(res.data.sessionId);
        setMaskedMobile(res.data.maskedMobile);
        setResendTimer(60);
        setExpiryTimer(300);
        setOtpInput('');
        setOtpError('');
        setShowOtpModal(true);
      } else {
        setVerifyError(res.data?.message || 'पंजीकरण रिकॉर्ड नहीं मिला। कृपया इनपुट की जांच करें।');
      }
    } catch (err) {
      console.error(err);
      setVerifyError(err.response?.data?.message || 'रिकॉर्ड सत्यापन विफलता। (Verification API error)');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setOtpError('');
    setOtpLoading(true);
    try {
      const response = await apiClient.post('/api/silayi/request-otp', { query: searchQuery.trim() });
      if (response.data?.success) {
        setOtpSessionId(response.data.sessionId);
        setResendTimer(60);
        setExpiryTimer(300);
        setOtpInput('');
        setOtpError('पंजीकृत मोबाइल नंबर पर एक नया OTP भेजा गया है।');
      } else {
        setOtpError(response.data?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Error resending OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const trimmedOtp = otpInput.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setOtpError('कृपया फोन पर प्राप्त पूरा OTP प्रविष्ट करें।');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await apiClient.post('/api/silayi/verify-otp', {
        sessionId: otpSessionId,
        otp: trimmedOtp
      });

      if (response.data?.success && response.data.data) {
        setVerifyResult(response.data.data);
        setShowOtpModal(false);
      } else {
        setOtpError(response.data?.message || 'अमान्य OTP (Invalid OTP)');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP सत्यापन विफल');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/logo.jpg';
  };

  // RENDER SUCCESSFUL TRANSACTION INVOICE OR SEARCH VERIFICATION REPORT
  const renderVirtualForm = (data) => {
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
                  onError={handleImageError} 
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

  // PAYMENT FAILURE / CANCEL STATE
  if (statusParam === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl shadow-md">
          <AlertTriangle className="h-12 w-12 text-[#ED1C24] mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800">भुगतान असफल (Payment Failed)</h2>
          <p className="text-slate-500 text-sm">भुगतान प्रक्रिया पूरी नहीं की जा सकी। कृपया पुनः प्रयास करें।</p>
          <button onClick={() => navigate('/silayi/register')} className="bg-[#ED1C24] hover:bg-[#b0151b] text-white px-6 py-2 rounded-xl font-bold transition-all">
            पुनः प्रयास करें (Try Again)
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS / RECEIPT VIEW
  if (statusParam === 'success') {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-[#ED1C24] animate-spin mx-auto" />
            <p className="text-slate-600 font-bold">डेटा लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
          </div>
        </div>
      );
    }

    if (!successData) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl shadow-md">
            <AlertTriangle className="h-12 w-12 text-[#ED1C24] mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">डेटा नहीं मिला (Data Not Found)</h2>
            <p className="text-slate-500 text-sm">इस आर्डर आईडी के लिए कोई डेटा प्राप्त नहीं हुआ। कृपया दोबारा प्रयास करें।</p>
            <button onClick={() => navigate('/silayi/register')} className="bg-[#ED1C24] text-white px-6 py-2 rounded-xl font-bold">
              वापस जाएँ (Go Back)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:py-0">
        
        {/* Floating print actions */}
        <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/schemes/silayi')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
          >
            <ArrowLeft className="h-5 w-5" /> वापस (Back)
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              <Printer className="h-5 w-5" /> फॉर्म प्रिंट करें (Print Form)
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              मुख्य पृष्ठ (Home)
            </button>
          </div>
        </div>

        {/* PRINT CONTAINER */}
        <div className="max-w-2xl mx-auto print:m-0">
          {renderVirtualForm(successData)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Dynamic Header back controls */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 flex justify-between items-center">
        <button
          onClick={() => navigate('/employee/dashboard')}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#ED1C24] shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </button>

        {/* Toggle tabs */}
        <div className="flex space-x-1 rounded-xl bg-slate-200 p-1 shadow-inner shrink-0">
          <button
            onClick={() => { setActiveTab('register'); setVerifyResult(null); }}
            className={`rounded-lg px-4 py-2 text-xs font-black transition-all ${
              activeTab === 'register' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            पंजीकरण (Register)
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`rounded-lg px-4 py-2 text-xs font-black transition-all ${
              activeTab === 'verify' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            सत्यापन (Verify)
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-4">
        {activeTab === 'register' ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            {/* Form Title banner */}
            <div className="text-center space-y-2 border-b-2 border-red-100 pb-4 mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 text-[#ED1C24] rounded-2xl">
                <Scissors className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 Hindi-font">महिला सिलाई प्रशिक्षण पंजीकरण पोर्टल</h2>
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">Aagaj Foundation Social Welfare Trust</p>
            </div>

            {/* Camera Overlay */}
            {cameraActive && (
              <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full p-4 space-y-4 text-center">
                  <p className="text-slate-800 font-black text-sm">वेबकैम कैप्चर (Webcam Capture)</p>
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black aspect-video object-cover"></video>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="rounded-xl bg-green-600 hover:bg-green-700 font-bold text-white px-5 py-2 text-sm shadow active:scale-95 transition-all"
                    >
                      कैप्चर (Capture)
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white px-5 py-2 text-sm shadow active:scale-95 transition-all"
                    >
                      बंद करें (Close)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-8 text-left">
              {/* SECTION 1: Personal Details */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-red-100 pb-2 flex items-center gap-1">
                  <Sparkles className="h-4.5 w-4.5" /> 1. व्यक्तिगत विवरण (Candidate Information)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo picker & preview */}
                  <div className="md:col-span-2 flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="h-28 w-24 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center relative bg-white shrink-0 shadow-inner">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">फोटो</span>
                      )}
                      <button
                        type="button"
                        onClick={startCamera}
                        className="absolute bottom-1.5 right-1.5 bg-[#ED1C24] hover:bg-[#b0151b] p-1.5 rounded-full text-white shadow active:scale-95 transition-all z-10"
                        title="Capture via webcam"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col text-left space-y-1">
                      <span className="text-xs font-black text-slate-600 uppercase">आवेदक का फोटो (Applicant Photo)</span>
                      <p className="text-[10px] text-slate-400">वेबकैम बटन दबाएं या स्थानीय डिवाइस से... </p>
                      <label className="cursor-pointer inline-block mt-2 text-xs font-black text-[#ED1C24] hover:underline uppercase tracking-wide">
                        फाइल चुनें (Choose File)
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <span className="text-[9px] text-slate-400 font-semibold">अधिकतम 5MB JPEG/PNG</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">नाम (Applicant Name)</label>
                    <input
                      type="text"
                      className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                      placeholder="आवेदक का नाम"
                      {...register('name', { required: 'नाम अनिवार्य है' })}
                    />
                    {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">पिता / पति का नाम (Father/Husband Name)</label>
                    <input
                      type="text"
                      className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.guardianName ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                      placeholder="पिता / पति का नाम"
                      {...register('guardianName', { required: 'पिता / पति का नाम अनिवार्य है' })}
                    />
                    {errors.guardianName && <p className="text-red-500 text-xs font-bold">{errors.guardianName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">मोबाइल नं. (Mobile Number)</label>
                    <input
                      type="text"
                      maxLength={10}
                      className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none font-mono ${errors.mobileNumber ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                      placeholder="10 अंकों का मोबाइल नंबर"
                      {...register('mobileNumber', { 
                        required: 'मोबाइल नंबर अनिवार्य है',
                        pattern: { value: /^\d{10}$/, message: '10 अंकों का नंबर प्रविष्ट करें' }
                      })}
                    />
                    {errors.mobileNumber && <p className="text-red-500 text-xs font-bold">{errors.mobileNumber.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">लिंग (Gender)</label>
                    <select
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] bg-transparent"
                      {...register('gender')}
                    >
                      <option value="Female">Female (महिला)</option>
                      <option value="Male">Male (पुरुष)</option>
                      <option value="Other">Other (अन्य)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">आधार नं. (Aadhar Number)</label>
                    <input
                      type="text"
                      maxLength={12}
                      className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none font-mono ${errors.aadharNumber ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                      placeholder="12 अंकों का आधार नंबर"
                      {...register('aadharNumber', { 
                        required: 'आधार नंबर अनिवार्य है',
                        pattern: { value: /^\d{12}$/, message: '12 अंकों का नंबर प्रविष्ट करें' }
                      })}
                    />
                    {errors.aadharNumber && <p className="text-red-500 text-xs font-bold">{errors.aadharNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">उम्र (Age)</label>
                      <input
                        type="number"
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none font-mono ${errors.age ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="उम्र (10-100)"
                        {...register('age', { 
                          required: 'उम्र अनिवार्य है',
                          min: { value: 10, message: 'कम से कम 10' },
                          max: { value: 100, message: 'अधिकतम 100' }
                        })}
                      />
                      {errors.age && <p className="text-red-500 text-xs font-bold">{errors.age.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">जाति (Caste)</label>
                      <input
                        type="text"
                        className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] uppercase"
                        placeholder="जाति (उदा. General, OBC)"
                        {...register('caste')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email ID (Optional)</label>
                    <input
                      type="email"
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24]"
                      placeholder="आवेदक की ईमेल आईडी"
                      {...register('email')}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">पता (Full Address)</label>
                    <textarea
                      rows={2}
                      className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.address ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                      placeholder="पूरा डाक पता"
                      {...register('address', { required: 'पता अनिवार्य है' })}
                    />
                    {errors.address && <p className="text-red-500 text-xs font-bold">{errors.address.message}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Course / Training Details */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-red-100 pb-2 flex items-center gap-1">
                  <Scissors className="h-4.5 w-4.5" /> 2. प्रशिक्षण विवरण (Course Details)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">प्रशिक्षण का नाम (Training Name)</label>
                    <input
                      type="text"
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24]"
                      {...register('trainingName')}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">मौजूदा कौशल (Existing Skills)</label>
                    <select
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] bg-transparent"
                      {...register('existingSkills')}
                    >
                      <option value="None">None (कुछ नहीं)</option>
                      <option value="Basic Sewing">Basic Sewing (साधारण सिलाई)</option>
                      <option value="Embroidery">Embroidery (कढ़ाई/बुनाई)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">प्रशिक्षण अवधि (Training Duration)</label>
                    <input
                      type="text"
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24]"
                      {...register('trainingDuration')}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">प्रशिक्षण की तारीख (Training Start Date)</label>
                    <input
                      type="date"
                      className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] font-mono bg-transparent"
                      {...register('trainingDate')}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Fees & Payment Gateway */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-left space-y-0.5">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">शुल्क भुगतान (Invoice & Gateway Fee)</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Mahila Silayi Prasikshan Yojana Gateway Fee</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-600">₹799</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                id="silayiPayBtn"
                className="w-full rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white py-5 shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
              >
                भुगतान करें और सहेजें (Pay & Save Record)
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-8">
            {/* Verification Header */}
            <div className="text-center space-y-2 border-b-2 border-red-100 pb-4 mb-4">
              <div className="inline-flex items-center justify-center p-3 bg-red-50 text-[#ED1C24] rounded-2xl">
                <UserCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 Hindi-font">प्रशिक्षण पंजीकरण सत्यापन पोर्टल</h2>
              <p className="text-xs font-black text-[#ED1C24] uppercase tracking-widest">Verify & Print Silayi Yojana Forms</p>
            </div>

            {/* Verification Form Search bar */}
            <form onSubmit={handleVerifySearch} className="flex gap-4">
              <input
                type="text"
                placeholder="क्रमांक सं. (Reg No), आधार, या मोबाइल प्रविष्ट करें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-800 focus:outline-none focus:border-[#ED1C24] shadow-inner font-mono"
              />
              <button
                type="submit"
                className="bg-[#ED1C24] hover:bg-[#b0151b] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all shrink-0 shadow-md shadow-red-600/10"
              >
                <Search className="h-4.5 w-4.5" /> खोजें (Search)
              </button>
            </form>

            {loading && (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-[#ED1C24] animate-spin mx-auto" />
                <p className="text-slate-500 font-bold text-sm">प्रक्रिया जारी है, कृपया प्रतीक्षा करें...</p>
              </div>
            )}

            {verifyError && (
              <div className="p-4 bg-red-50 border border-red-100 text-[#ED1C24] rounded-2xl text-sm font-bold flex items-center gap-2 text-left">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Verification Result Display */}
            {verifyResult && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-bold text-left flex justify-between items-center print:hidden">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>सत्यापन सफल! पंजीकरण रिकॉर्ड मिल गया।</span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all shadow"
                  >
                    <Printer className="h-4 w-4" /> प्रिंट करें (Print Form)
                  </button>
                </div>

                {/* Printable Virtual Form Card */}
                <div className="border border-slate-200 rounded-3xl p-4 bg-slate-50/50 print:bg-white print:p-0 print:border-none">
                  {renderVirtualForm(verifyResult)}
                </div>
              </div>
            )}
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
                <div className="p-2 rounded-xl bg-rose-100 text-[#ED1C24]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">सिलाई योजना OTP सत्यापन</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Security Verification</p>
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
            <form onSubmit={handleVerifyOtpSubmit} className="p-6 space-y-5">
              
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Smartphone className="h-8 w-8 mx-auto text-[#ED1C24] mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-600">
                  पंजीकृत मोबाइल नंबर पर भेजा गया 4-अंकीय OTP प्रविष्ट करें:
                </p>
                <div className="mt-1 text-sm font-extrabold text-slate-900 font-mono tracking-wider">
                  +91 {maskedMobile}
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
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3 pl-10 pr-4 rounded-2xl border-2 border-rose-200 text-slate-900 focus:border-[#ED1C24] outline-none transition-all shadow-inner bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Expiry Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1 text-amber-700">
                  <Clock className="h-3.5 w-3.5" /> Expires in: <strong className="font-mono text-slate-900">{formatTimer(expiryTimer)}</strong>
                </span>
                <span className="text-slate-600">
                  Attempts: 5/5
                </span>
              </div>

              {/* Error Alert inside Modal */}
              {otpError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={otpLoading || otpInput.trim().length < 4 || expiryTimer <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] text-white py-3.5 text-sm font-black shadow-lg shadow-red-500/25 tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-200"
              >
                {otpLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    सत्यापित कर रहे हैं (Verifying)...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    OTP सत्यापित करें और कार्ड देखें
                  </>
                )}
              </button>

              {/* Resend OTP Action */}
              <div className="text-center pt-1 border-t border-slate-100">
                {resendTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    पुनः OTP भेजें उपलब्ध होगा: <strong className="font-mono text-[#ED1C24]">{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ED1C24] hover:text-red-700 cursor-pointer underline transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> SMS द्वारा OTP पुनः भेजें
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

export default SilayiRegister;
