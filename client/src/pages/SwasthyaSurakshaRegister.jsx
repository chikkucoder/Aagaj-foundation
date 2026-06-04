import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Sparkles, Building2, MapPin, Phone, CheckSquare, Plus, CheckCircle2 } from 'lucide-react';
import { registerSwasthyaPartner } from '../api/userApi';

const categoryConfig = {
  Hospital: {
    label: "कुल बेड / विशेषज्ञ डॉक्टर (Total Beds / Specialists)",
    placeholder: "उदा. 50 Beds, 10 Doctors",
    licenseLabel: "चिकित्सा पंजीकरण संख्या (Medical Reg No.)",
    services: ["ICU", "Emergency", "OPD", "Ambulance", "Surgery", "General Ward", "Private Ward", "NICU"]
  },
  Lab: {
    label: "NABL प्रत्यायन स्थिति (NABL Accreditation Status)",
    placeholder: "Yes / No / Applied",
    licenseLabel: "लैब लाइसेंस संख्या (Lab License Number)",
    services: ["Blood Test", "Home Collection", "X-Ray", "CT Scan", "Pathology", "MRI", "Ultrasound", "ECG"]
  },
  Pharmacy: {
    label: "ड्रग लाइसेंस समाप्ति तिथि (Drug License Expiry)",
    placeholder: "DD/MM/YYYY",
    licenseLabel: "फार्मेसी लाइसेंस संख्या (Pharmacy License No.)",
    services: ["Home Delivery", "Generic Meds", "Surgicals", "Refrigerated Items", "Baby Care", "Ayurvedic", "Allopathic"]
  },
  IndividualClinic: {
    label: "विशेषज्ञता / अनुभव (Specialization / Experience)",
    placeholder: "उदा. General Physician, 5 Years",
    licenseLabel: "चिकित्सा पंजीकरण संख्या (Medical Reg No.)",
    services: ["OPD", "General Consultation", "Minor Surgery", "Wound Dressing", "Vaccination", "Home Visit", "Online Consultation", "Diagnostic Tests"],
    displayLabel: "Individual Clinic / Doctor"
  }
};

