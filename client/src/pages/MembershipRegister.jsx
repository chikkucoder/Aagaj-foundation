import React, { useState, useRef } from 'react';
import { 
  User, Phone, Mail, MapPin, Shield, CreditCard, Award, Download, Printer, 
  Search, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Heart, 
  Sparkles, ChevronRight, Lock, CheckSquare, Square
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';

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

  // Ref for certificate html2canvas export
  const certRef = useRef(null);

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

  // Form Submission
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
      const payload = {
        ...formData,
        paymentAmount: finalAmount,
        paymentId: `TXN-MBR-${Date.now()}`
      };

      const response = await fetch(`${baseUrl}/api/membership/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedMember(result.data);
        setSuccessMsg('Membership registered successfully! Certificate generated.');
        setActiveTab('certificate');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(result.message || 'Failed to submit membership registration.');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setErrorMsg('Server connection error. Please try again.');
    } finally {
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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/membership/verify?query=${encodeURIComponent(searchQuery.trim())}`);
      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedMember(result.data);
        setActiveTab('certificate');
      } else {
        setVerifyError(result.message || 'No membership record found.');
      }
    } catch (err) {
      console.error(err);
      setVerifyError('Verification failed. Server connection error.');
    } finally {
      setVerifyLoading(false);
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
          <div className="space-y-6">
            
            {/* Top Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-md border border-slate-200 print:hidden">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Membership Verified & Certificate Ready!
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCert}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" /> Download Certificate (PNG)
                </button>

                <button
                  onClick={handlePrintCert}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>

                <button
                  onClick={() => {
                    setGeneratedMember(null);
                    setActiveTab('register');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-all"
                >
                  + New Member
                </button>
              </div>
            </div>

            {/* THE OFFICIAL MEMBERSHIP CERTIFICATE DESIGN */}
            <div className="flex justify-center">
              <div
                ref={certRef}
                className="w-full max-w-4xl bg-gradient-to-b from-amber-50/40 via-white to-rose-50/30 p-8 sm:p-12 border-[12px] border-double border-rose-900 rounded-3xl shadow-2xl relative font-serif text-slate-800 overflow-hidden"
              >
                
                {/* Decorative Certificate Corner Accents */}
                <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-rose-600 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-rose-600 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-rose-600 rounded-bl-xl pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-rose-600 rounded-br-xl pointer-events-none"></div>

                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                  <img src="/logo.jpeg" alt="Watermark" className="w-[450px] h-auto object-contain" />
                </div>

                {/* Header Info */}
                <div className="flex justify-between items-center text-[11px] font-sans font-bold text-slate-600 mb-4 pb-2 border-b border-rose-200">
                  <div>
                    Reg. No: <span className="text-slate-900 font-black">759445/2020</span> | NGO DARPAN: <span className="text-rose-900 font-black">BR/2020/0260968</span>
                  </div>
                  <div className="text-center font-mono">
                    <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-black">
                      CERTIFICATE NO: {generatedMember?.certificateNo || 'AF/MBR/2026/00001'}
                    </span>
                  </div>
                  <div>ISO 9001:2015 CERTIFIED</div>
                </div>

                {/* Logo & Foundation Header */}
                <div className="text-center space-y-2 mb-6">
                  <div className="flex justify-center items-center gap-4">
                    <img src="/logo.jpeg" alt="Aagaj Foundation Logo" className="h-20 w-auto rounded-xl shadow-md border-2 border-rose-600" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-rose-900 tracking-wider uppercase font-sans">
                    AAGAJ FOUNDATION
                  </h1>
                  <p className="text-xs font-sans font-bold text-slate-600 uppercase tracking-widest">
                    (Registered Under Indian Trust Act 1882 | NGO DARPAN NO – BR/2020/0260968)
                  </p>
                  <p className="text-xs font-sans font-medium text-slate-500">
                    Head Office: Main Road, Patna, Bihar | Web: www.aagajfoundation.com
                  </p>
                </div>

                {/* Certificate Title Badge */}
                <div className="text-center my-6">
                  <div className="inline-block bg-gradient-to-r from-rose-800 via-rose-600 to-rose-800 text-white font-sans font-black text-lg sm:text-xl uppercase tracking-widest px-8 py-2 rounded-full shadow-lg border-2 border-amber-300">
                    MEMBERSHIP CERTIFICATE / सदस्य प्रमाण पत्र
                  </div>
                </div>

                {/* Main Certificate Content */}
                <div className="my-8 text-center space-y-4 font-sans text-sm sm:text-base leading-relaxed text-slate-800">
                  
                  <p className="text-slate-600 italic">This is to officially certify that / एतद्द्वारा प्रमाणित किया जाता है कि</p>
                  
                  <div className="text-2xl sm:text-3xl font-black text-rose-950 font-serif border-b-2 border-dashed border-rose-400 inline-block px-6 py-1 my-1">
                    {generatedMember?.fullName || 'Full Name'}
                  </div>

                  <p className="text-slate-700">
                    {generatedMember?.fatherOrHusbandName ? `S/o / W/o Shri ${generatedMember.fatherOrHusbandName}, ` : ''}
                    Resident of <strong className="text-slate-900">{generatedMember?.city || generatedMember?.district || 'Patna'}, {generatedMember?.state || 'Bihar'}</strong>
                  </p>

                  <p className="text-slate-800 max-w-2xl mx-auto font-medium">
                    is officially enrolled as an esteemed <span className="bg-rose-100 text-rose-900 font-extrabold px-3 py-1 rounded-lg border border-rose-300">{generatedMember?.membershipType || 'General Member'}</span> of <strong>AAGAJ FOUNDATION</strong> starting from <strong>{generatedMember?.joiningDate || new Date().toISOString().split('T')[0]}</strong>.
                  </p>

                  {generatedMember?.interestAreas && generatedMember.interestAreas.length > 0 && (
                    <p className="text-xs text-slate-600 pt-1">
                      Key Contribution Areas: <strong className="text-slate-800">{generatedMember.interestAreas.join(', ')}</strong>
                    </p>
                  )}

                </div>

                {/* Member Details Grid & Photo */}
                <div className="my-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans text-xs">
                  
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 rounded-xl border-2 border-rose-600 overflow-hidden bg-slate-200 shadow-md shrink-0">
                      {generatedMember?.photoUrl ? (
                        <img src={generatedMember.photoUrl} alt="Member Photo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] text-center font-bold">
                          NO PHOTO
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-left">
                      <p><span className="text-slate-500 font-bold">Membership ID:</span> <strong className="text-slate-900 font-mono text-xs">{generatedMember?.membershipId || 'AF-MBR-2026-00001'}</strong></p>
                      <p><span className="text-slate-500 font-bold">Mobile:</span> <strong className="text-slate-900">{generatedMember?.mobileNumber || 'N/A'}</strong></p>
                      <p><span className="text-slate-500 font-bold">Joining Date:</span> <strong className="text-slate-900">{generatedMember?.joiningDate || 'N/A'}</strong></p>
                      <p><span className="text-slate-500 font-bold">Aadhaar No:</span> <strong className="text-slate-900 font-mono">{generatedMember?.aadhaarNumber ? `XXXX-XXXX-${generatedMember.aadhaarNumber.slice(-4)}` : 'N/A'}</strong></p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm text-left space-y-1 w-full sm:w-auto">
                    <p className="font-bold text-rose-800 text-[11px] uppercase border-b border-slate-100 pb-1">Payment Status: PAID ✅</p>
                    <p><span className="text-slate-500 font-semibold">Amount Paid:</span> <strong className="text-rose-700 font-black">₹{generatedMember?.paymentAmount || 250}</strong></p>
                    <p><span className="text-slate-500 font-semibold">Txn Reference:</span> <strong className="text-slate-800 font-mono text-[10px]">{generatedMember?.paymentId || 'TXN-MBR-12345'}</strong></p>
                  </div>
                </div>

                {/* Signatures & Seal Section */}
                <div className="mt-10 pt-4 border-t border-rose-200 flex justify-between items-end font-sans text-center">
                  
                  <div className="w-32">
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700 uppercase">
                      Settler Cum Secretary
                      <span className="block text-[8px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                    </div>
                  </div>

                  {/* Official Stamp Overlay */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-2 border-rose-700 border-dashed flex flex-col items-center justify-center p-1 opacity-80 rotate-[-12deg] bg-rose-50/50">
                      <span className="text-[6.5px] font-black text-rose-900 uppercase">AAGAJ FOUNDATION</span>
                      <span className="text-[5px] text-rose-700 font-bold">REG. 759445/2020</span>
                      <span className="text-[5px] text-rose-700 font-bold">DARPAN: BR/2020/0260968</span>
                      <span className="text-[5.5px] font-black text-rose-800 mt-0.5">OFFICIAL SEAL</span>
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700 uppercase">
                      Settler Cum President
                      <span className="block text-[8px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="h-10"></div>
                    <div className="border-t border-slate-400 pt-1 text-[10px] font-bold text-slate-700 uppercase">
                      Coordinator / समन्वयक
                      <span className="block text-[8px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                    </div>
                  </div>

                </div>

                {/* Footer QR Verification Code */}
                <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center font-sans text-[9px] text-slate-500">
                  <span>Verify online at: www.aagajfoundation.com/membership</span>
                  <div className="flex items-center gap-2">
                    <span>Scan to verify certificate</span>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=45x45&data=AAGAJ-MBR:${generatedMember?.membershipId}%0ANAME:${encodeURIComponent(generatedMember?.fullName || '')}`}
                      alt="QR"
                      className="w-10 h-10 object-contain rounded border border-slate-300"
                    />
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

export default MembershipRegister;
