import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Camera, Printer, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { createSwarojgaarOrder, verifySwarojgaarPayment } from '../api/paymentApi';
import { getSwarojgaarSchemeByOrder } from '../api/courseApi';

const SwarojgaarRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const statusParam = searchParams.get('status');
  const orderIdParam = searchParams.get('orderId');
  const paymentIdParam = searchParams.get('paymentId');

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [memberPhotos, setMemberPhotos] = useState({}); // Stores index -> File
  const [memberPhotoPreviews, setMemberPhotoPreviews] = useState({}); // Stores index -> base64/URL

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraIndex, setCameraIndex] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Form setup
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      village: '',
      panchayat: '',
      anumandal: '',
      district: '',
      groupName: '',
      registrationFee: 5000,
      members: Array(10).fill({ name: '', address: '', aadhar: '', pan: '', mobile: '' })
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'members'
  });

  const watchMembers = watch('members');

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

  // Fetch restored group details on payment success
  useEffect(() => {
    if (statusParam === 'success' && orderIdParam) {
      const fetchGroup = async () => {
        setLoading(true);
        try {
          const res = await getSwarojgaarSchemeByOrder(orderIdParam);
          if (res.success && res.data) {
            setSuccessData(res.data);
          } else {
            alert('डेटा प्राप्त करने में त्रुटि। (Error fetching group data)');
          }
        } catch (error) {
          console.error(error);
          alert('त्रुटि: ' + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchGroup();
    }
  }, [statusParam, orderIdParam]);

  // Camera Functions
  const startCamera = async (index) => {
    setCameraIndex(index);
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
    if (videoRef.current && cameraIndex !== null) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `member-captured-${cameraIndex}.jpg`, { type: 'image/jpeg' });
          setMemberPhotos(prev => ({ ...prev, [cameraIndex]: file }));
          setMemberPhotoPreviews(prev => ({ ...prev, [cameraIndex]: URL.createObjectURL(file) }));
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraIndex(null);
  };

  const handlePhotoUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('कृपया 2MB से कम साइज की फोटो अपलोड करें।');
        return;
      }
      setMemberPhotos(prev => ({ ...prev, [index]: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setMemberPhotoPreviews(prev => ({ ...prev, [index]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit and Pay
  const handlePayment = async (data) => {
    // 1. Check if at least one member has details
    const activeMembers = data.members.map((m, idx) => ({ ...m, index: idx })).filter(m => m.name.trim() !== '');
    if (activeMembers.length === 0) {
      alert('कृपया कम से कम एक सदस्य का विवरण भरें। (Please fill at least one member details)');
      return;
    }

    // 2. Validate member details
    for (let i = 0; i < activeMembers.length; i++) {
      const m = activeMembers[i];
      if (!m.aadhar || !/^\d{12}$/.test(m.aadhar)) {
        alert(`सदस्य ${m.index + 1} (${m.name}) का आधार नंबर 12 अंकों का होना चाहिए।`);
        return;
      }
      if (m.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(m.pan.toUpperCase())) {
        alert(`सदस्य ${m.index + 1} (${m.name}) का पैन कार्ड अमान्य है।`);
        return;
      }
      if (!m.mobile || !/^\d{10}$/.test(m.mobile)) {
        alert(`सदस्य ${m.index + 1} (${m.name}) का मोबाइल नंबर 10 अंकों का होना चाहिए।`);
        return;
      }
    }

    const payBtn = document.getElementById('swarojgaarPayBtn');
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Processing Order...';

    try {
      const formData = new FormData();
      formData.append('village', data.village);
      formData.append('panchayat', data.panchayat);
      formData.append('anumandal', data.anumandal);
      formData.append('district', data.district);
      formData.append('groupName', data.groupName);
      formData.append('registrationFee', data.registrationFee);
      formData.append(
        'registeredBy',
        sessionStorage.getItem('loggedInRole') === 'Admin'
          ? 'Admin/Self'
          : (sessionStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUser') || 'Self')
      );

      // Map members array
      const membersArray = activeMembers.map(m => ({
        index: m.index,
        name: m.name.trim(),
        address: m.address.trim(),
        details: `${m.aadhar} | ${m.pan || ''} | ${m.mobile}`
      }));
      formData.append('members', JSON.stringify(membersArray));

      // Append files
      Object.keys(memberPhotos).forEach(index => {
        formData.append(`member_photo_${index}`, memberPhotos[index]);
      });

      const orderRes = await createSwarojgaarOrder(formData);

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
        description: 'Swarojgaar Group Registration',
        prefill: {
          name: data.groupName,
          contact: activeMembers[0]?.mobile || ''
        },
        theme: {
          color: '#ED1C24'
        },
        handler: async function (rzpResponse) {
          try {
            const verifyRes = await verifySwarojgaarPayment({
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
              pendingOrderId: orderRes.pendingOrderId
            });

            if (verifyRes.success) {
              navigate(`/swarojgaar/register?status=success&orderId=${verifyRes.orderId}&paymentId=${verifyRes.paymentId}`);
            } else {
              navigate('/swarojgaar/register?status=failed');
            }
          } catch (e) {
            console.error(e);
            navigate('/swarojgaar/register?status=failed');
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
    } catch (err) {
      console.error(err);
      alert('सर्वर त्रुटि: ' + err.message);
      payBtn.disabled = false;
      payBtn.innerHTML = originalText;
    }
  };

  // SUCCESS / RECEIPT VIEW
  if (statusParam === 'success') {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-[#ED1C24] animate-spin mx-auto" />
            <p className="text-slate-600 font-bold">लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
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
            <button onClick={() => navigate('/swarojgaar/register')} className="bg-[#ED1C24] text-white px-6 py-2 rounded-xl font-bold">
              वापस जाएँ (Go Back)
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:py-0">
        
        {/* Floating print actions */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => navigate('/schemes/swarojgaar')}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
          >
            <ArrowLeft className="h-5 w-5" /> वापस (Back)
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              <Printer className="h-5 w-5" /> अनुबंध प्रिंट करें (Print Contract)
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              मुख्य पृष्ठ (Back to Home)
            </button>
          </div>
        </div>

        {/* PRINT CONTAINER */}
        <div className="max-w-[850px] mx-auto space-y-10 print:space-y-0">
          
          {/* PAGE 1: GUIDELINES PART 1 */}
          <section className="bg-white p-12 md:p-16 rounded-3xl shadow-xl min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none print:min-h-screen print:page-break-after-always">
            <div className="space-y-10">
              <div className="text-center space-y-2 border-b-4 border-[#ED1C24] pb-4">
                <h1 className="text-3xl font-black text-[#ED1C24] uppercase tracking-wide font-sans">AAGAJ FOUNDATION</h1>
                <p className="text-slate-600 font-bold text-xs uppercase">Registered Under Indian Trust Act 1882</p>
                <div className="h-1.5 w-24 bg-[#fdd831] mx-auto rounded-full mt-2"></div>
              </div>

              <div className="text-center font-bold text-xl leading-relaxed text-slate-800 underline underline-offset-8 mt-16 font-sans">
                यह अनुबंध आगाज फाउंडेशन और महिला समूह के बीच महिला स्वरोजगार हेतु किया जा रहा है।
              </div>

              <ul className="list-disc pl-6 space-y-5 text-slate-800 text-justify text-base leading-relaxed font-semibold">
                <li>यह महिलाओं द्वारा एकत्रित होकर किया जाने वाला कार्य है। जिसे हम स्वयं सहायता समूह स्वरोजगार कहते है। इस ग्रुप पर आगाज फाउंडेशन द्वारा निर्धारित स्वयं सहायता समूह के सभी नियम लागू होंगे।</li>
                <li>प्रत्येक समूह में 10 महिला होगी।</li>
                <li>प्रत्येक समूह के एक अध्यक्ष, एक सचिव और एक कोषाध्यक्ष होंगे।</li>
                <li>महिला अपनी निजी रकम निजी जरूरत में न लगाकर कपड़े के व्यापार में लगाएगी, कपड़े के काम से जुड़ी सभी चीजों की जानकारी व मार्गदर्शन आगाज फाउंडेशन करेगी।</li>
                <li>आगाज फाउंडेशन महिलाओं को समूह कार्य का प्रोत्साहन दे रही है जिसमें कपड़े की सिलाई, कढ़ाई, बुनाई, धुलाई, प्रेस, सजना संवारना प्रिंटिंग बेचना व बिकवाना आदि सम्मिलित हैं।</li>
                <li>समूह सदस्य स्वरोजगार स्थापना हेतु 50,000 / पचास हजार रुपए का इंतजाम स्वयं करेंगे।</li>
                <li>महिलाओं के समूह को पूंजी उपलब्ध कराने में आगाज फाउंडेशन के सहयोग से बैंक या वित्तीय संस्थान से लोन प्राप्त कर सकेंगे।</li>
                <li>महिलाओं द्वारा प्राप्त रकम महिला के स्वरोजगार हेतु कच्चे माल खरीदने, जरूरत का सामान लाने व मार्केटिंग आदि में इस्तेमाल की जाएगी।</li>
                <li>महिला अपनी क्षमता व दक्षता के अनुसार तथा समूह की सहमति से महिला अपने कार्य काल को व्यावहारिक कर सकती हैं।</li>
                <li>महिला समूह में जो भी कपड़ा सिलेगी उस पर प्रत्येक उत्पाद प्रति लागत (पीस रेट) के आधार पर पैसा अदा किया जाएगा।</li>
              </ul>
            </div>
            
            <div className="text-right text-xs text-slate-400 font-bold font-mono">Page 1 of 4</div>
          </section>

          {/* PAGE 2: GUIDELINES PART 2 */}
          <section className="bg-white p-12 md:p-16 rounded-3xl shadow-xl min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none print:min-h-screen print:page-break-after-always">
            <div className="space-y-10">
              <div className="text-center space-y-2 border-b-4 border-[#ED1C24] pb-4">
                <h1 className="text-3xl font-black text-[#ED1C24] uppercase tracking-wide font-sans">AAGAJ FOUNDATION</h1>
                <p className="text-slate-600 font-bold text-xs">GST: 10AAHTA9693GIZM | PAN: AAHTA9693G</p>
                <div className="h-1.5 w-24 bg-[#fdd831] mx-auto rounded-full mt-2"></div>
              </div>

              <ul className="list-disc pl-6 space-y-6 text-slate-800 text-justify text-base leading-relaxed font-semibold mt-12">
                <li>महिला समूह की सभी सदस्य सिलाई यूनिट की सामग्री आदि खरीदने हेतु रकम बैंक से आहरण के लिए चेक या ए टी एम या नेट बैंकिंग या मोबाइल बैंकिंग हेतु सहमत है।</li>
                <li>आगाज फाउंडेशन के सहयोग से मुहैया कराया गया पैसा महिला कपड़े के स्वरोजगार में ही लगाएगी। यदि महिला पैसे को आगाज फाउंडेशन के साथ स्वरोजगार में नहीं लगाती है तो यह वादा खिलाफी कहलाएगी।</li>
                <li>जिस महिला समूह के द्वारा पैसा गबन किया जाएगा उनपर कानूनी कार्रवाई की जाएगी।</li>
                <li>महिला समूह के द्वारा अर्जित किया गया पैसा का 10% आगाज फाउंडेशन के पास जमा रहेगा।</li>
                <li>आगाज फाउंडेशन व महिला की सहमति से महिलाओं के पद निर्धारित किए जाएंगे तथा पदाधिकारी सभी तरह के रजिस्टर जैसे हाजिरी, स्टोर कीपिंग, स्टॉक मैनेजमेंट आदि बनाएगी।</li>
                <li>समूह में मौजूद कोई भी सामान व कागजात बेमेल होने पर समूह की आय पर इसका प्रभाव पड़ सकता है।</li>
              </ul>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-800 space-y-2 mt-20">
                <h4 className="font-extrabold text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" /> भुगतान सफलतापूर्वक सत्यापित (Payment Verified)
                </h4>
                <p className="text-sm font-semibold">ट्रांजैक्शन आईडी (Txn ID): <span className="font-mono font-black">{successData.paymentId || 'Verified'}</span></p>
                <p className="text-sm font-semibold">पंजीकरण राशि (Amount Paid): <span className="font-black text-emerald-700">₹{successData.registrationFee || 5000}</span></p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-bold font-mono">Page 2 of 4</div>
          </section>

          {/* PAGE 3: FORM FILL AREA + ROWS 1-5 */}
          <section className="bg-white p-12 md:p-16 rounded-3xl shadow-xl min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none print:min-h-screen print:page-break-after-always">
            <div className="space-y-6">
              <div className="text-center space-y-2 border-b-2 border-slate-200 pb-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-wide font-sans">अनुबंध विवरण (Agreement Record)</h2>
                <p className="text-[#ED1C24] font-bold text-xs uppercase tracking-wide">Aagaj Foundation Women Self-Employment</p>
              </div>

              {/* Form details in text format */}
              <div className="text-slate-800 text-lg leading-loose space-y-2 py-4 border-b border-slate-100 font-semibold">
                <p>
                  • आगाज फाउंडेशन के अथक प्रयास से <span className="underline decoration-dotted font-black text-slate-900 px-2">{successData.location?.village}</span> गांव, <span className="underline decoration-dotted font-black text-slate-900 px-2">{successData.location?.panchayat}</span> पंचायत, <span className="underline decoration-dotted font-black text-slate-900 px-2">{successData.location?.subDivision || successData.location?.anumandal}</span> अनुमंडल, <span className="underline decoration-dotted font-black text-slate-900 px-2">{successData.location?.district}</span> जिला में महिलाओं का समूह बनाकर रोजगार मुहैया कराया जा रहा है।
                </p>
                <p className="text-xl pt-2 font-black text-slate-900">
                  महिला समूह का नाम: <span className="underline decoration-dotted text-[#ED1C24] px-4 font-black">{successData.groupName}</span>
                </p>
              </div>

              {/* Members Table Part 1 (First 5 members) */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full border-collapse border border-slate-900 text-slate-900 text-sm">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 p-3 text-left w-[42%]">महिलाओं का नाम व पता :</th>
                      <th className="border border-slate-900 p-3 text-left w-[42%]">(आधार कार्ड / पैन कार्ड / मोबाइल नं)</th>
                      <th className="border border-slate-900 p-3 text-center w-[16%]">PHOTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successData.members?.slice(0, 5).map((member, idx) => (
                      <tr key={idx} className="h-[120px]">
                        <td className="border border-slate-900 p-3 font-semibold space-y-1">
                          <p className="font-black text-slate-900">{idx + 1}. {member.fullName}</p>
                          <p className="text-xs text-slate-500 font-semibold">{member.address}</p>
                        </td>
                        <td className="border border-slate-900 p-3 font-mono font-bold text-xs space-y-1 text-slate-700">
                          <p>Aadhar: {member.aadharCard}</p>
                          {member.panCard && <p>PAN: {member.panCard}</p>}
                          <p>Mobile: {member.mobileNumber}</p>
                        </td>
                        <td className="border border-slate-900 p-1 text-center vertical-middle">
                          {member.photoUrl ? (
                            <img src={member.photoUrl.startsWith('http') ? member.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${member.photoUrl}`} alt="photo" className="max-h-[110px] max-w-[80px] object-cover mx-auto rounded shadow-sm border border-slate-200" />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold font-sans">NO PHOTO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Add blank rows if less than 5 to preserve printing height layout */}
                    {Array(Math.max(0, 5 - (successData.members?.slice(0, 5).length || 0))).fill(0).map((_, idx) => {
                      const absoluteIdx = (successData.members?.slice(0, 5).length || 0) + idx;
                      return (
                        <tr key={`blank-${idx}`} className="h-[120px] bg-slate-50/20">
                          <td className="border border-slate-900 p-3 font-semibold text-slate-300">{absoluteIdx + 1}. —</td>
                          <td className="border border-slate-900 p-3 text-slate-300">—</td>
                          <td className="border border-slate-900 p-3 text-slate-300 text-center">—</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-bold font-mono">Page 3 of 4</div>
          </section>

          {/* PAGE 4: ROWS 6-10 + SIGNATURE SECTION */}
          <section className="bg-white p-12 md:p-16 rounded-3xl shadow-xl min-h-[1050px] flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none print:min-h-screen print:page-break-after-auto">
            <div className="space-y-6">
              <div className="text-center space-y-1 border-b-2 border-slate-200 pb-3">
                <h2 className="text-2xl font-black text-slate-800 tracking-wide font-sans">अनुबंध विवरण (Agreement Record - Contd.)</h2>
                <p className="text-[#ED1C24] font-bold text-xs uppercase">Aagaj Foundation Women Self-Employment</p>
              </div>

              {/* Members Table Part 2 (Members 6-10) */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full border-collapse border border-slate-900 text-slate-900 text-sm">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-900 p-3 text-left w-[42%]">महिलाओं का नाम व पता :</th>
                      <th className="border border-slate-900 p-3 text-left w-[42%]">(आधार कार्ड / पैन कार्ड / मोबाइल नं)</th>
                      <th className="border border-slate-900 p-3 text-center w-[16%]">PHOTO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successData.members?.slice(5, 10).map((member, idx) => (
                      <tr key={idx} className="h-[120px]">
                        <td className="border border-slate-900 p-3 font-semibold space-y-1">
                          <p className="font-black text-slate-900">{idx + 6}. {member.fullName}</p>
                          <p className="text-xs text-slate-500 font-semibold">{member.address}</p>
                        </td>
                        <td className="border border-slate-900 p-3 font-mono font-bold text-xs space-y-1 text-slate-700">
                          <p>Aadhar: {member.aadharCard}</p>
                          {member.panCard && <p>PAN: {member.panCard}</p>}
                          <p>Mobile: {member.mobileNumber}</p>
                        </td>
                        <td className="border border-slate-900 p-1 text-center vertical-middle">
                          {member.photoUrl ? (
                            <img src={member.photoUrl.startsWith('http') ? member.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${member.photoUrl}`} alt="photo" className="max-h-[110px] max-w-[80px] object-cover mx-auto rounded shadow-sm border border-slate-200" />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-bold font-sans">NO PHOTO</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Add blank rows if less than 5 to preserve printing height layout */}
                    {Array(Math.max(0, 5 - (successData.members?.slice(5, 10).length || 0))).fill(0).map((_, idx) => {
                      const absoluteIdx = (successData.members?.slice(5, 10).length || 0) + idx + 5;
                      return (
                        <tr key={`blank-${idx}`} className="h-[120px] bg-slate-50/20">
                          <td className="border border-slate-900 p-3 font-semibold text-slate-300">{absoluteIdx + 1}. —</td>
                          <td className="border border-slate-900 p-3 text-slate-300">—</td>
                          <td className="border border-slate-900 p-3 text-slate-300 text-center">—</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signature section matching original layout */}
              <div className="flex justify-between items-center pt-24 font-bold text-base text-slate-800">
                <div className="text-center space-y-1 flex flex-col items-center">
                  <div className="h-0.5 w-36 bg-slate-400"></div>
                  <span>आधिकारिक हस्ताक्षर</span>
                  <span className="text-xs text-slate-500 font-bold">(Aagaj Officer)</span>
                </div>
                <div className="text-center space-y-1 flex flex-col items-center">
                  <div className="h-0.5 w-36 bg-slate-400"></div>
                  <span>एरिया को-ऑर्डिनेटर</span>
                  <span className="text-xs text-slate-500 font-bold">(Coordinator)</span>
                </div>
                <div className="text-center space-y-1 flex flex-col items-center">
                  <div className="h-0.5 w-36 bg-slate-400"></div>
                  <span>आधिकारिक हस्ताक्षर</span>
                  <span className="text-xs text-slate-500 font-bold">(Aagaj Trust)</span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 font-bold font-mono">Page 4 of 4</div>
          </section>

        </div>
      </div>
    );
  }

  // FAILED STATUS VIEW
  if (statusParam === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6 border border-red-100">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">भुगतान विफल (Payment Failed)</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            आपका भुगतान विफल हो गया है। यदि आपके खाते से पैसे कट गए हैं, तो वे 3-5 कार्य दिवसों के भीतर वापस आ जाएंगे।
          </p>
          <button
            onClick={() => navigate('/swarojgaar/register')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3 font-extrabold text-white hover:bg-[#b0151b] transition-all"
          >
            <RefreshCw className="h-5 w-5" /> फिर से प्रयास करें (Try Again)
          </button>
        </div>
      </div>
    );
  }

  // STANDARD FORM VIEW
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Top action header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/schemes/swarojgaar')}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
        >
          <ArrowLeft className="h-5 w-5" /> पीछे (Back)
        </button>
        <span className="text-xs font-bold text-slate-500 italic">Self-Employment Contract Form</span>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative p-8 md:p-12 space-y-8">
        
        {/* Foundation Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="Aagaj Logo" className="h-20 w-auto rounded-lg shadow-inner" />
            <div className="text-left space-y-0.5">
              <h2 className="text-3xl font-black text-[#ED1C24] tracking-tight uppercase leading-none">आगाज फाउंडेशन</h2>
              <p className="text-xs font-extrabold text-[#000080] tracking-wider">भारतीय ट्रस्ट अधिनियम 1882 के तहत पंजीकृत</p>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">GST: 10AAHTA9693GIZM | PAN: AAHTA9693G</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider">महिला स्वरोजगार अनुबंध</p>
            <p className="text-xs font-extrabold">पंजीकरण एवं स्वरोजगार पोर्टल</p>
          </div>
        </div>

        {/* Live Camera Webcam overlay */}
        {cameraActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full p-4 space-y-4 text-center">
              <p className="text-slate-800 font-black text-sm">सदस्य {cameraIndex + 1} फोटो कैप्चर</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(handlePayment)} className="space-y-10 text-left">
          
          {/* SECTION 1: Location details */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-[#ED1C24]" /> 1. स्थानीय विवरण (Location & Group Information)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">गांव / टोला (Village)</label>
                <input
                  type="text"
                  className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.village ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                  placeholder="गांव का नाम"
                  {...register('village', { required: 'गांव का नाम अनिवार्य है' })}
                />
                {errors.village && <p className="text-red-500 text-xs font-bold">{errors.village.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">पंचायत (Panchayat)</label>
                <input
                  type="text"
                  className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.panchayat ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                  placeholder="पंचायत का नाम"
                  {...register('panchayat', { required: 'पंचायत का नाम अनिवार्य है' })}
                />
                {errors.panchayat && <p className="text-red-500 text-xs font-bold">{errors.panchayat.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">अनुमंडल (Sub-Division)</label>
                <input
                  type="text"
                  className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.anumandal ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                  placeholder="अनुमंडल का नाम"
                  {...register('anumandal', { required: 'अनुमंडल का नाम अनिवार्य है' })}
                />
                {errors.anumandal && <p className="text-red-500 text-xs font-bold">{errors.anumandal.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">जिला (District)</label>
                <input
                  type="text"
                  className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.district ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                  placeholder="जिला का नाम"
                  {...register('district', { required: 'जिला का नाम अनिवार्य है' })}
                />
                {errors.district && <p className="text-red-500 text-xs font-bold">{errors.district.message}</p>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">महिला समूह का नाम (Group Name - Unique)</label>
                <input
                  type="text"
                  className={`w-full border-b-2 py-2 text-slate-800 text-base font-black focus:outline-none uppercase text-[#ED1C24] ${errors.groupName ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                  placeholder="उदाहरण: आजीविका महिला सिलाई समूह पालकी"
                  {...register('groupName', { required: 'महिला समूह का नाम अनिवार्य है' })}
                />
                {errors.groupName && <p className="text-red-500 text-xs font-bold">{errors.groupName.message}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 2: Members inputs */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2">
              2. समूह सदस्यों का विवरण (Members Registry - Max 10)
            </h3>
            <p className="text-xs font-semibold text-slate-500 italic">ℹ️ कम से कम 1 सदस्य का विवरण और फोटो होना आवश्यक है।</p>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {fields.map((field, idx) => {
                const isMemberActive = watchMembers[idx]?.name && watchMembers[idx]?.name.trim() !== '';
                return (
                  <div key={field.id} className={`p-5 rounded-2xl border-2 transition-all grid grid-cols-1 md:grid-cols-12 gap-4 items-center ${isMemberActive ? 'bg-slate-50 border-[#fdd831]/50 shadow-sm' : 'bg-slate-50/20 border-slate-100'}`}>
                    <div className="md:col-span-1 text-center">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-black text-xs ${isMemberActive ? 'bg-[#fdd831] text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                    </div>

                    <div className="md:col-span-4 space-y-2">
                      <input
                        type="text"
                        placeholder="सदस्य का नाम (Full Name)"
                        className="w-full text-xs font-bold border-b border-slate-200 py-1.5 focus:outline-none uppercase focus:border-[#ED1C24] bg-transparent"
                        {...register(`members.${idx}.name`)}
                      />
                      <input
                        type="text"
                        placeholder="पता (Full Address)"
                        className="w-full text-[11px] font-semibold border-b border-slate-200 py-1.5 focus:outline-none focus:border-[#ED1C24] bg-transparent"
                        {...register(`members.${idx}.address`)}
                      />
                    </div>

                    <div className="md:col-span-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="आधार (Aadhar)"
                          className="w-full text-[11px] font-bold border-b border-slate-200 py-1.5 focus:outline-none focus:border-[#ED1C24] bg-transparent font-mono"
                          {...register(`members.${idx}.aadhar`)}
                        />
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="पैन (PAN - Optional)"
                          className="w-full text-[11px] font-bold border-b border-slate-200 py-1.5 focus:outline-none uppercase focus:border-[#ED1C24] bg-transparent font-mono"
                          {...register(`members.${idx}.pan`)}
                        />
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="मोबाइल नं (Mobile No)"
                        className="w-full text-[11px] font-bold border-b border-slate-200 py-1.5 focus:outline-none focus:border-[#ED1C24] bg-transparent font-mono"
                        {...register(`members.${idx}.mobile`)}
                      />
                    </div>

                    {/* Member photo upload/webcam capture */}
                    <div className="md:col-span-3 flex items-center justify-center gap-4 shrink-0">
                      <div className="h-20 w-16 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center relative bg-slate-50 shrink-0 shadow-inner">
                        {memberPhotoPreviews[idx] ? (
                          <img src={memberPhotoPreviews[idx]} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">फोटो</span>
                        )}
                        <button
                          type="button"
                          onClick={() => startCamera(idx)}
                          className="absolute bottom-1 right-1 bg-[#ED1C24] hover:bg-[#b0151b] p-1 rounded-full text-white shadow active:scale-95 transition-all z-10"
                          title="Capture via webcam"
                        >
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col text-left">
                        <label className="cursor-pointer text-[10px] font-black text-[#ED1C24] hover:underline uppercase tracking-wide">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(e, idx)}
                          />
                        </label>
                        <span className="text-[8px] text-slate-400 font-semibold">Max 2MB jpeg/png</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Custom Billing/Invoice settings */}
          <div className="space-y-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest border-b border-slate-200 pb-2">
              3. शुल्क भुगतान (Invoice & Fees)
            </h3>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold text-slate-500 uppercase">समूह पंजीकरण राशि (Registration Amount)</span>
                <p className="text-xs text-slate-400 font-semibold">स्वरोजगार अनुबंध और आर्डर प्रोसेसिंग गेटवे शुल्क।</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-700">₹</span>
                <input
                  type="number"
                  className={`w-32 text-center text-xl font-black focus:outline-none border-b-2 border-[#ED1C24] bg-transparent text-[#ED1C24] ${errors.registrationFee ? 'border-red-400' : ''}`}
                  placeholder="5000"
                  {...register('registrationFee', { required: 'भुगतान राशि अनिवार्य है', min: { value: 1, message: 'Must be greater than 0' } })}
                />
              </div>
            </div>
            {errors.registrationFee && <p className="text-red-500 text-xs font-bold text-right">{errors.registrationFee.message}</p>}
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            id="swarojgaarPayBtn"
            className="w-full rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white py-5 shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
          >
            भुगतान करें और अनुबंध सहेजें (Pay & Save Document)
          </button>
        </form>
      </div>
    </div>
  );
};

export default SwarojgaarRegister;
