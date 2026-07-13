import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { createHealthCardOrder, verifyHealthCardPayment, checkHealthCardExists } from '../api/paymentApi';
import { Camera, RefreshCw, Printer, ShieldAlert, Award, HeartHandshake, User, MapPin, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import html2canvas from 'html2canvas-pro';

const HealthCard = () => {
  // Page States
  const [loading, setLoading] = useState(false);
  const [successCard, setSuccessCard] = useState(null); // When card is successfully created/restored
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [successCardPhotoUrl, setSuccessCardPhotoUrl] = useState('/logo.jpg');

  // Webcam Capture States
  const [cameraStream, setCameraStream] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Refs for card download
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);
  
  // Custom uploaded or captured image
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Duplicate Check Flags
  const [mobileExists, setMobileExists] = useState(false);
  const [aadharExists, setAadharExists] = useState(false);

  // Card Type Selector State
  const [cardType, setCardType] = useState('Single');
  const [familyMembers, setFamilyMembers] = useState([
    { relationship: 'Father', fullName: '', age: '', gender: 'Male', aadhar: '' },
    { relationship: 'Mother', fullName: '', age: '', gender: 'Female', aadhar: '' },
    { relationship: 'Child 1', fullName: '', age: '', gender: 'Male', aadhar: '' },
    { relationship: 'Child 2', fullName: '', age: '', gender: 'Male', aadhar: '' }
  ]);

  const handleFamilyMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      gender: 'Male',
      bloodGroup: 'A+',
      state: 'Bihar'
    }
  });

  const watchMobile = watch('mobile');
  const watchAadhar = watch('aadhar');

  // Verify duplicates on blur
  const checkDuplicate = async (field) => {
    const value = field === 'mobile' ? watchMobile : watchAadhar;
    if (!value || value.length < 10) return;

    try {
      const payload = {};
      if (field === 'mobile') payload.mobile = value;
      if (field === 'aadhar') payload.aadhar = value;

      const res = await checkHealthCardExists(payload);
      if (res.exists) {
        if (field === 'mobile') {
          setMobileExists(true);
        } else {
          setAadharExists(true);
        }
      } else {
        if (field === 'mobile') setMobileExists(false);
        if (field === 'aadhar') setAadharExists(false);
      }
    } catch (err) {
      console.error('Failed to verify duplicates', err);
    }
  };

  // Webcam controls
  const openCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      setCameraStream(stream);
      setShowWebcam(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setErrorMsg('Failed to open camera. Please grant camera permission.');
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowWebcam(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `health-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPhotoBlob(file);
          const previewUrl = URL.createObjectURL(file);
          setPhotoPreview(previewUrl);
        }
        closeCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be 2MB or less.');
        return;
      }
      setPhotoBlob(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // On successful submission of card metadata, trigger Razorpay
  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (mobileExists || aadharExists) {
      setErrorMsg('Cannot register. Mobile or Aadhar already exists in our records.');
      return;
    }

    if (!photoBlob) {
      setErrorMsg('Passport size photo is required. Please upload or capture a photo.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      formData.append('mobile', data.mobile);
      if (data.email) {
        formData.append('email', data.email);
      }
      formData.append('aadhar', data.aadhar);
      formData.append('age', data.age);
      formData.append('gender', data.gender);
      formData.append('bloodGroup', data.bloodGroup);
      formData.append('village', data.village);
      formData.append('panchayat', data.panchayat);
      formData.append('block', data.block);
      formData.append('district', data.district);
      formData.append('state', data.state);
      formData.append('pincode', data.pincode);
      formData.append('photo', photoBlob);
      formData.append(
        'registeredBy',
        sessionStorage.getItem('loggedInRole') === 'Admin'
          ? 'Admin/Self'
          : (sessionStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUser') || 'Self')
      );
      formData.append('cardType', cardType);
      if (cardType === 'Family') {
        for (let i = 0; i < familyMembers.length; i++) {
          const m = familyMembers[i];
          if (!m.fullName || !m.age || !m.aadhar) {
            setErrorMsg(`Please fill in all details for family member: ${m.relationship}`);
            setLoading(false);
            return;
          }
          if (m.aadhar.length !== 12) {
            setErrorMsg(`Aadhar number must be 12 digits for family member: ${m.relationship}`);
            setLoading(false);
            return;
          }
        }
        formData.append('familyMembers', JSON.stringify(familyMembers));
      }

      // Create Razorpay Payment Order
      const res = await createHealthCardOrder(formData);
      if (!res.success) {
        setErrorMsg(res.message || 'Payment gateway order creation failed.');
        setLoading(false);
        return;
      }

      // Check if Razorpay SDK loaded
      if (!window.Razorpay) {
        // Dynamically load
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => triggerRazorpay(res, data);
        document.body.appendChild(script);
      } else {
        triggerRazorpay(res, data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Server connection error during payment Order setup.');
      setLoading(false);
    }
  };

  const triggerRazorpay = (orderRes, clientData) => {
    const options = {
      key: orderRes.key,
      amount: orderRes.amount,
      currency: orderRes.currency,
      order_id: orderRes.orderId,
      name: 'Aagaj Foundation',
      description: cardType === 'Family' ? 'Family Health Identity Card Issuance Fee' : 'Health Identity Card Issuance Fee',
      prefill: {
        name: clientData.fullName,
        contact: clientData.mobile
      },
      theme: {
        color: '#2e3192'
      },
      handler: async function (response) {
        setLoading(true);
        try {
          const verifyRes = await verifyHealthCardPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            pendingOrderId: orderRes.pendingOrderId
          });

          if (verifyRes.success) {
            setSuccessMsg('Payment Successful! Dispensing health card...');
            
            // Retrieve generated card data
            const cardRes = await apiClient.get(`/api/healthcard/get-by-order/${orderRes.pendingOrderId}`);
            if (cardRes.data?.success) {
              setSuccessCard(cardRes.data.data);
            } else {
              setErrorMsg('Card saved in DB, but failed to fetch print specs. Access via Admin Panel.');
            }
          } else {
            setErrorMsg('Payment verification failed.');
          }
        } catch (err) {
          setErrorMsg('Error verifying transaction.');
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Resolve Health Card photo to local blob URL to bypass CORS
  useEffect(() => {
    let active = true;
    let localUrl = '';

    if (successCard && successCard.photoPath) {
      const url = resolveAssetUrl(successCard.photoPath);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setSuccessCardPhotoUrl(localUrl);
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
                  setSuccessCardPhotoUrl(localUrl);
                })
                .catch(() => {
                  if (active) setSuccessCardPhotoUrl('/logo.jpg');
                });
            } catch (e) {
              if (active) setSuccessCardPhotoUrl('/logo.jpg');
            }
          } else {
            if (active) setSuccessCardPhotoUrl('/logo.jpg');
          }
        });
    } else {
      setSuccessCardPhotoUrl('/logo.jpg');
    }

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [successCard]);

  const handlePrint = () => {
    window.print();
  };

  const downloadFrontCard = () => {
    if (!cardFrontRef.current) return;
    html2canvas(cardFrontRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Health_Card_Front_${successCard.fullName.replace(/\s+/g, '_')}_${successCard.healthId}.png`;
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
        link.download = `Health_Card_Back_${successCard.fullName.replace(/\s+/g, '_')}_${successCard.healthId}.png`;
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
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) return assetPath;
    if (assetPath.startsWith('/')) return `${baseUrl}${assetPath}`;
    return `${baseUrl}/${assetPath}`;
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
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 sm:px-6 lg:px-8 print:min-h-0 print:py-0 print:bg-transparent">
      {/* Hide on print */}
      <div className="print:hidden max-w-3xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>

      {/* Main card panel wrapper */}
      <div className="max-w-3xl mx-auto">
        
        {/* --- DUAL STATE CONTAINER: FORM VIEW OR ID CARD VIEW --- */}
        {!successCard ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl print:hidden">
            
            <div className="flex flex-col items-center text-center mb-8 gap-4">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="h-16 w-auto rounded-2xl border border-slate-100 p-1 object-contain shadow-sm" 
              />
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold px-3.5 py-1 text-xs uppercase tracking-wide">
                  <Award className="h-3.5 w-3.5" /> Swasthya Suraksha Yojana
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mt-1">AAGAJ FOUNDATION</h2>
                <p className="text-rose-600 font-black tracking-widest text-xs uppercase">Health Identity Enrollment</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-600 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Card Selection Toggle */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 mb-6">
              <h4 className="text-xs font-bold text-[#2e3192] uppercase tracking-wider mb-3 flex items-center gap-1">
                Choose Card Type (कार्ड का प्रकार चुनें)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCardType('Single')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    cardType === 'Single'
                      ? 'border-[#2e3192] bg-indigo-50/50 text-[#2e3192]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-extrabold text-sm uppercase">Single Health Card</span>
                  <span className="text-xs font-black text-[#ed1c24] mt-1">₹201</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('Family')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    cardType === 'Family'
                      ? 'border-[#2e3192] bg-indigo-50/50 text-[#2e3192]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-extrabold text-sm uppercase">Family Health Card</span>
                  <span className="text-xs font-black text-[#ed1c24] mt-1">₹499</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Photo Upload Panel */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                <h4 className="text-xs font-bold text-[#2e3192] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Camera className="h-4 w-4" /> Patient Passport Photo
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-36 w-28 rounded-xl object-cover border-4 border-slate-200 shadow-md bg-white p-0.5" />
                  ) : (
                    <div className="h-36 w-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                      <User className="h-8 w-8" />
                      <span className="text-[10px] font-bold block uppercase tracking-wide mt-1">No Photo</span>
                    </div>
                  )}

                  <div className="flex-grow space-y-3 w-full">
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('photoUpload').click()}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs tracking-wide cursor-pointer transition-all border border-slate-950"
                      >
                        Upload Picture
                      </button>
                      <button
                        type="button"
                        onClick={openCamera}
                        className="rounded-xl bg-[#2e3192] hover:bg-[#1a1c54] text-white font-bold py-2.5 text-xs tracking-wide cursor-pointer transition-all"
                      >
                        Webcam Capture
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Please provide a clear portrait photo. JPEG/PNG up to 2MB supported.</p>
                  </div>
                </div>

                {/* Webcam Panel */}
                {showWebcam && (
                  <div className="mt-4 p-4 border border-slate-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-xs rounded-xl bg-black border border-slate-350 shadow-inner" />
                    <div className="flex gap-2">
                      <button type="button" onClick={capturePhoto} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs tracking-wide cursor-pointer">
                        Take Photo
                      </button>
                      <button type="button" onClick={closeCamera} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 text-xs tracking-wide cursor-pointer">
                        Cancel
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </div>

              {/* Personal Details Form Section */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                <h4 className="text-xs font-bold text-[#2e3192] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Personal Particulars
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Name is required' })}
                      placeholder="Name as per Aadhar"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                    {errors.fullName && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                    <input
                      type="text"
                      maxLength="10"
                      {...register('mobile', { required: 'Mobile is required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })}
                      onBlur={() => checkDuplicate('mobile')}
                      placeholder="E.g. 9876543210"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                    {errors.mobile && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.mobile.message}</p>}
                    {mobileExists && <p className="text-xs text-rose-600 font-bold mt-1">This contact number is already registered in DB</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address (Optional)</label>
                    <input
                      type="email"
                      {...register('email', { 
                        pattern: { 
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
                          message: 'Invalid email address' 
                        } 
                      })}
                      placeholder="E.g. user@gmail.com"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                    {errors.email && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aadhar Number (12 Digits)</label>
                    <input
                      type="text"
                      maxLength="12"
                      {...register('aadhar', { required: 'Aadhar is required', pattern: { value: /^[0-9]{12}$/, message: 'Must be 12 digits' } })}
                      onBlur={() => checkDuplicate('aadhar')}
                      placeholder="0000 0000 0000"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                    {errors.aadhar && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.aadhar.message}</p>}
                    {aadharExists && <p className="text-xs text-rose-600 font-bold mt-1">This Aadhar card is already registered in DB</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <input
                        type="text"
                        maxLength="3"
                        {...register('age', { required: 'Age required' })}
                        placeholder="Age"
                        className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select
                        {...register('gender')}
                        className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-2 text-slate-800 text-sm focus:border-[#2e3192] bg-white outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood</label>
                      <select
                        {...register('bloodGroup')}
                        className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-2 text-slate-800 text-sm focus:border-[#2e3192] bg-white outline-none"
                      >
                        <option value="NOT KNOWN">NOT KNOWN</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Form Section */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                <h4 className="text-xs font-bold text-[#2e3192] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Emergency & Residential Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Village / Locality</label>
                    <input
                      type="text"
                      {...register('village', { required: 'Village is required' })}
                      placeholder="Village/Area"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Panchayat</label>
                    <input
                      type="text"
                      {...register('panchayat', { required: 'Panchayat is required' })}
                      placeholder="Panchayat Name"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</label>
                    <input
                      type="text"
                      {...register('block', { required: 'Block is required' })}
                      placeholder="Block Name"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">District</label>
                    <input
                      type="text"
                      {...register('district', { required: 'District is required' })}
                      placeholder="District"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      {...register('state')}
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pin Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      {...register('pincode', { required: 'Pincode is required' })}
                      placeholder="Pincode"
                      className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2e3192] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Family Members Details Section (Only for Family Card) */}
              {cardType === 'Family' && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-6">
                  <h4 className="text-xs font-bold text-[#2e3192] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <HeartHandshake className="h-4 w-4" /> पारिवारिक सदस्य विवरण (Family Members Details)
                  </h4>

                  <div className="space-y-6">
                    {familyMembers.map((member, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                            {index + 1}. {member.relationship} Details
                          </span>
                          <span className="text-[9px] font-bold bg-[#ed1c24]/10 text-[#ed1c24] px-2 py-0.5 rounded-full uppercase">
                            Required
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <input
                              type="text"
                              required
                              value={member.fullName}
                              onChange={(e) => handleFamilyMemberChange(index, 'fullName', e.target.value)}
                              placeholder={`Enter ${member.relationship}'s Name`}
                              className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-xs focus:border-[#2e3192] outline-none animate-none"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                              <input
                                type="number"
                                required
                                value={member.age}
                                onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                                placeholder="Age"
                                className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-2 text-slate-800 text-xs focus:border-[#2e3192] outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                              <select
                                value={member.gender}
                                onChange={(e) => handleFamilyMemberChange(index, 'gender', e.target.value)}
                                className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-2 text-slate-800 text-xs focus:border-[#2e3192] bg-white outline-none"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Others">Others</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-span-1 sm:col-span-2">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aadhar Number (12 digits)</label>
                            <input
                              type="text"
                              maxLength="12"
                              required
                              value={member.aadhar}
                              onChange={(e) => handleFamilyMemberChange(index, 'aadhar', e.target.value.replace(/\D/g, ''))}
                              placeholder="0000 0000 0000"
                              className="block mt-1 w-full rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-xs focus:border-[#2e3192] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-4 text-base font-black shadow-lg shadow-indigo-500/20 tracking-wider uppercase cursor-pointer disabled:opacity-60 transition-all hover:-translate-y-0.5 duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Triggering Razorpay Gateways...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 animate-pulse" />
                    PAY & GENERATE {cardType === 'Family' ? 'FAMILY' : 'HEALTH'} CARD (₹{cardType === 'Family' ? '499' : '201'})
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* --- DUAL STATE B: SUCCESS IDENTITY CARD PREVIEW --- */
          <div className="flex flex-col items-center">
            
            {/* Header Controls for Print & Download */}
            <div className="print:hidden w-full max-w-[550px] bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-6 flex flex-col items-center text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 mb-3" />
              <h3 className="text-base font-extrabold text-slate-850">Health Identity Card Generated!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">The digital copy has been issued successfully. Use the options below to print or download your cards.</p>
              
              <div className="flex flex-col gap-2.5 w-full mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccessCard(null)}
                    className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all active:scale-95"
                  >
                    Create Another Card
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Printer className="h-4 w-4" /> Print Card
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadFrontCard}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4" /> Download Front (PNG)
                  </button>
                  <button
                    onClick={downloadBackCard}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4" /> Download Back (PNG)
                  </button>
                </div>
              </div>
            </div>

            {/* Front Card & Back Card Layout for Printing */}
            <div className="flex flex-col gap-6 items-center p-4">
              
              {/* CARD FRONT SIDE */}
              <div 
                ref={cardFrontRef}
                className="w-[550px] h-[340px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans"
              >
                
                {/* Issued under banner strip */}
                <div className="bg-slate-50 text-[#2e3192] text-center py-1.5 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                  This Card is Being Issued Under Swasthya Suraksha Yojna
                </div>

                {/* Premium Header */}
                <div className="bg-gradient-to-r from-[#2e3192] to-[#1a1c54] h-[85px] text-white py-4 px-6 flex justify-between items-center relative">
                  <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Logo" className="h-11 w-11 rounded-lg bg-white p-0.5" />
                    <span className="text-xl font-black text-[#ed1c24] tracking-wider uppercase">Aagaj.Foundation</span>
                  </div>
                  <div className="text-right flex flex-col items-end justify-center">
                    <span className="inline-block bg-[#ed1c24] text-white text-[7px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase mb-1 leading-none">
                      {successCard.cardType === 'Family' ? 'Family Card' : 'Single Card'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-300 tracking-wider block leading-none">HEALTH CARD</span>
                    <span className="text-sm font-extrabold text-[#ed1c24] block mt-0.5 leading-none">{successCard.healthId}</span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="flex-grow flex p-6 gap-6 bg-white">
                  {/* Portrait photo */}
                  <div className="w-[110px] h-[140px] rounded-xl border-[3px] border-[#2e3192] bg-slate-50 overflow-hidden shrink-0 shadow-sm p-0.5">
                    <img
                      src={successCardPhotoUrl}
                      alt="Patient"
                      className="w-full h-full object-cover rounded-lg"
                      crossOrigin="anonymous"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Personal stats particulars */}
                  <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-3 items-start self-start text-xs">
                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</label>
                      <span className="font-extrabold text-slate-800 text-sm block uppercase truncate">{successCard.fullName}</span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Age / Gender</label>
                      <span className="font-bold text-slate-700 block">{successCard.age} Yrs / {successCard.gender}</span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Blood Group</label>
                      <span className="font-bold text-slate-700 block">{successCard.bloodGroup}</span>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Aadhar Number</label>
                      <span className="font-bold text-slate-700 block tracking-wide font-mono">{successCard.aadhar?.replace(/(\d{4})/g, '$1 ').trim()}</span>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Contact No.</label>
                      <span className="font-extrabold text-[#2e3192] block">+91 {successCard.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* Card Front Footer */}
                <div className="bg-slate-50 border-t-2 border-[#ed1c24] py-3 px-6 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 block">VALID IDENTITY</span>
                    <span className="text-[8px] text-slate-400 font-medium">Digitally Secured Profile</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 block">EXPIRY DATE</span>
                    <span className="font-extrabold text-slate-800 text-xs block uppercase">
                      {new Date(successCard.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div 
                ref={cardBackRef}
                className="w-[550px] h-[340px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans"
              >
                
                {/* Back Header Banner */}
                <div className="bg-[#ed1c24] text-white text-center py-2.5 text-xs font-black uppercase tracking-wider">
                  Residential &amp; Emergency Details
                </div>

                {/* Back Details Grid */}
                <div className="flex-grow p-6 flex flex-col justify-between bg-white text-xs">
                  
                  <div className="flex items-center justify-between">
                    {/* Multi fields */}
                    {/* Multi fields */}
                    {successCard.cardType === 'Family' ? (
                      <div className="flex-grow flex flex-col justify-between text-[10px] text-left pr-4">
                        {/* Address summary */}
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 mb-2 leading-tight">
                          <strong className="text-slate-500 uppercase text-[8px] block">Address:</strong>
                          <span className="text-slate-800 font-semibold uppercase">
                            {successCard.address?.village}, {successCard.address?.panchayat}, {successCard.address?.block}, {successCard.address?.district}, {successCard.address?.state} - {successCard.address?.pincode}
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
                              {successCard.familyMembers && successCard.familyMembers.map((m, idx) => (
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
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 flex-grow text-xs text-left">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Village</label>
                          <span className="font-bold text-slate-700 block uppercase">{successCard.address?.village}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Panchayat</label>
                          <span className="font-bold text-slate-700 block uppercase">{successCard.address?.panchayat}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Block</label>
                          <span className="font-bold text-slate-700 block uppercase">{successCard.address?.block}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">District</label>
                          <span className="font-bold text-slate-700 block uppercase">{successCard.address?.district}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">State</label>
                          <span className="font-bold text-slate-700 block uppercase">{successCard.address?.state}</span>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Pin Code</label>
                          <span className="font-bold text-slate-700 block">{successCard.address?.pincode}</span>
                        </div>
                      </div>
                    )}

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center shrink-0 ml-4 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=HEALTH-ID:${successCard.healthId}%0ANAME:${encodeURIComponent(successCard.fullName)}`}
                        alt="Profile QR Code"
                        className="h-20 w-20 object-contain rounded-md"
                        crossOrigin="anonymous"
                      />
                      <span className="text-[8px] font-black text-slate-800 tracking-wider uppercase mt-1">Scan Profile</span>
                    </div>
                  </div>

                  {/* Foot Note Emergency Strip */}
                  <div className="border border-dashed border-slate-200 bg-slate-50 p-3 rounded-2xl text-center mt-4">
                    <p className="text-[9px] font-black text-slate-900 tracking-wider uppercase m-0">AAGAJ FOUNDATION - REG: 1882 ACT</p>
                    <p className="text-[8px] text-slate-400 font-medium m-0 mt-0.5">This card is a digital health identity. If found, please return to the foundation.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HealthCard;
