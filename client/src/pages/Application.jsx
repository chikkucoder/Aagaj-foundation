import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createApplicationOrder, verifyApplicationPayment } from '../api/paymentApi';
import { Camera, Printer, Award, FileCheck, HelpCircle, ArrowLeft, RefreshCw, LogIn } from 'lucide-react';

const jobFees = {
  'Panchayat Coordinator': 999,
  'Block Coordinator': 1499,
  'District Coordinator': 2100,
  'Health Supervisor': 1499,
  'Mahila Mitra': 999,
  'Skill Trainer': 499,
  'Trainer': 499,
  'Other NGO Job': 499,
  'Normal Job': 499,
  'Computer Operator': 499,
  'Driver': 499,
  'Guard': 499,
  'Peon': 499,
  'Cook': 499,
  'Gardener': 499,
  'Helper': 499,
  'Housekeeping': 499,
  'Receptionist': 499,
  'Other': 499,
};

const translations = {
  en: {
    photo_label: "PHOTO",
    foundation_name: "AAGAJ FOUNDATION",
    reg_text: "Registered Under Indian Trust Act 1882",
    app_form: "APPLICATION FORM",
    block_letters: "ALL ENTIRES TO BE MADE IN CAPITAL BLOCK LETTERS",
    name_full: "Name in Full",
    father_name: "Father / Husband Name",
    mother_name: "Mother's Name",
    dob: "Date of Birth",
    mobile: "Mobile Number",
    email: "Email ID",
    aadhar: "Aadhar Number",
    perm_address: "Permanent Home Address:",
    village: "Village",
    panchayat: "Panchayat",
    post: "Post Office",
    block: "Block",
    police: "Police Station",
    dist: "District",
    state: "State",
    pin: "Pin Code",
    ward: "Ward No",
    total_ward: "Total Ward",
    nation: "Nationality",
    lang: "Language Known",
    acc_no: "Account Number",
    ifsc: "IFSC Code",
    acc_holder: "Account Holder Name",
    bank: "Bank Name",
    qualification: "Educational Qualifications:",
    exam_col: "Exam",
    school_addr: "Name of School/College",
    pass_year: "Year",
    board: "Board/University",
    subjects: "Subjects",
    division: "Division",
    percent: "% Marks",
    remarks: "Remarks",
    matric: "Matric",
    inter: "Intermediate",
    grad: "Graduation",
    choose_post: "Choose Option of the Post:",
    apply_for: "Apply for which post:",
    declaration: "I hereby give my consent and sign as per the above.",
    sig_guardian: "Guardian Signature",
    place: "Place",
    date: "Date",
    sig_coord: "Coordinator Signature",
    note_text: "Note: Registration fee once paid is not refundable.",
    helpline: "Helpline",
    sig_officer: "Officer Signature",
    btn_pay: "Submit & Pay Now",
  },
  hi: {
    photo_label: "फोटो",
    foundation_name: "आगाज फाउंडेशन",
    reg_text: "भारतीय ट्रस्ट अधिनियम 1882 के तहत पंजीकृत",
    app_form: "आवेदन पत्र",
    block_letters: "सभी प्रविष्टियां बड़े अक्षरों में की जाएं",
    name_full: "पूरा नाम",
    father_name: "पिता / पति का नाम",
    mother_name: "माता का नाम",
    dob: "जन्म तिथि",
    mobile: "मोबाइल नंबर",
    email: "ईमेल आईडी",
    aadhar: "आधार नंबर",
    perm_address: "स्थायी घर का पता:",
    village: "गाँव",
    panchayat: "पंचायत",
    post: "डाकघर",
    block: "प्रखंड",
    police: "थाना",
    dist: "जिला",
    state: "राज्य",
    pin: "पिन कोड",
    ward: "वार्ड नंबर",
    total_ward: "कुल वार्ड",
    nation: "राष्ट्रीयता",
    lang: "भाषा ज्ञान",
    acc_no: "खाता नंबर",
    ifsc: "IFSC कोड",
    acc_holder: "खाता धारक का नाम",
    bank: "बैंक का नाम",
    qualification: "शैक्षणिक योग्यता विवरण:",
    exam_col: "परीक्षा",
    school_addr: "स्कूल/कॉलेज का नाम",
    pass_year: "वर्ष",
    board: "बोर्ड/विश्वविद्यालय",
    subjects: "विषय",
    division: "श्रेणी",
    percent: "% अंक",
    remarks: "टिप्पणी",
    matric: "मैट्रिक",
    inter: "इंटरमीडिएट",
    grad: "स्नातक",
    choose_post: "पद का विकल्प चुनें:",
    apply_for: "किस पद के लिए आवेदन:",
    declaration: "अतः उपरोक्त के अनुसार मैं अपना / अपनी सहमति देकर अपना हस्ताक्षर करता / करती हूँ।",
    sig_guardian: "अभिभावक का हस्ताक्षर",
    place: "स्थान",
    date: "दिनांक",
    sig_coord: "समन्वयक का हस्ताक्षर",
    note_text: "नोट: पंजीकरण शुल्क वापसी का कोई प्रावधान नहीं है।",
    helpline: "हेल्पलाइन",
    sig_officer: "ऑफिसर का हस्ताक्षर",
    btn_pay: "जमा करें और भुगतान करें",
  }
};

