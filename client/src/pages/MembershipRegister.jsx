import { 
  User, Phone, Mail, MapPin, Shield, CreditCard, Award, Download, Printer, 
  Search, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Heart, 
  Sparkles, ChevronRight, Lock, CheckSquare, Square, X, Smartphone, KeyRound, Clock, ShieldCheck, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import MembershipCertificate from '../components/MembershipCertificate';
import apiClient from '../api/apiClient';

const INTEREST_OPTIONS = [
  'Education',
  'Health',
  'Environment',
  'Women Empowerment',
  'Child Welfare',
  'Skill Development',
  'Social Service'
];

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2100];

const MembershipRegister = () => {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'certificate' | 'verify'

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(300);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherOrHusbandName: '',
    dobOrAge: '',
    gender: 'Female',
    photoUrl: '',
    mobileNumber: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: 'Bihar',
    pincode: '',
    aadhaarNumber: '',
    panNumber: '',
    occupation: '',
    organization: '',
    membershipType: 'General Member',
    joiningDate: new Date().toISOString().split('T')[0],
    interestAreas: [],
    declarationAccepted: true,
    paymentAmount: 250,
    customAmount: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generated Certificate Data State
  const [generatedMember, setGeneratedMember] = useState(null);

  // Verification tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Ref for certificate html2canvas export and responsive scaling
  const certRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Dynamically Load Razorpay SDK Script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Update scale for responsive certificate preview
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(Math.min(1, width / 880));
        }
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [activeTab, generatedMember]);

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setFormData(prev => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Toggle Interest Areas
  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const exists = prev.interestAreas.includes(interest);
      if (exists) {
        return { ...prev, interestAreas: prev.interestAreas.filter(item => item !== interest) };
      } else {
        return { ...prev, interestAreas: [...prev.interestAreas, interest] };
      }
    });
  };

  // Form Submission with Razorpay Payment Integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter Full Name.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number.');
      return;
    }
    if (!formData.declarationAccepted) {
      setErrorMsg('Please accept the declaration checkbox.');
      return;
    }

    const finalAmount = formData.customAmount ? Number(formData.customAmount) : Number(formData.paymentAmount);
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setErrorMsg('Please select or enter a valid custom payment amount.');
      return;
    }

    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Step 1: Create Razorpay Order on Server
      const orderRes = await fetch(`${baseUrl}/api/membership/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentAmount: finalAmount,
          fullName: formData.fullName.trim(),
          mobileNumber: formData.mobileNumber.trim()
        })
      });

      const orderResult = await orderRes.json();

      if (!orderResult.success || !orderResult.orderId) {
        throw new Error(orderResult.message || 'Failed to initiate payment gateway order.');
      }

      // Step 2: Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        alert('Razorpay SDK failed to load. Please check your internet connection and reload page.');
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay Payment Modal
      const options = {
        key: orderResult.key,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'AAGAJ FOUNDATION',
        description: 'Official Membership Registration Fee',
        image: '/logo.jpeg',
        order_id: orderResult.orderId,
        handler: async function (rzpResponse) {
          setLoading(true);
          try {
            // Step 4: Verify Payment HMAC Signature & Save Member Record ONLY on success
            const verifyRes = await fetch(`${baseUrl}/api/membership/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature,
                formData: {
                  ...formData,
                  paymentAmount: finalAmount
                }
              })
            });

            const verifyResult = await verifyRes.json();

            if (verifyResult.success && verifyResult.data) {
              setGeneratedMember(verifyResult.data);
              setSuccessMsg('Payment verified! Membership registered and Certificate generated.');
              setActiveTab('certificate');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setErrorMsg(verifyResult.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Payment Verification Error:', err);
            setErrorMsg('Server connection error during payment verification.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobileNumber
        },
        theme: {
          color: '#8B1E4B'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        setErrorMsg(response.error.description || 'Payment process failed. Please try again.');
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.error('Membership Order Error:', err);
      setErrorMsg(err.message || 'Server connection error. Please try again.');
      setLoading(false);
    }
  };

  // Certificate Search Verification
  const handleVerifySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setVerifyError('Please enter Membership ID, Mobile Number, or Aadhaar.');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    setGeneratedMember(null);

    try {
      const response = await apiClient.post('/api/membership/request-otp', {
        query: searchQuery.trim()
      });

      if (response.data?.success) {
        setOtpSessionId(response.data.sessionId);
        setMaskedMobile(response.data.maskedMobile);
        setResendTimer(60);
        setExpiryTimer(300);
        setOtpInput('');
        setOtpError('');
        setShowOtpModal(true);
      } else {
        setVerifyError(response.data?.message || 'No membership record found matching your query.');
      }
    } catch (err) {
      console.error('Membership Search Error:', err);
      setVerifyError(err.response?.data?.message || 'Error communicating with server.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setOtpError('');
    setOtpLoading(true);
    try {
      const response = await apiClient.post('/api/membership/request-otp', { query: searchQuery.trim() });
      if (response.data?.success) {
        setOtpSessionId(response.data.sessionId);
        setResendTimer(60);
        setExpiryTimer(300);
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

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const trimmedOtp = otpInput.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setOtpError('Please enter the complete OTP sent to your phone.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await apiClient.post('/api/membership/verify-otp', {
        sessionId: otpSessionId,
        otp: trimmedOtp
      });

      if (response.data?.success && response.data.data) {
        setGeneratedMember(response.data.data);
        setShowOtpModal(false);
      } else {
        setOtpError(response.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Download Certificate as Image
  const handleDownloadCert = () => {
    if (!certRef.current) return;
    html2canvas(certRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Membership_Certificate_${generatedMember?.membershipId || 'AAGAJ'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error("Download certificate error:", err);
        alert("Could not generate image file. Please try again.");
      });
  };

  // Print Certificate
  const handlePrintCert = () => {
    if (!certRef.current) return;
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(style => style.outerHTML)
      .join('\n');

    const printable = certRef.current.outerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Membership Certificate - AAGAJ FOUNDATION</title>
          <base href="${window.location.origin}/">
          ${styles}
          <style>
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; background: #fff; }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 900px;">
            ${printable}
          </div>
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-semibold mb-3">
          <Sparkles className="w-4 h-4" /> AAGAJ FOUNDATION MEMBERSHIP PORTAL
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          आगाज फाउंडेशन सदस्यता पंजीकरण फॉर्म
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
          Join our mission for empowering communities. Complete the membership form below, make your payment, and receive your instant official Membership Certificate!
        </p>

        {/* Tab Buttons */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'register'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" /> New Membership Registration
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'verify'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" /> Verify / Print Certificate
          </button>

          {generatedMember && (
            <button
              onClick={() => setActiveTab('certificate')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'certificate'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
              }`}
            >
              <Award className="w-4 h-4" /> View Generated Certificate
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* ========================================================================= */}
        {/* TAB 1: REGISTRATION FORM */}
        {/* ========================================================================= */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-rose-200" /> Membership Registration Form (सदस्यता फॉर्म)
              </h2>
              <p className="text-rose-100 text-xs mt-1">Please fill in accurate information to generate your official membership certificate.</p>
            </div>

            {errorMsg && (
              <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              
              {/* SECTION 1: Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">1</span>
                  Personal Details (व्यक्तिगत विवरण)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name * (पूरा नाम)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anjali Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Father's / Husband's Name (पिता/पति का नाम)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      value={formData.fatherOrHusbandName}
                      onChange={(e) => setFormData({ ...formData, fatherOrHusbandName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Date of Birth / Age (जन्म तिथि / आयु)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15/08/1995 or 28 Years"
                      value={formData.dobOrAge}
                      onChange={(e) => setFormData({ ...formData, dobOrAge: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Gender (लिंग)
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm bg-white"
                    >
                      <option value="Female">Female (महिला)</option>
                      <option value="Male">Male (पुरुष)</option>
                      <option value="Other">Other (अन्य)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Passport Size Photo (पासपोर्ट साइज फोटो)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
                      />
                      {photoPreview && (
                        <div className="relative w-12 h-14 shrink-0 rounded-lg overflow-hidden border border-rose-300 shadow-sm">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">2</span>
                  Contact Details (संपर्क विवरण)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Mobile Number * (मोबाइल नंबर)
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email ID (Optional) (ईमेल)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. member@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      City (शहर)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patna"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      District (ज़िला)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patna"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      State (राज्य)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bihar"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      PIN Code (पिन कोड)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 800001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Address (पूरा पता)
                    </label>
                    <input
                      type="text"
                      placeholder="Village/Mohalla, Post, Landmark..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Identity Proof */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">3</span>
                  Identity Proof (पहचान प्रमाण)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Aadhaar Number (आधार कार्ड संख्या)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12 digit Aadhaar Number"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      PAN Number (Optional) (पैन नंबर)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="10 digit PAN Number"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Occupation Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">4</span>
                  Occupation Details (व्यवसाय विवरण)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Occupation / Profession (व्यवसाय / पेशा)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Social Worker, Teacher, Business, Housewife"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Organization / Company Name (Optional) (संस्था/कंपनी)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Self Employed / School / NGO"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Membership Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">5</span>
                  Membership Details (सदस्यता विवरण)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Membership Type (सदस्यता का प्रकार)
                    </label>
                    <select
                      value={formData.membershipType}
                      onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm bg-white font-semibold"
                    >
                      <option value="General Member">General Member (सामान्य सदस्य)</option>
                      <option value="Volunteer">Volunteer (स्वयंसेवक)</option>
                      <option value="Life Member">Life Member (आजीवन सदस्य)</option>
                      <option value="Active Member">Active Member (सक्रिय सदस्य)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Joining Date (जुड़ने की तिथि)
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Interest Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">6</span>
                  Interest Area (रुचि क्षेत्र)
                </div>

                <p className="text-xs text-slate-500">Select areas where you would like to contribute or volunteer:</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = formData.interestAreas.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{interest}</span>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 7: Declaration */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">7</span>
                  Declaration (घोषणा)
                </div>

                <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-1 h-5 w-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    ☐ I hereby declare that the information provided by me is true and I agree to follow the rules and regulations of the organization. (मैं घोषणा करता/करती हूँ कि मेरे द्वारा दी गई जानकारी सत्य है और मैं संगठन के नियमों का पालन करने के लिए सहमत हूँ।)
                  </span>
                </label>
              </div>

              {/* SECTION 8: Custom Payment Amount & Pay Button */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">8</span>
                  Custom Payment Amount (भुगतान राशि)
                </div>

                <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-rose-300 uppercase tracking-wide">Select or Enter Contribution Amount</h3>
                      <p className="text-xs text-slate-400">आप अपनी स्वेच्छा से कोई भी राशि डालकर सदस्यता प्राप्त कर सकते हैं।</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-rose-400 opacity-80" />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {PRESET_AMOUNTS.map((amt) => {
                      const isSelected = !formData.customAmount && formData.paymentAmount === amt;
                      return (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setFormData({ ...formData, paymentAmount: amt, customAmount: '' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50 scale-105'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Amount Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                      Enter Custom Amount (कस्टम राशि दर्ज करें ₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-lg">₹</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter any amount (e.g. 500)"
                        value={formData.customAmount}
                        onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                        className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white font-extrabold text-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Total Payable Amount:</span>
                    <span className="text-2xl font-black text-rose-400">
                      ₹{formData.customAmount ? formData.customAmount : formData.paymentAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-base shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Generating Certificate & Registering...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Submit & Generate Certificate (₹{formData.customAmount || formData.paymentAmount})
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VERIFICATION & LOOKUP SEARCH */}
        {/* ========================================================================= */}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verify / Download Certificate</h2>
              <p className="text-slate-500 text-xs">Enter Membership ID, Mobile Number, or Aadhaar to retrieve your certificate.</p>
            </div>

            {verifyError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold text-center">
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifySearch} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. AF-MBR-2026-00001 or Mobile Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-300 text-center font-bold text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {verifyLoading ? 'Searching...' : 'Search Membership Record'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DYNAMIC AUTOMATIC MEMBERSHIP CERTIFICATE */}
        {/* ========================================================================= */}
        {(activeTab === 'certificate' || generatedMember) && activeTab === 'certificate' && (
          <div className="space-y-4">
            <MembershipCertificate
              member={generatedMember}
              onClose={() => {
                setGeneratedMember(null);
                setActiveTab('register');
              }}
            />
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
                <div className="p-2 rounded-xl bg-rose-100 text-[#8B1E4B]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Membership OTP Verification</h3>
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
                <Smartphone className="h-8 w-8 mx-auto text-[#8B1E4B] mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-600">
                  Enter the verification code sent to your registered mobile number:
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
                    className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] py-3 pl-10 pr-4 rounded-2xl border-2 border-rose-200 text-slate-900 focus:border-[#8B1E4B] outline-none transition-all shadow-inner bg-white"
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
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Submit OTP Button */}
              <button
                type="submit"
                disabled={otpLoading || otpInput.trim().length < 4 || expiryTimer <= 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#8B1E4B] hover:bg-[#6c163a] text-white py-3.5 text-sm font-black shadow-lg shadow-rose-900/25 tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-200"
              >
                {otpLoading ? (
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
                {resendTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">
                    Didn't receive code? Resend available in <strong className="font-mono text-[#8B1E4B]">{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8B1E4B] hover:text-rose-900 cursor-pointer underline transition-all"
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

export default MembershipRegister;
