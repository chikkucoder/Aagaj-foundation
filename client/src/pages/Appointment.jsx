import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { verifyHealthCardId, bookAppointment } from '../api/userApi';
import apiClient from '../api/apiClient';
import { Calendar, Stethoscope, Search, FileText, ArrowLeft, Network, ShieldCheck, HeartHandshake, PhoneCall, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Appointment = () => {
  // Navigation Tabs: 'registration' or 'network'
  const [activeTab, setActiveTab] = useState('registration');
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  
  // Verification states
  const [verifiedHealthState, setVerifiedHealthState] = useState({ ok: false, healthId: '', card: null });
  const [verifyStatus, setVerifyStatus] = useState('');
  const [verifyClass, setVerifyClass] = useState('text-slate-400');

  // Network Directory Search states
  const [netCategory, setNetCategory] = useState('');
  const [netSpec, setNetSpec] = useState('');
  const [netState, setNetState] = useState('');

  // Selected Partner Service list display
  const [selectedPartnerServices, setSelectedPartnerServices] = useState([]);

  // Generated Booking Receipt State
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Form File Attachment state
  const [cardFile, setCardFile] = useState(null);
  const [cardFileName, setCardFileName] = useState('');

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    defaultValues: {
      gender: 'Male',
      bloodGroup: 'Unknown',
      department: 'Hospital'
    }
  });

  const watchHealthId = watch('healthId');
  const watchDepartment = watch('department');
  const watchDoctor = watch('doctor'); // Ties to the hospital facility business name

  // Reset state and district when department changes
  useEffect(() => {
    setSelectedState('');
    setSelectedDistrict('');
  }, [watchDepartment]);

  // Reset district when state changes
  useEffect(() => {
    setSelectedDistrict('');
  }, [selectedState]);

  // Fetch partners list on mount
  const fetchPartnersList = async () => {
    try {
      const res = await apiClient.get('/api/swasthya/partners');
      if (res.data?.success) {
        setPartners(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch swasthya partners', err);
    }
  };

  useEffect(() => {
    fetchPartnersList();
  }, []);

  // Sync available services when selected hospital doctor changes
  useEffect(() => {
    if (!watchDoctor) {
      setSelectedPartnerServices([]);
      return;
    }
    const match = partners.find(p => p.businessName === watchDoctor);
    if (match && Array.isArray(match.services)) {
      setSelectedPartnerServices(match.services);
    } else {
      setSelectedPartnerServices([]);
    }
  }, [watchDoctor, partners]);

  const verifyHealthId = async () => {
    if (!watchHealthId) {
      alert('Please enter a Health ID first.');
      return;
    }

    setVerifyStatus('Verifying Health ID...');
    setVerifyClass('text-indigo-600 font-bold animate-pulse');

    try {
      const res = await verifyHealthCardId(watchHealthId);
      if (res.success && res.data) {
        setVerifiedHealthState({ ok: true, healthId: watchHealthId.toUpperCase(), card: res.data });
        setValue('name', res.data.fullName || '');
        setValue('phone', res.data.mobile || '');
        setValue('aadhar', res.data.aadhar || '');
        setValue('age', res.data.age || '');
        setValue('gender', res.data.gender || 'Male');
        setValue('bloodGroup', res.data.bloodGroup || 'Unknown');
        
        // Auto fill address
        setValue('street', res.data.address?.village || '');
        setValue('city', res.data.address?.district || '');
        setValue('pin', res.data.address?.pincode || '');

        setVerifyStatus(`Verified: ${res.data.healthId} (${res.data.fullName || 'Card Holder'})`);
        setVerifyClass('text-emerald-600 font-extrabold');
      } else {
        setVerifiedHealthState({ ok: false, healthId: '', card: null });
        setVerifyStatus(res.message || 'Verification failed. ID not found.');
        setVerifyClass('text-rose-500 font-bold');
      }
    } catch (err) {
      setVerifiedHealthState({ ok: false, healthId: '', card: null });
      setVerifyStatus('Verification error.');
      setVerifyClass('text-rose-500 font-bold');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardFile(file);
      setCardFileName(file.name);
    }
  };

  const handleBook = async (data) => {
    if (!verifiedHealthState.ok || verifiedHealthState.healthId !== data.healthId?.trim().toUpperCase()) {
      alert('Please verify a valid Health ID before booking the appointment.');
      return;
    }

    const selectedPartner = partners.find(p => p.businessName === data.doctor);
    if (!selectedPartner) {
      alert('Please select a valid tie-up hospital facility.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('gender', data.gender);
      formData.append('age', data.age);
      formData.append('aadhar', data.aadhar);
      formData.append('phone', data.phone);
      formData.append('bloodGroup', data.bloodGroup);
      formData.append('healthId', data.healthId);
      formData.append('street', data.street);
      formData.append('city', data.city);
      formData.append('pin', data.pin);
      formData.append('department', data.department);
      formData.append('doctor', data.doctor); // Maps to facility name
      formData.append('hospitalId', selectedPartner.uniqueId); // Essential for billing logs mapping
      formData.append('date', data.date);
      formData.append('message', data.message);
      if (cardFile) {
        formData.append('healthCard', cardFile);
      }

      const res = await bookAppointment(formData);
      if (res.success) {
        const generated = {
          id: `RCPT-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
          createdAt: new Date().toISOString(),
          patientName: data.name,
          healthId: data.healthId,
          phone: data.phone,
          hospital: data.doctor,
          appointmentDate: data.date,
          amount: res.data?.amount || 0,
          paymentId: res.data?.paymentId || 'N/A'
        };

        setSuccessReceipt(generated);
        
        // Trigger WhatsApp Redirect
        const waNumber = selectedPartner.contact?.whatsappNumber || '9431430464';
        const waMsg = `*AAGAJ FOUNDATION - BOOKING*\n--------------------------\n*Patient:* ${data.name.toUpperCase()}\n*Health ID:* ${data.healthId}\n*Mobile:* ${data.phone}\n*Specialization:* ${data.department}\n*Problem:* ${data.message}\n*Facility:* ${data.doctor}\n*Appt. Date:* ${data.date}\n*Address:* ${data.street}, ${data.city} - ${data.pin}`;
        
        setTimeout(() => {
          window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }, 1200);

        reset();
        setVerifiedHealthState({ ok: false, healthId: '', card: null });
        setVerifyStatus('');
        setCardFile(null);
        setCardFileName('');
      } else {
        alert(res.message || 'Failed to book appointment.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while saving booking.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Network Directory
  const getFilteredNetwork = () => {
    if (!netCategory || !netState) return [];
    return partners.filter(p => {
      const matchesCat = p.category === netCategory;
      const matchesState = p.address?.state?.toLowerCase().includes(netState.toLowerCase());
      let matchesSpec = true;
      if (netSpec) {
        const specs = Array.isArray(p.specialization) ? p.specialization : [p.specialization].filter(Boolean);
        matchesSpec = specs.includes(netSpec);
      }
      return matchesCat && matchesState && matchesSpec;
    });
  };

  const filteredNetwork = getFilteredNetwork();

  // Helper: normalize string to Title Case for display
  const toTitleCase = (str) => str
    ? str.trim().replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    : str;

  // Get unique states (title-case normalized) from partners for the selected category
  const availableStates = Array.from(
    new Set(
      partners
        .filter(p => p.category === watchDepartment)
        .map(p => toTitleCase(p.address?.state))
        .filter(Boolean)
    )
  ).sort();

  // Get unique cities/districts (title-case normalized) for the selected category and state
  const availableDistricts = Array.from(
    new Set(
      partners
        .filter(p =>
          p.category === watchDepartment &&
          (!selectedState || toTitleCase(p.address?.state) === selectedState)
        )
        .map(p => toTitleCase(p.address?.city))
        .filter(Boolean)
    )
  ).sort();

  // Filtered tie-up facilities based on category, state, and district (case-insensitive)
  const filteredFacilities = partners.filter(p => {
    const matchesCat = p.category === watchDepartment;
    const matchesState = !selectedState || toTitleCase(p.address?.state) === selectedState;
    const matchesDistrict = !selectedDistrict || toTitleCase(p.address?.city) === selectedDistrict;
    return matchesCat && matchesState && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12 px-4 sm:px-6 lg:px-8">
      {/* Back button (Hide on print) */}
      <div className="print:hidden max-w-3xl mx-auto mb-6 flex justify-between items-center mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Tab Buttons */}
        <div className="flex space-x-1 rounded-xl bg-slate-200 p-1 shadow-inner shrink-0">
          <button
            onClick={() => setActiveTab('registration')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'registration' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registration
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'network' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Network Directory
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto print:p-0">
        
        {/* --- TABS STATE A: REGISTRATION & ENROLLMENT FORM --- */}
        {activeTab === 'registration' && (
          <>
            {successReceipt ? (
              /* Print Receipt View */
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative flex flex-col justify-between font-sans">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6 receipt-header">
                  <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Logo" className="h-12 w-auto rounded-lg" />
                    <div>
                      <h2 className="text-lg font-black text-slate-900 m-0">AAGAJ FOUNDATION</h2>
                      <p className="text-rose-600 font-bold text-xs m-0">SWASTH SURAKSHA YOJNA</p>
                    </div>
                  </div>
                  <div className="border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-[10px] px-3 py-1 rounded-full uppercase">
                    No: {successReceipt.id}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-sm leading-relaxed text-slate-700 space-y-3 mb-6">
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Patient Name</span>
                    <span className="font-bold text-slate-800 col-span-2 uppercase">{successReceipt.patientName}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Health ID</span>
                    <span className="font-extrabold text-rose-600 col-span-2">{successReceipt.healthId}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Mobile</span>
                    <span className="font-bold text-slate-800 col-span-2">+91 {successReceipt.phone}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Medical Facility</span>
                    <span className="font-bold text-indigo-600 col-span-2 uppercase">{successReceipt.hospital}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Booking Date</span>
                    <span className="font-bold text-slate-800 col-span-2">{successReceipt.appointmentDate}</span>
                  </div>
                  <div className="grid grid-cols-3 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-400 col-span-1">Booking Amount</span>
                    <span className="font-black text-emerald-600 col-span-2">Rs {successReceipt.amount} (Paid)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="font-bold text-slate-400 col-span-1">Payment ID</span>
                    <span className="font-bold text-slate-800 col-span-2 select-all">{successReceipt.paymentId}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-semibold mb-6">
                  Generated: {new Date(successReceipt.createdAt).toLocaleString()}
                </div>

                <div className="flex gap-2 print:hidden border-t border-slate-100 pt-6">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-bold py-3 text-xs shadow-md cursor-pointer"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={() => setSuccessReceipt(null)}
                    className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 text-xs cursor-pointer border border-slate-200"
                  >
                    New Booking
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form view */
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl print:hidden relative">
                <img src="/logo.jpg" alt="Logo" className="absolute top-8 left-8 h-12 w-auto rounded-xl object-contain p-0.5 border border-slate-100 bg-white" />
                
                <div className="text-center pt-8 mb-8 border-b border-slate-100 pb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold px-3 py-1 text-xs uppercase mb-2 animate-pulse">
                    <ShieldCheck className="h-3.5 w-3.5" /> tie-up clinic booking
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Doctor Booking</h2>
                  <p className="text-indigo-600 font-bold text-xs uppercase mt-0.5">Swasthya Suraksha Network</p>
                </div>

                <form onSubmit={handleSubmit(handleBook)} className="space-y-6">
                  
                  {/* Health ID Verification */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                    <label className="block text-xs font-bold text-rose-600 uppercase tracking-wider">Health ID (Unique Card ID)</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        {...register('healthId', { required: 'Health ID is required to verify beneficiary status' })}
                        placeholder="MC-123456"
                        className="flex-grow rounded-xl border border-slate-250 py-2.5 px-3 text-slate-800 text-sm uppercase outline-none focus:border-[#2563eb] transition-all bg-white"
                      />
                      <button
                        type="button"
                        onClick={verifyHealthId}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shrink-0 transition-all cursor-pointer"
                      >
                        Verify Identity
                      </button>
                    </div>
                    {verifyStatus && <p className={`text-[10px] mt-1.5 ${verifyClass}`}>{verifyStatus}</p>}

                    {/* Upload card helper */}
                    <div className="mt-4 flex items-center justify-between p-3 border border-dashed border-slate-300 rounded-xl bg-white">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Option: Attach Identity Card</span>
                        <span className="text-xs font-bold text-slate-700 mt-0.5 block truncate max-w-[200px]">{cardFileName || 'No file selected'}</span>
                      </div>
                      <input
                        type="file"
                        id="cardFile"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('cardFile').click()}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer bg-white"
                      >
                        Browse File
                      </button>
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                    <h4 className="text-xs font-bold text-[#2563eb] uppercase tracking-wider mb-4 flex items-center gap-1">
                      <User className="h-4 w-4" /> Patient Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient Name</label>
                        <input
                          type="text"
                          {...register('name', { required: 'Patient Name is required' })}
                          placeholder="Autofills after verification"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                        {errors.name && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                        <input
                          type="text"
                          maxLength="3"
                          {...register('age', { required: 'Age is required' })}
                          placeholder="Age"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                        <select
                          {...register('gender')}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                        <input
                          type="text"
                          maxLength="10"
                          {...register('phone', { required: 'Mobile is required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })}
                          placeholder="Autofills after verification"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
                        <select
                          {...register('bloodGroup')}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="Unknown">Unknown</option>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aadhar (12 Digits)</label>
                        <input
                          type="text"
                          maxLength="12"
                          {...register('aadhar', { required: 'Aadhar is required', pattern: { value: /^[0-9]{12}$/, message: 'Must be 12 digits' } })}
                          placeholder="0000 0000 0000"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                    <h4 className="text-xs font-bold text-[#2563eb] uppercase tracking-wider mb-4 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Address details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Street / Village</label>
                        <input
                          type="text"
                          {...register('street', { required: 'Street is required' })}
                          placeholder="Locality / Village"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                        <input
                          type="text"
                          maxLength="6"
                          {...register('pin', { required: 'Pincode is required' })}
                          placeholder="Pincode"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">City / District / State</label>
                        <input
                          type="text"
                          {...register('city', { required: 'City is required' })}
                          placeholder="E.g. Patna, Bihar"
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tie-up Diagnostics / specializations dropdowns */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                    <h4 className="text-xs font-bold text-[#2563eb] uppercase tracking-wider mb-4 flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" /> Medical tie-up options
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialization Category</label>
                        <select
                          {...register('department')}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="Hospital">Hospital</option>
                          <option value="Pharmacy">Chemist Shop</option>
                          <option value="Lab">Diagnostics Lab / Patholab</option>
                          <option value="IndividualClinic">Individual Clinic / Doctor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select State</label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="">-- All States --</option>
                          {availableStates.map((st, idx) => (
                            <option key={idx} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select District</label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="">-- All Districts --</option>
                          {availableDistricts.map((dist, idx) => (
                            <option key={idx} value={dist}>{dist}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider text-amber-600">Tie-up Partner Clinic</label>
                        <select
                          {...register('doctor', { required: 'Please select a tie-up facility' })}
                          className="block mt-1 w-full rounded-xl border border-amber-300 py-2.5 px-3 text-slate-850 text-sm focus:border-[#2563eb] bg-white outline-none"
                        >
                          <option value="">-- Choose Partner --</option>
                          {filteredFacilities.map((f, index) => (
                            <option key={index} value={f.businessName}>{f.businessName}</option>
                          ))}
                        </select>
                        {errors.doctor && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.doctor.message}</p>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preferred Date</label>
                        <input
                          type="date"
                          {...register('date', { required: 'Preferred Date is required' })}
                          className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-white"
                        />
                        {errors.date && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.date.message}</p>}
                      </div>
                    </div>

                    {/* Display partner services */}
                    {selectedPartnerServices.length > 0 && (
                      <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-white">
                        <strong className="text-xs font-extrabold text-[#2563eb] block">✓ Available services at selected center:</strong>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {selectedPartnerServices.map((service, index) => (
                            <div key={index} className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-xs font-bold text-slate-700">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{service}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Symptoms / Diagnostics Description</label>
                    <textarea
                      rows="2"
                      {...register('message', { required: 'Please specify the symptoms / problem' })}
                      placeholder="Describe patient problems..."
                      className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-[#2563eb] outline-none bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] hover:bg-indigo-700 text-white py-4 text-base font-black tracking-wide uppercase shadow-lg shadow-indigo-500/10 cursor-pointer disabled:opacity-60 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {loading ? 'Registering Booking...' : 'BOOK TIE-UP CLINIC APPOINTMENT'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* --- TABS STATE B: DIRECTORY NETWORK VIEW --- */}
        {activeTab === 'network' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl relative print:hidden">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 mb-6">
              <Network className="h-5 w-5 text-[#2563eb]" /> Official Partner Directory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-150">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Category</label>
                <select
                  value={netCategory}
                  onChange={(e) => setNetCategory(e.target.value)}
                  className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm bg-white outline-none"
                >
                  <option value="">-- Choose Category --</option>
                  <option value="Hospital">Hospitals</option>
                  <option value="Lab">Diagnostic Labs</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="IndividualClinic">Individual Clinic / Doctor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialization Department</label>
                <select
                  value={netSpec}
                  onChange={(e) => setNetSpec(e.target.value)}
                  className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm bg-white outline-none"
                >
                  <option value="">-- Any Specialization --</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology ❤️">Cardiology ❤️</option>
                  <option value="Orthopedics 🦴">Orthopedics 🦴</option>
                  <option value="Neurology 🧠">Neurology 🧠</option>
                  <option value="Pediatrics 👶">Pediatrics 👶</option>
                  <option value="Dermatology ✨">Dermatology ✨</option>
                  <option value="Gynecology 🤰">Gynecology 🤰</option>
                  <option value="Patholab 🔬">Patholab 🔬</option>
                  <option value="Chemist Shop 💊">Chemist Shop 💊</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose State</label>
                <select
                  value={netState}
                  onChange={(e) => setNetState(e.target.value)}
                  className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm bg-white outline-none"
                >
                  <option value="">-- Choose State --</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Jharkhand">Jharkhand</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {!netCategory || !netState ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-semibold">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Please select Category and State to view verified tie-up partners.
                </div>
              ) : filteredNetwork.length === 0 ? (
                <div className="text-center py-12 text-rose-500 font-bold bg-rose-50 border border-rose-100 rounded-2xl">
                  No partners found matching the selected specialization in this state.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Partner Name</th>
                        <th className="py-3 px-4">Locality / State</th>
                        <th className="py-3 px-4 text-right">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                      {filteredNetwork.map(item => {
                        const loc = item.address?.fullAddress || `${item.address?.city || ''}, ${item.address?.state || ''}`;
                        return (
                          <tr key={item._id} className="hover:bg-amber-50/20 transition-all">
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-slate-900 block">{item.businessName}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">{item.category} ({item.uniqueId})</span>
                            </td>
                            <td className="py-4 px-4 text-xs text-slate-500">{loc}</td>
                            <td className="py-4 px-4 text-right">
                              {item.contact?.whatsappNumber && (
                                <a
                                  href={`https://wa.me/${item.contact.whatsappNumber}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 text-xs shadow"
                                >
                                  <PhoneCall className="h-3 w-3" /> Connect
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Appointment;