const Application = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const roleParam = searchParams.get('role');
  const categoryParam = searchParams.get('category') || 'NGO';
  const statusParam = searchParams.get('status');

  const [lang, setLang] = useState('en');
  const [currentFee, setCurrentFee] = useState(499);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Live Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      dob: '',
      place: '',
      date: new Date().toISOString().split('T')[0],
      job_category: categoryParam,
      apply_for_post: roleParam || '',
      role_applied: '',
    }
  });

  const selectedRole = watch('role_applied');

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update role selection based on parameters on load
  useEffect(() => {
    if (categoryParam === 'Normal') {
      // General Jobs dropdown
      const defaultGeneralRole = roleParam && roleParam !== 'Normal Job' ? roleParam : 'Computer Operator';
      setValue('role_applied', defaultGeneralRole);
    } else {
      // NGO Jobs mapping
      const roleMap = {
        'panchayat': 'Panchayat Coordinator',
        'block': 'Block Coordinator',
        'district': 'District Coordinator',
        'health': 'Health Supervisor',
        'mitra': 'Mahila Mitra',
        'trainer': 'Skill Trainer',
        'Panchayat Co-ordinator': 'Panchayat Coordinator',
        'Block Co-ordinator': 'Block Coordinator',
        'District Co-ordinator': 'District Coordinator'
      };
      const resolvedRole = roleMap[roleParam] || roleParam || 'Panchayat Coordinator';
      setValue('role_applied', resolvedRole);
    }
  }, [roleParam, categoryParam, setValue]);

  // Update Fee and apply_for_post based on Selected Role
  useEffect(() => {
    if (selectedRole) {
      setCurrentFee(jobFees[selectedRole] || 499);
      setValue('apply_for_post', selectedRole);
    }
  }, [selectedRole, setValue]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB.');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Live Camera Functions
  const startCamera = async () => {
    setShowCamera(true);
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
        alert('Unable to access camera. Please select a photo file manually.');
        setShowCamera(false);
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
          const file = new File([blob], `captured-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPhotoFile(file);
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
    setShowCamera(false);
  };

  // Form Submit Handler (Razorpay Payment Flow)
  const onSubmitForm = async (data) => {
    if (!photoFile) {
      alert(lang === 'hi' ? 'कृपया अपनी फोटो अपलोड करें।' : 'Please upload your photo before proceeding.');
      return;
    }

    const payBtn = document.getElementById('submitPayBtn');
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = lang === 'hi' 
      ? '<span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> सुरक्षित रूप से रिडायरेक्ट हो रहा है...'
      : '<span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Securely Redirecting...';

    // Pack qualifications structure
    const qualificationsData = {
      matric: { school: data.m_school, year: data.m_year, board: data.m_board, subject: data.m_sub, division: data.m_div, marks: data.m_marks, remarks: data.m_rem },
      inter: { school: data.i_school, year: data.i_year, board: data.i_board, subject: data.i_sub, division: data.i_div, marks: data.i_marks, remarks: data.i_rem },
      grad: { school: data.g_school, year: data.g_year, board: data.g_board, subject: data.g_sub, division: data.g_div, marks: data.g_marks, remarks: data.g_rem },
    };

    const applicationData = {
      full_name: data.fullName,
      mobile: data.mobile,
      email: data.email,
      dob: data.dob,
      district: data.district,
      state: data.state,
      block: data.block,
      panchayat: data.panchayat,
      place: data.place,
      apply_for_post: data.apply_for_post,
      role_applied: data.role_applied,
      aadhar: data.aadhar,
      job_category: categoryParam,
      amount: currentFee,
      qualifications: JSON.stringify(qualificationsData),
      registeredBy: sessionStorage.getItem('loggedInRole') === 'Admin' ? 'Admin/Self' : 'Self',
    };

    const formData = new FormData();
    Object.keys(applicationData).forEach(key => {
      formData.append(key, applicationData[key]);
    });
    formData.append('photo', photoFile);

    try {
      const order = await createApplicationOrder(formData);
      if (order && order.success) {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'Aagaj Foundation',
          description: 'Job Application Fee',
          prefill: {
            name: data.fullName,
            email: data.email,
            contact: data.mobile
          },
          theme: {
            color: '#ED1C24'
          },
          handler: async function (rzpResponse) {
            try {
              const verifyResult = await verifyApplicationPayment({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                pendingOrderId: order.pendingOrderId
              });

              if (verifyResult.success && verifyResult.redirectUrl) {
                // Navigate to the success receipt page
                const redirectParams = new URLSearchParams(verifyResult.redirectUrl.split('?')[1]);
                navigate(`/careers/apply?status=success&${redirectParams.toString()}`);
              } else {
                navigate('/careers/apply?status=failed');
              }
            } catch (err) {
              navigate('/careers/apply?status=failed');
            }
          },
          modal: {
            ondismiss: function () {
              payBtn.innerHTML = originalText;
              payBtn.disabled = false;
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error(order.message || 'Payment initiation failed.');
      }
    } catch (error) {
      alert((lang === 'hi' ? 'भुगतान प्रारंभ करने में त्रुटि: ' : 'Error initiating payment: ') + error.message);
      payBtn.innerHTML = originalText;
      payBtn.disabled = false;
    }
  };

  const t = translations[lang];

  // Success Receipt Layout
  if (statusParam === 'success') {
    const txn = searchParams.get('txn');
    const recName = searchParams.get('name');
    const recMobile = searchParams.get('mobile');
    const recRole = searchParams.get('role');
    const recAmount = searchParams.get('amount');
    const recUniqueId = searchParams.get('unique_id');
    const recPdf = searchParams.get('pdf');

    const handlePrintReceipt = () => {
      window.print();
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-100 space-y-8 text-center" id="receipt-print-area">
          <div className="space-y-3">
            <img src="/logo.jpeg" alt="Logo" className="h-16 mx-auto rounded-lg" />
            <h1 className="text-3xl font-black text-[#ED1C24] tracking-wider">AAGAJ FOUNDATION</h1>
            <p className="text-slate-600 font-bold text-lg">Job Application Payment Receipt</p>
            <div className="h-1 w-20 bg-[#fdd831] mx-auto rounded-full"></div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-4 font-semibold text-slate-700 text-sm md:text-base">
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Receipt Date:</span>
              <span className="text-slate-900 font-bold">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Transaction ID:</span>
              <span className="text-slate-900 font-bold font-mono">{txn}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Application ID:</span>
              <span className="text-[#ED1C24] font-black">{recUniqueId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Full Name:</span>
              <span className="text-slate-900 font-bold">{recName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Mobile No:</span>
              <span className="text-slate-900 font-bold">{recMobile}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3">
              <span>Applied For:</span>
              <span className="text-slate-900 font-bold">{recRole}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Amount Paid:</span>
              <span className="text-green-600 font-black text-xl">₹{recAmount}</span>
            </div>
          </div>

          <p className="text-green-600 font-extrabold text-base flex items-center justify-center gap-1.5 animate-bounce">
            ✔ APPLICATION PAYMENT SUCCESSFULLY PROCESSED
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 print:hidden">
            <button
              onClick={handlePrintReceipt}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              <Printer className="h-5 w-5" /> Print Receipt
            </button>

            {recPdf && recPdf !== 'undefined' && (
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${recPdf}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 shadow transition-all"
              >
                <FileCheck className="h-5 w-5" /> View Form PDF
              </a>
            )}

            <button
              onClick={() => navigate(`/careers/id-card?${searchParams.toString()}`)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-6 py-3 shadow transition-all"
            >
              <Award className="h-5 w-5" /> Proceed to ID Card
            </button>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold text-slate-500 hover:text-[#ED1C24] underline print:hidden block mx-auto"
          >
            Back to Home Page
          </button>
        </div>
      </div>
    );
  }

  // Failed / Cancelled Layout
  if (statusParam === 'failed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <X className="h-10 w-10 stroke-[3]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Payment Failed</h2>
          <p className="text-slate-500 font-semibold leading-relaxed">
            Your transaction was declined or cancelled. If your account was debited, the amount will be refunded within 3-5 working days.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] py-3 font-extrabold text-white"
          >
            <RefreshCw className="h-5 w-5" /> Try Application Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top action header: Language select */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 font-bold text-sm">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-1.5 rounded-lg transition-all ${lang === 'en' ? 'bg-[#ED1C24] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-4 py-1.5 rounded-lg transition-all ${lang === 'hi' ? 'bg-[#ED1C24] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-slate-900/5 relative p-8 md:p-12 space-y-10">
        
        {/* Logo and header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="h-20 w-auto rounded-lg shadow-inner" />
            <div className="text-left space-y-0.5">
              <h2 className="text-3xl font-black text-[#ED1C24] tracking-tight uppercase leading-none">{t.foundation_name}</h2>
              <p className="text-xs font-bold text-[#000080] tracking-wider">{t.reg_text}</p>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">GST: 10AAHTA9693GIZM | PAN: AAHTA9693G</p>
            </div>
          </div>
          
          {/* Photo Frame Container */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="h-32 w-28 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative bg-slate-50 group hover:border-[#ED1C24] transition-all">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-black text-slate-400 tracking-widest">{t.photo_label}</span>
              )}
              <button
                type="button"
                onClick={startCamera}
                className="absolute bottom-1.5 right-1.5 bg-[#ED1C24] hover:bg-[#b0151b] p-1.5 rounded-full text-white shadow-md active:scale-95 transition-all"
                title="Capture via webcam"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <label className="cursor-pointer text-[10px] font-extrabold text-[#ED1C24] hover:underline uppercase tracking-wide">
              Choose Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        {/* Live Camera Modal Overlay */}
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full p-4 space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black aspect-video object-cover"></video>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={capturePhoto}
                  className="rounded-xl bg-green-600 hover:bg-green-700 font-bold text-white px-5 py-2 text-sm shadow active:scale-95"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white px-5 py-2 text-sm shadow active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center bg-rose-50/50 rounded-2xl py-4 border border-rose-100">
          <h3 className="text-lg font-black text-[#000080] tracking-wider uppercase leading-none">{t.app_form}</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1.5">{t.block_letters}</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8 text-left">
          
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
              1. {lang === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.name_full}</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all uppercase ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="ENTER FULL NAME"
                  {...register('fullName', { required: 'Full Name is required' })}
                />
                {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.father_name}</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all uppercase ${errors.fatherName ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="ENTER FATHER / HUSBAND NAME"
                  {...register('fatherName', { required: 'Father/Husband Name is required' })}
                />
                {errors.fatherName && <p className="text-red-500 text-xs font-bold">{errors.fatherName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.mother_name}</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all uppercase ${errors.motherName ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="ENTER MOTHER'S NAME"
                  {...register('motherName', { required: 'Mother\'s Name is required' })}
                />
                {errors.motherName && <p className="text-red-500 text-xs font-bold">{errors.motherName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.dob} (DD/MM/YYYY)</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all ${errors.dob ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  {...register('dob', { 
                    required: 'Date of Birth is required',
                    pattern: { value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, message: 'Format must be DD/MM/YYYY' }
                  })}
                />
                {errors.dob && <p className="text-red-500 text-xs font-bold">{errors.dob.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.mobile}</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all ${errors.mobile ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="10-DIGIT MOBILE NUMBER"
                  maxLength={10}
                  {...register('mobile', {
                    required: 'Mobile is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6-9' }
                  })}
                />
                {errors.mobile && <p className="text-red-500 text-xs font-bold">{errors.mobile.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.email}</label>
                <input
                  type="email"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="name@example.com"
                  {...register('email', { required: 'Email ID is required' })}
                />
                {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.aadhar}</label>
                <input
                  type="text"
                  className={`w-full border rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white transition-all ${errors.aadhar ? 'border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10'}`}
                  placeholder="12-DIGIT AADHAR NUMBER"
                  maxLength={12}
                  {...register('aadhar', {
                    required: 'Aadhar Number is required',
                    pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' }
                  })}
                />
                {errors.aadhar && <p className="text-red-500 text-xs font-bold">{errors.aadhar.message}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 2: PERMANENT HOME ADDRESS */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
              2. {t.perm_address}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.village}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('village', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.panchayat}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('panchayat', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.post}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('post', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.block}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('block', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.police}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('police', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.dist}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('district', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.state}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('state', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.pin}</label>
                <input type="text" maxLength={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...register('pin', { required: true, pattern: /^\d{6}$/ })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.ward}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...register('ward')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.total_ward}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...register('total_ward')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.nation}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('nationality', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.lang}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('languages_known', { required: true })} />
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK DETAILS */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
              3. {lang === 'hi' ? 'बैंक खाता विवरण' : 'Bank Account Details'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.acc_no}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...register('bank_account')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.ifsc}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('bank_ifsc')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.acc_holder}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('bank_holder')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.bank}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('bank_name')} />
              </div>
            </div>
          </div>

          {/* SECTION 4: EDUCATIONAL QUALIFICATIONS */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
              4. {t.qualification}
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner bg-slate-50/50">
              <table className="min-w-[800px] w-full text-slate-700 text-xs font-semibold">
                <thead className="bg-slate-100 text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-left">{t.exam_col}</th>
                    <th className="py-3 px-4 text-left">{t.school_addr}</th>
                    <th className="py-3 px-4 text-left">{t.pass_year}</th>
                    <th className="py-3 px-4 text-left">{t.board}</th>
                    <th className="py-3 px-4 text-left">{t.subjects}</th>
                    <th className="py-3 px-4 text-left">{t.division}</th>
                    <th className="py-3 px-4 text-left">{t.percent}</th>
                    <th className="py-3 px-4 text-left">{t.remarks}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Matric */}
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{t.matric}</td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('m_school')} /></td>
                    <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('m_year')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('m_board')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('m_sub')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('m_div')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('m_marks')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('m_rem')} /></td>
                  </tr>

                  {/* Inter */}
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{t.inter}</td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('i_school')} /></td>
                    <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('i_year')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('i_board')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('i_sub')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('i_div')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('i_marks')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('i_rem')} /></td>
                  </tr>

                  {/* Grad */}
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{t.grad}</td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('g_school')} /></td>
                    <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('g_year')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('g_board')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('g_sub')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('g_div')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...register('g_marks')} /></td>
                    <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...register('g_rem')} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: ROLE SELECTION */}
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
              5. {lang === 'hi' ? 'पद चुनाव' : 'Post Preference'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.choose_post}</label>
                {categoryParam === 'Normal' ? (
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white cursor-pointer transition-all"
                    {...register('role_applied', { required: true })}
                  >
                    <option value="" disabled>-- Select Job Role --</option>
                    {["Computer Operator", "Driver", "Guard", "Peon", "Cook", "Gardener", "Helper", "Housekeeping", "Receptionist", "Other"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white cursor-pointer transition-all"
                    {...register('role_applied', { required: true })}
                  >
                    <option value="" disabled>-- Select Job Role --</option>
                    {["Panchayat Coordinator", "Block Coordinator", "District Coordinator", "Health Supervisor", "Mahila Mitra", "Skill Trainer", "Trainer", "Other NGO Job"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t.apply_for}</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase"
                  placeholder="APPLYING FOR POST"
                  {...register('apply_for_post', { required: true })}
                />
              </div>
            </div>
          </div>

          {/* Declarations and signatures */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <p className="text-center font-bold text-[#000080] text-sm leading-relaxed">
              {t.declaration}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-bold text-slate-500 text-xs items-end">
              <div className="space-y-4 text-center">
                <div className="h-12 border-b-2 border-slate-200"></div>
                <span className="text-slate-600 uppercase tracking-wide text-[10px]">{t.sig_guardian}</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="uppercase text-[10px] tracking-wide text-slate-600">{t.place}</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...register('place', { required: true })} />
              </div>

              <div className="space-y-1.5">
                <label className="uppercase text-[10px] tracking-wide text-slate-600">{t.date}</label>
                <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...register('date', { required: true })} />
              </div>

              <div className="space-y-4 text-center">
                <div className="h-12 border-b-2 border-slate-200"></div>
                <span className="text-slate-600 uppercase tracking-wide text-[10px]">{t.sig_coord}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 rounded-2xl p-6 border border-slate-200 gap-4 mt-8">
            <div className="text-left space-y-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.helpline}</span>
              <p className="text-slate-800 font-extrabold text-lg">📞 06124065270, 9431430464</p>
              <p className="text-[10px] text-red-500 font-black uppercase tracking-wider">{t.note_text}</p>
            </div>
            
            <button
              type="submit"
              id="submitPayBtn"
              className="rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg text-base transition-all duration-300 w-full sm:w-auto"
            >
              {t.btn_pay} ₹{currentFee}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Application;