const SwasthyaSurakshaRegister = () => {
  const navigate = useNavigate();
  const [successPartner, setSuccessPartner] = useState(null);
  const [customServices, setCustomServices] = useState({ Hospital: [], Lab: [], Pharmacy: [], IndividualClinic: [] });
  const [customInput, setCustomInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Access control check on mount
  useEffect(() => {
    const role = sessionStorage.getItem('loggedInRole');
    const designation = sessionStorage.getItem('loggedInDesignation') || '';

    if (role === 'Admin' || designation === 'District Coordinator') {
      return;
    }

    alert('पहुंच अस्वीकृत। केवल एडमिन या जिला समन्वयक ही स्वास्थ्य सुरक्षा भागीदारों को पंजीकृत कर सकते हैं। (Access denied. Only Admin or District Coordinator can add Swasthya Suraksha partners.)');
    navigate(role ? '/' : '/login');
  }, [navigate]);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      type: 'Hospital',
      biz: '',
      details: '',
      extraInfo: '',
      license: '',
      addr: '',
      addrExtra: '',
      city: 'Patna',
      state: 'Bihar',
      pin: '',
      owner: '',
      phone: '',
      email: '',
      services: []
    }
  });

  const selectedType = watch('type');

  // Handle addition of custom service
  const handleAddCustomService = () => {
    const term = customInput.trim();
    if (!term) return;

    const currentDefaults = categoryConfig[selectedType].services;
    const currentCustoms = customServices[selectedType];

    if (
      currentDefaults.some(s => s.toLowerCase() === term.toLowerCase()) ||
      currentCustoms.some(s => s.toLowerCase() === term.toLowerCase())
    ) {
      alert('यह सेवा पहले से ही सूची में उपलब्ध है।');
      return;
    }

    setCustomServices(prev => ({
      ...prev,
      [selectedType]: [...prev[selectedType], term]
    }));

    // Auto-select the newly added service
    const currentChecked = watch('services') || [];
    setValue('services', [...currentChecked, term]);
    setCustomInput('');
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const fullAddress = `${data.addr.trim()}, ${data.city.trim()}, ${data.state.trim()} - ${data.pin.trim()}`;
      
      const payload = {
        // Core schema mappings
        name: data.biz.trim(),
        guardianName: data.owner.trim(),
        mobileNumber: data.phone.trim(),
        address: fullAddress,
        trainingName: data.type,
        aadharNumber: data.license.trim(),
        existingSkills: data.extraInfo.trim(),
        caste: (data.services || []).join(', '),

        // Flex schema specific fields
        biz: data.biz.trim(),
        details: data.details.trim(),
        type: data.type,
        addr: data.addr.trim(),
        addrExtra: data.addrExtra.trim(),
        phone: data.phone.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        pin: data.pin.trim(),
        owner: data.owner.trim(),
        extraInfo: data.extraInfo.trim(),
        license: data.license.trim(),
        email: data.email.trim(),
        services: data.services || [],
        yojanaName: 'Swasthya Suraksha Yojana',
        registeredBy: sessionStorage.getItem('loggedInRole') === 'Admin'
          ? 'Admin/Self'
          : (sessionStorage.getItem('loggedInUserEmail') || sessionStorage.getItem('loggedInUser') || 'Self')
      };

      const res = await registerSwasthyaPartner(payload);

      if (res.success && res.data) {
        setSuccessPartner(res.data);
        window.scrollTo(0, 0);
      } else {
        alert('त्रुटि: ' + (res.message || 'पंजीकरण करने में विफल।'));
      }
    } catch (error) {
      console.error(error);
      alert('सर्वर त्रुटि: पंजीकरण विफल। ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Compile full services list for render
  const mergedServices = [
    ...categoryConfig[selectedType].services,
    ...(customServices[selectedType] || [])
  ];

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Top action header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
        >
          <ArrowLeft className="h-5 w-5" /> पीछे (Back)
        </button>
        <span className="text-xs font-bold text-slate-500 italic">Swasthya Suraksha Partner Tie-up Portal</span>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative p-8 md:p-12 space-y-8">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="Logo" className="h-20 w-auto rounded-lg shadow-inner" />
            <div className="text-left space-y-0.5">
              <h2 className="text-3xl font-black text-[#ED1C24] tracking-tight uppercase leading-none">आगाज फाउंडेशन</h2>
              <p className="text-xs font-extrabold text-[#000080] tracking-wider">भारतीय ट्रस्ट अधिनियम 1882 के तहत पंजीकृत</p>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">GST: 10AAHTA9693GIZM | PAN: AAHTA9693G</p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100 text-[#ED1C24] text-center space-y-0.5">
            <p className="text-xs font-black uppercase tracking-wider">स्वास्थ्य सुरक्षा योजना</p>
            <p className="text-xs font-extrabold text-[#000080]">पार्टनर टाई-अप पोर्टल</p>
          </div>
        </div>

        {/* SUCCESS STATE */}
        {successPartner ? (
          <div className="bg-white p-8 rounded-3xl text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 stroke-[3] animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">पंजीकरण सफल! (Registration Successful)</h2>
              <p className="text-slate-500 font-semibold leading-relaxed">
                आपका व्यावसायिक आवेदन सफलतापूर्वक सहेज लिया गया है और समीक्षाधीन है।
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 font-semibold text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>पार्टनर आईडी (Partner ID):</span>
                <span className="text-[#ED1C24] font-black text-lg">{successPartner.uniqueId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>व्यवसाय का नाम (Business Name):</span>
                <span className="text-slate-900 font-bold">{successPartner.businessName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>श्रेणी (Category):</span>
                <span className="text-slate-900 font-bold">{successPartner.category}</span>
              </div>
              <div className="flex justify-between">
                <span>पंजीकरण तिथि (Date):</span>
                <span className="text-slate-900 font-bold">{new Date(successPartner.registrationDate).toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 shadow transition-all"
              >
                प्रिंट करें (Print Receipt)
              </button>
              <button
                onClick={() => {
                  setSuccessPartner(null);
                  setValue('biz', '');
                  setValue('details', '');
                  setValue('extraInfo', '');
                  setValue('license', '');
                  setValue('addr', '');
                  setValue('addrExtra', '');
                  setValue('pin', '');
                  setValue('owner', '');
                  setValue('phone', '');
                  setValue('email', '');
                  setValue('services', []);
                }}
                className="flex items-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-extrabold px-6 py-3 shadow transition-all"
              >
                नया जोड़ें (Add Another)
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 text-left">
            
            {/* PART 1: Business Identity */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <Building2 className="h-4.5 w-4.5 text-[#ED1C24]" /> 1. व्यवसाय का विवरण (Business Identity)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">व्यवसाय की श्रेणी (Business Category)</label>
                  <select
                    className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] bg-transparent cursor-pointer"
                    {...register('type')}
                  >
                    <option value="Hospital">Hospital / Clinic</option>
                    <option value="Lab">Diagnostics Lab</option>
                    <option value="Pharmacy">Pharmacy / Medical Store</option>
                    <option value="IndividualClinic">Individual Clinic / Doctor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">व्यवसाय का नाम (Business Name)</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.biz ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="Enter Registered Business Name"
                    {...register('biz', { required: 'Business Name is required' })}
                  />
                  {errors.biz && <p className="text-red-500 text-xs font-bold">{errors.biz.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">अनुभव / विवरण (Experience / Details)</label>
                  <input
                    type="text"
                    className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24]"
                    placeholder="जैसे: 5 Years, Multi-speciality clinic"
                    {...register('details')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{categoryConfig[selectedType].label}</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.extraInfo ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder={categoryConfig[selectedType].placeholder}
                    {...register('extraInfo', { required: 'This field is required' })}
                  />
                  {errors.extraInfo && <p className="text-red-500 text-xs font-bold">{errors.extraInfo.message}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">{categoryConfig[selectedType].licenseLabel}</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.license ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="Reg / License / Certificate Number"
                    {...register('license', { required: 'License/Reg number is required' })}
                  />
                  {errors.license && <p className="text-red-500 text-xs font-bold">{errors.license.message}</p>}
                </div>
              </div>
            </div>

            {/* PART 2: Location Details */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <MapPin className="h-4.5 w-4.5 text-[#ED1C24]" /> 2. स्थान का विवरण (Location Details)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">पूरा पता (Full Address)</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.addr ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="Building, Street, Area"
                    {...register('addr', { required: 'Address is required' })}
                  />
                  {errors.addr && <p className="text-red-500 text-xs font-bold">{errors.addr.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">सीमाचिह्न (Landmark)</label>
                  <input
                    type="text"
                    className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase border-slate-200 focus:border-[#ED1C24]"
                    placeholder="जैसे: Near Market, etc."
                    {...register('addrExtra')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">शहर (City)</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.city ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <p className="text-red-500 text-xs font-bold">{errors.city.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">राज्य (State)</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.state ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && <p className="text-red-500 text-xs font-bold">{errors.state.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">पिनकोड (Pincode)</label>
                  <input
                    type="text"
                    maxLength={6}
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.pin ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="800001"
                    {...register('pin', {
                      required: 'Pincode is required',
                      pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' }
                    })}
                  />
                  {errors.pin && <p className="text-red-500 text-xs font-bold">{errors.pin.message}</p>}
                </div>
              </div>
            </div>

            {/* PART 3: Contact Info */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <Phone className="h-4.5 w-4.5 text-[#ED1C24]" /> 3. संपर्क सूत्र विवरण (Contact Information)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">अधिकृत व्यक्ति का नाम (Authorized Owner)</label>
                  <input
                    type="text"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.owner ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="Owner / Director Name"
                    {...register('owner', { required: 'Authorized person name is required' })}
                  />
                  {errors.owner && <p className="text-red-500 text-xs font-bold">{errors.owner.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">व्हाट्सएप मोबाइल नंबर (WhatsApp Number)</label>
                  <input
                    type="text"
                    maxLength={10}
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.phone ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="10 Digit Mobile"
                    {...register('phone', {
                      required: 'Mobile is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6-9' }
                    })}
                  />
                  {errors.phone && <p className="text-red-500 text-xs font-bold">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">ईमेल पता (Email Address)</label>
                  <input
                    type="email"
                    className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                    placeholder="name@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* PART 4: Services Offered */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <CheckSquare className="h-4.5 w-4.5 text-[#ED1C24]" /> 4. प्रदान की जाने वाली सेवाएं (Services Offered)
              </h3>
              <p className="text-xs font-semibold text-slate-500 italic">ℹ️ ये सेवाएं मरीजों को ऑनलाइन अपॉइंटमेंट बुक करते समय दिखाई देंगी।</p>

              {/* Add custom service */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-xl">
                <span className="text-xs font-bold text-slate-500 uppercase shrink-0">कस्टम सेवा जोड़ें (Custom Service)</span>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-grow border-b-2 py-1 text-slate-800 text-xs font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24] bg-transparent"
                  placeholder="जैसे: Dialysis, MRI Scan..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomService();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="bg-slate-900 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-slate-800 transition-all shrink-0 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> जोड़ें (Add)
                </button>
              </div>

              {/* Service options grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {mergedServices.map((service, index) => (
                  <label key={index} className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 hover:border-[#fdd831] bg-slate-50/50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      value={service}
                      className="h-4 w-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer"
                      {...register('services')}
                    />
                    <span className="text-xs font-bold text-slate-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white py-5 shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  सहेज रहा है (Saving Application...)
                </>
              ) : (
                'आवेदन जमा करें (Submit Partner Application)'
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

export default SwasthyaSurakshaRegister;
