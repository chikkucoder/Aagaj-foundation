import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  getHospitalAdminStats,
  getHospitalAdminHospitals,
  registerHospital,
  editHospital,
  toggleHospitalStatus,
  deleteHospital,
  generateHospitalCredentials,
  getHospitalGlobalReports,
  getHospitalBills,
  addHospitalBill,
  verifyHospitalPatient,
  getHospitalAppointments
} from '../api/userApi';
import {
  Building,
  HeartPulse,
  Coins,
  CalendarCheck,
  Search,
  Plus,
  RotateCw,
  X,
  FileSpreadsheet,
  Lock,
  Edit2,
  Trash2,
  FileText,
  UserCheck,
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  Camera,
  LogOut,
  Mail,
  User,
  Phone,
  Tag
} from 'lucide-react';

const HospitalDashboard = () => {
  const { logout, user, role } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  // --- GENERAL STATES ---
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- SUPER-ADMIN (MASTER PANEL) STATES ---
  const [adminStats, setAdminStats] = useState({ totalHospitals: 0, totalTreatments: 0, totalAppointments: 0, totalBilling: 0 });
  const [hospitalsList, setHospitalsList] = useState([]);
  const [globalReports, setGlobalReports] = useState([]);
  const [adminActiveTab, setAdminActiveTab] = useState('partners'); // 'partners', 'reports'
  
  // Modals inside Admin
  const [showRegModal, setShowRegModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false);
  
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [specInput, setSpecInput] = useState('');

  // --- HOSPITAL-PARTNER STATES ---
  const [partnerStats, setPartnerStats] = useState({ totalBills: 0, totalAmount: 0, apptsCount: 0 });
  const [partnerBills, setPartnerBills] = useState([]);
  const [partnerAppts, setPartnerAppts] = useState([]);
  const [partnerActiveTab, setPartnerActiveTab] = useState('bills'); // 'bills', 'appointments'
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [verifyCardStatus, setVerifyCardStatus] = useState('');
  const [verifyCardClass, setVerifyCardClass] = useState('text-slate-400');
  const [uploadedBillPhoto, setUploadedBillPhoto] = useState(null);

  // Search Filter Terms
  const [searchTerm, setSearchTerm] = useState('');

  // --- REACT HOOK FORMS ---
  const { register: regHosp, handleSubmit: handleRegHospSubmit, reset: resetRegForm } = useForm();
  const { register: regEditHosp, handleSubmit: handleEditHospSubmit, setValue: setEditValue } = useForm();
  const { register: regCreds, handleSubmit: handleCredsSubmit, reset: resetCredsForm } = useForm();
  const { register: regBill, handleSubmit: handleBillSubmit, setValue: setBillValue, watch: watchBill, reset: resetBillForm } = useForm();

  const watchHealthId = watchBill('healthId');

  // Fetch Master Admin Details
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, hospRes, repRes] = await Promise.all([
        getHospitalAdminStats().catch(() => ({ stats: { totalHospitals: 0, totalTreatments: 0, totalAppointments: 0, totalBilling: 0 } })),
        getHospitalAdminHospitals().catch(() => ({ data: [] })),
        getHospitalGlobalReports().catch(() => ({ data: [] }))
      ]);

      if (statsRes.success) setAdminStats(statsRes.stats);
      setHospitalsList(hospRes.success ? hospRes.data : []);
      setGlobalReports(repRes.success ? repRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Individual Partner Details
  const fetchPartnerData = async () => {
    setLoading(true);
    const hospId = sessionStorage.getItem('loggedInHospitalId') || user?.uniqueId;
    if (!hospId) {
      setErrorMsg('Hospital partner ID not found in session.');
      setLoading(false);
      return;
    }

    try {
      const [billsRes, apptsRes] = await Promise.all([
        getHospitalBills(hospId).catch(() => ({ data: [] })),
        getHospitalAppointments(hospId).catch(() => ({ data: [] }))
      ]);

      const bills = billsRes.success ? billsRes.data : [];
      const appts = apptsRes.success ? apptsRes.data : [];

      setPartnerBills(bills);
      setPartnerAppts(appts);

      const totalAmt = bills.reduce((sum, item) => sum + item.billAmount, 0);
      setPartnerStats({
        totalBills: bills.length,
        totalAmount: totalAmt,
        apptsCount: appts.length
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection error. Failed to retrieve dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      fetchPartnerData();
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- ACTIONS FOR MASTER ADMIN ---
  const onRegisterHospital = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        biz: data.businessName,
        license: data.licenseNumber,
        specialization: specializations,
        owner: data.ownerName,
        phone: data.whatsappNumber,
        city: data.city,
        state: data.state,
        pin: data.pincode,
        email: data.email,
        hashPass: data.password
      };

      const res = await registerHospital(payload);
      if (res.success) {
        setSuccessMsg('Hospital registered successfully!');
        setShowRegModal(false);
        resetRegForm();
        setSpecializations([]);
        fetchAdminData();
      } else {
        setErrorMsg(res.message || 'Failed to complete registration');
      }
    } catch (err) {
      setErrorMsg('Server error during registration.');
    }
  };

  const handleOpenEdit = (hosp) => {
    setSelectedHospital(hosp);
    setSpecializations(Array.isArray(hosp.specialization) ? hosp.specialization : [hosp.specialization].filter(Boolean));
    
    setEditValue('businessName', hosp.businessName);
    setEditValue('licenseNumber', hosp.licenseNumber);
    setEditValue('ownerName', hosp.contact?.ownerName || '');
    setEditValue('whatsappNumber', hosp.contact?.whatsappNumber || '');
    setEditValue('city', hosp.address?.city || '');
    setEditValue('state', hosp.address?.state || 'Bihar');
    setEditValue('pincode', hosp.address?.pincode || '');
    setEditValue('email', hosp.email || '');

    setShowEditModal(true);
  };

  const onUpdateHospital = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        biz: data.businessName,
        license: data.licenseNumber,
        specialization: specializations,
        owner: data.ownerName,
        phone: data.whatsappNumber,
        city: data.city,
        state: data.state,
        pin: data.pincode,
        email: data.email
      };

      const res = await editHospital(selectedHospital.uniqueId, payload);
      if (res.success) {
        setSuccessMsg('Hospital details updated successfully!');
        setShowEditModal(false);
        fetchAdminData();
      } else {
        setErrorMsg(res.message || 'Update failed.');
      }
    } catch (err) {
      setErrorMsg('Server error while saving.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleHospitalStatus(id);
      if (res.success) fetchAdminData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteHospital = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This removes all patient bills and records.`)) return;
    try {
      const res = await deleteHospital(id);
      if (res.success) {
        alert('Hospital successfully removed.');
        fetchAdminData();
      }
    } catch (err) {
      alert('Server error.');
    }
  };

  const handleOpenCreds = (hosp) => {
    setSelectedHospital(hosp);
    setShowCredsModal(true);
  };

  const onGenerateCreds = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await generateHospitalCredentials({
        uniqueId: selectedHospital.uniqueId,
        email: data.email,
        password: data.password
      });
      if (res.success) {
        setSuccessMsg('Access credentials generated successfully!');
        setShowCredsModal(false);
        resetCredsForm();
        fetchAdminData();
      } else {
        setErrorMsg(res.message || 'Credential generation failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  const addSpecializationTag = () => {
    if (specInput.trim() && !specializations.includes(specInput.trim())) {
      setSpecializations([...specializations, specInput.trim()]);
      setSpecInput('');
    }
  };

  const removeSpecializationTag = (tag) => {
    setSpecializations(specializations.filter(t => t !== tag));
  };

  // --- ACTIONS FOR HOSPITAL PARTNER ---
  const handleVerifyPatient = async () => {
    const healthId = watchHealthId;
    if (!healthId) {
      alert('Please enter a Health Card ID first!');
      return;
    }

    setVerifyCardStatus('Searching database...');
    setVerifyCardClass('text-indigo-600 font-bold animate-pulse');

    try {
      const res = await verifyHospitalPatient(healthId);
      if (res.success) {
        setBillValue('patientName', res.data.name);
        setBillValue('patientMobile', res.data.mobile);
        setVerifyCardStatus('Verified! Patient details auto-filled.');
        setVerifyCardClass('text-emerald-600 font-extrabold');
      } else {
        setVerifyCardStatus(res.message || 'Patient Health Card ID not found.');
        setVerifyCardClass('text-rose-500 font-bold');
      }
    } catch (err) {
      setVerifyCardStatus('Connection search failed.');
      setVerifyCardClass('text-rose-500 font-bold');
    }
  };

  const handleBillPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedBillPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onAddBillSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    const hospId = sessionStorage.getItem('loggedInHospitalId') || user?.uniqueId;
    try {
      const payload = {
        hospitalId: hospId,
        healthId: data.healthId || 'General',
        patientName: data.patientName,
        patientMobile: data.patientMobile,
        treatmentDetails: data.treatmentDetails,
        billAmount: Number(data.billAmount),
        status: data.billStatus,
        billPhoto: uploadedBillPhoto
      };

      const res = await addHospitalBill(payload);
      if (res.success) {
        setSuccessMsg('Treatment bill registered successfully!');
        setShowAddBillModal(false);
        resetBillForm();
        setUploadedBillPhoto(null);
        setVerifyCardStatus('');
        fetchPartnerData();
      } else {
        setErrorMsg(res.message || 'Failed to generate bill.');
      }
    } catch (err) {
      setErrorMsg('Server connection error while generating bill.');
    }
  };

  // Filter Tables helper
  const getFilteredList = () => {
    const term = searchTerm.toLowerCase();
    if (isAdmin) {
      if (adminActiveTab === 'partners') {
        return hospitalsList.filter(h => (
          h.businessName?.toLowerCase().includes(term) || h.uniqueId?.toLowerCase().includes(term) || h.email?.toLowerCase().includes(term)
        ));
      } else {
        return globalReports.filter(r => (
          r.patientName?.toLowerCase().includes(term) || r.hospitalName?.toLowerCase().includes(term) || r.healthId?.toLowerCase().includes(term)
        ));
      }
    } else {
      if (partnerActiveTab === 'bills') {
        return partnerBills.filter(b => (
          b.patientName?.toLowerCase().includes(term) || b.healthId?.toLowerCase().includes(term) || b.billId?.toLowerCase().includes(term)
        ));
      } else {
        return partnerAppts.filter(a => (
          a.name?.toLowerCase().includes(term) || a.healthId?.toLowerCase().includes(term) || a.department?.toLowerCase().includes(term)
        ));
      }
    }
  };

  const filteredData = getFilteredList();

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-12">
      {/* Top sticky Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-lg bg-white p-0.5" />
              <div>
                <span className="text-lg font-bold tracking-tight text-white block sm:inline">Aagaj Health Network</span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded bg-rose-500 text-[10px] font-bold text-white uppercase">
                  {isAdmin ? 'Master System' : 'Partner Portal'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs text-slate-400 font-medium">{isAdmin ? 'Logged in as Owner' : 'Logged in as Partner'}</p>
                <p className="text-sm font-semibold text-rose-500">{isAdmin ? 'Super Admin' : (sessionStorage.getItem('loggedInUser') || 'Hospital Partner')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-600 border border-rose-100 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-600 border border-emerald-100 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- 🟢 VIEW A: SUPER ADMIN MASTER CONTROLLER --- */}
        {isAdmin ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Master Hospital Controller</h2>
                <p className="text-slate-500 text-sm font-medium">Register medical facilities, track treatments global ledger, and review patient billing.</p>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={fetchAdminData}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <RotateCw className="h-4 w-4" /> Sync Ledgers
                </button>
                <button
                  onClick={() => {
                    setSpecializations([]);
                    setShowRegModal(true);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md px-4 py-2.5 text-sm font-bold transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Register Partner
                </button>
                <Link
                  to="/admin/dashboard"
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md px-4 py-2.5 text-sm font-bold transition-all text-center"
                >
                  <User className="h-4 w-4" /> Employee Panel
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Partners</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{adminStats.totalHospitals}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Building className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Treatments</span>
                  <h3 className="text-2xl font-black text-amber-500 mt-1">{adminStats.totalTreatments}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Appointments</span>
                  <h3 className="text-2xl font-black text-rose-500 mt-1">{adminStats.totalAppointments}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shrink-0">
                  <CalendarCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Collections</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{adminStats.totalBilling?.toLocaleString()}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Admin Subtabs Table Display Panel */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
              
              {/* Tab Selector + Search Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => { setAdminActiveTab('partners'); setSearchTerm(''); }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      adminActiveTab === 'partners' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Medical Partners Management
                  </button>
                  <button
                    onClick={() => { setAdminActiveTab('reports'); setSearchTerm(''); }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      adminActiveTab === 'reports' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Global Patient Billing Ledgers
                  </button>
                </div>
                
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search medical center, patient or ID..."
                    className="w-full sm:w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-rose-500 transition-all bg-slate-50"
                  />
                </div>
              </div>

              {/* Dynamic Lists */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-600 border-t-transparent"></div>
                  <p className="text-slate-500 font-semibold text-xs">Aggregating global health datasets...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {adminActiveTab === 'partners' ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Center ID</th>
                          <th className="py-3 px-4">Business / Hospital Name</th>
                          <th className="py-3 px-4">Specialization</th>
                          <th className="py-3 px-4">Treatments</th>
                          <th className="py-3 px-4">Appointments</th>
                          <th className="py-3 px-4">Collections</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Access Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">No registered medical partners matching search.</td>
                          </tr>
                        ) : (
                          filteredData.map(h => (
                            <tr key={h._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 font-black text-rose-500">{h.uniqueId}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{h.businessName}</td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap gap-1 max-w-[180px]">
                                  {Array.isArray(h.specialization) ? h.specialization.map((s, idx) => (
                                    <span key={idx} className="bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border border-indigo-100">
                                      {s}
                                    </span>
                                  )) : <span className="text-slate-400 italic">General</span>}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-semibold">{h.treatmentCount} Patients</td>
                              <td className="py-3 px-4 font-semibold">{h.appointmentCount} Bookings</td>
                              <td className="py-3 px-4 font-bold text-slate-900">₹{h.totalBilling?.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleStatus(h.uniqueId)}
                                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all ${
                                    h.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {h.isActive ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(h)}
                                    className="rounded p-1.5 border border-slate-200 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer"
                                    title="Edit Center Details"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHospital(h.uniqueId, h.businessName)}
                                    className="rounded p-1.5 border border-slate-200 hover:text-rose-600 hover:bg-slate-50 cursor-pointer"
                                    title="Remove Facility"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenCreds(h)}
                                    className={`rounded px-2 py-1 text-[10px] font-bold border cursor-pointer flex items-center gap-0.5 ${
                                      h.hasCredentials ? 'bg-slate-900 text-white hover:bg-slate-800' : 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                    }`}
                                  >
                                    <Lock className="h-3 w-3" /> {h.hasCredentials ? 'Manage' : 'Assign'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Txn Date</th>
                          <th className="py-3 px-4">Hospital Facility</th>
                          <th className="py-3 px-4">Patient details & Health ID</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Diagnostics/Treatment</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Receipt Image</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">No patient billing records returned across the network.</td>
                          </tr>
                        ) : (
                          filteredData.map(r => (
                            <tr key={r._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400">{new Date(r.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-black text-rose-500">{r.hospitalName}</td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900">{r.patientName}</p>
                                <p className="text-[10px] text-indigo-600 font-black mt-0.5">Health ID: {r.healthId || 'General'}</p>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{r.patientMobile}</td>
                              <td className="py-3 px-4 max-w-xs truncate text-slate-400">{r.treatmentDetails}</td>
                              <td className="py-3 px-4 font-black text-slate-900">₹{r.billAmount}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                  r.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {r.billPhoto ? (
                                  <a
                                    href={r.billPhoto}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded p-1 border border-slate-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </a>
                                ) : <span className="text-slate-400 font-semibold italic text-[10px]">No Photo</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>
          </>
        ) : (
          /* --- 🏥 VIEW B: PARTNER CLINIC/HOSPITAL DASHBOARD --- */
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Operations</span>
                <h2 className="text-2xl font-black text-slate-800">Partner Facility Dashboard</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Generate treatment billing logs and verify beneficiary identities in real time.</p>
              </div>
              <button
                onClick={() => {
                  resetBillForm();
                  setVerifyCardStatus('');
                  setUploadedBillPhoto(null);
                  setShowAddBillModal(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-5 py-3 text-sm font-bold shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" /> Add Patient Bill
              </button>
            </div>

            {/* Individual Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Generated Bills</span>
                <h2 className="text-3xl font-black text-[#ED1C24] mt-2">{partnerStats.totalBills}</h2>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Collections</span>
                <h2 className="text-3xl font-black text-emerald-600 mt-2">₹{partnerStats.totalAmount?.toLocaleString()}</h2>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booked Bookings</span>
                <h2 className="text-3xl font-black text-blue-600 mt-2">{partnerStats.apptsCount}</h2>
              </div>
            </div>

            {/* Individual Partner Tabs Display */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => { setPartnerActiveTab('bills'); setSearchTerm(''); }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      partnerActiveTab === 'bills' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Treatments & Patient Billing
                  </button>
                  <button
                    onClick={() => { setPartnerActiveTab('appointments'); setSearchTerm(''); }}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      partnerActiveTab === 'appointments' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Clinic Appointments
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, health card or bill ID..."
                    className="w-full sm:w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-red-500 transition-all bg-slate-50"
                  />
                </div>
              </div>

              {/* Data Table */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ED1C24] border-t-transparent"></div>
                  <p className="text-slate-500 font-semibold text-xs">Accessing partner databases...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {partnerActiveTab === 'bills' ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Bill ID</th>
                          <th className="py-3 px-4">Health Card ID</th>
                          <th className="py-3 px-4">Patient Full Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Diagnostics/Treatment</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-center">Receipt Image</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-medium">No treatments have been billed yet.</td>
                          </tr>
                        ) : (
                          filteredData.map(b => (
                            <tr key={b._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400 font-medium max-w-[100px] truncate">{b.billId}</td>
                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 font-black uppercase text-[9px]">
                                  {b.healthId || 'General'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">{b.patientName}</td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{b.patientMobile}</td>
                              <td className="py-3 px-4 max-w-xs truncate text-slate-400">{b.treatmentDetails}</td>
                              <td className="py-3 px-4 font-black text-slate-900">₹{b.billAmount}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                                  b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {b.billPhoto ? (
                                  <a
                                    href={b.billPhoto}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded p-1 border border-slate-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-300"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </a>
                                ) : <span className="text-slate-400 font-semibold italic text-[10px]">No Photo</span>}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Booked Date</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Health Card ID</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Specialization Category</th>
                          <th className="py-3 px-4">Problem</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">No clinic appointments booked for this location.</td>
                          </tr>
                        ) : (
                          filteredData.map(a => (
                            <tr key={a._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400 font-bold">{a.date}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{a.name}</td>
                              <td className="py-3 px-4 font-black text-rose-600">{a.healthId}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                  a.appointmentType === 'teleconsultation' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {a.appointmentType === 'teleconsultation' ? 'Teleconsultation' : 'Physical Visit'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-indigo-600">{a.department}</td>
                              <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{a.message}</td>
                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-black uppercase">
                                  {a.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* ==================================================================== */}
      {/*                       MODALS OVERLAYS SECTION                        */}
      {/* ==================================================================== */}

      {/* --- MODAL 1: REGISTER HOSPITAL PARTNER --- */}
      {showRegModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-base font-extrabold text-slate-800">Register New Hospital Facility</h3>
              <button onClick={() => setShowRegModal(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleRegHospSubmit(onRegisterHospital)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Business Name</label>
                  <input type="text" {...regHosp('businessName', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Aagaj Hospital" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">License Number</label>
                  <input type="text" {...regHosp('licenseNumber', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="LIC/2026/01" />
                </div>
                
                {/* Specializations Category Dynamic Tag Input */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization Departments</label>
                  <div className="flex flex-wrap gap-2 mt-2 p-2 border border-slate-200 rounded-xl bg-slate-50 min-h-[44px] items-center">
                    {specializations.map((spec, index) => (
                      <span key={index} className="bg-rose-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                        {spec}
                        <button type="button" onClick={() => removeSpecializationTag(spec)} className="hover:text-amber-200 text-xs font-black">×</button>
                      </span>
                    ))}
                    <div className="flex gap-2 flex-grow">
                      <input
                        type="text"
                        value={specInput}
                        onChange={(e) => setSpecInput(e.target.value)}
                        placeholder="Add categories (e.g. ICU, Dental)..."
                        className="flex-grow bg-transparent outline-none border-none py-1 text-sm text-slate-800"
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSpecializationTag(); } }}
                      />
                      <button type="button" onClick={addSpecializationTag} className="bg-slate-900 text-white rounded-lg px-2 py-1 text-xs font-bold">Add</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name</label>
                  <input type="text" {...regHosp('ownerName', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                  <input type="text" {...regHosp('whatsappNumber', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="10-digit number" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input type="text" {...regHosp('city', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Patna" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input type="text" {...regHosp('state')} defaultValue="Bihar" className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                    <input type="text" {...regHosp('pincode', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="800001" />
                  </div>
                </div>

                <div className="sm:col-span-2 h-px bg-slate-100 my-2"></div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600">Secure Login ID (Email)</label>
                  <input type="email" {...regHosp('email', { required: true })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="hospital@foundation.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600">Access Password</label>
                  <input type="text" {...regHosp('password', { required: true })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Minimum 6 characters" />
                </div>
              </div>

              <button type="submit" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-6 text-sm shadow-md transition-all">
                COMPLETE PARTNER REGISTRATION
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT HOSPITAL PARTNER --- */}
      {showEditModal && isAdmin && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-base font-extrabold text-slate-800">Edit Hospital Facility</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditHospSubmit(onUpdateHospital)} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Business Name</label>
                  <input type="text" {...regEditHosp('businessName', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">License Number</label>
                  <input type="text" {...regEditHosp('licenseNumber', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>
                
                {/* Edit Specializations */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Specialization Departments</label>
                  <div className="flex flex-wrap gap-2 mt-2 p-2 border border-slate-200 rounded-xl bg-slate-50 min-h-[44px] items-center">
                    {specializations.map((spec, index) => (
                      <span key={index} className="bg-rose-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                        {spec}
                        <button type="button" onClick={() => removeSpecializationTag(spec)} className="hover:text-amber-200 text-xs font-black">×</button>
                      </span>
                    ))}
                    <div className="flex gap-2 flex-grow">
                      <input
                        type="text"
                        value={specInput}
                        onChange={(e) => setSpecInput(e.target.value)}
                        placeholder="Add categories..."
                        className="flex-grow bg-transparent outline-none border-none py-1 text-sm text-slate-800"
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addSpecializationTag(); } }}
                      />
                      <button type="button" onClick={addSpecializationTag} className="bg-slate-900 text-white rounded-lg px-2 py-1 text-xs font-bold">Add</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Owner Name</label>
                  <input type="text" {...regEditHosp('ownerName', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                  <input type="text" {...regEditHosp('whatsappNumber', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input type="text" {...regEditHosp('city', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input type="text" {...regEditHosp('state')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                    <input type="text" {...regEditHosp('pincode', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600">Login Username (Email)</label>
                  <input type="email" {...regEditHosp('email', { required: true })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 mt-6 text-sm shadow-md transition-all">
                UPDATE PARTNER RECORD
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ASSIGN HOSPITAL PARTNER LOGIN --- */}
      {showCredsModal && isAdmin && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-base font-extrabold text-slate-800">Assign Access Credentials</h3>
              <button onClick={() => setShowCredsModal(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCredsSubmit(onGenerateCreds)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Business Name</label>
                <input type="text" value={selectedHospital.businessName} readOnly className="block mt-1 w-full rounded-xl border-none bg-slate-50 py-2.5 px-3 text-slate-600 text-sm font-semibold outline-none cursor-not-allowed" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600">Assign Login Username (Email)</label>
                <input type="email" defaultValue={selectedHospital.email} {...regCreds('email', { required: true })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="facility@foundation.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-rose-600 font-black">Set Secure Password</label>
                <input type="text" {...regCreds('password', { required: true, minLength: 6 })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Minimum 6 characters" />
              </div>

              <button type="submit" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-6 text-sm shadow-md transition-all">
                GRANT SECURE ACCESS CREDENTIALS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD PATIENT TREATMENT BILL (HOSPITAL PARTNER VIEW) --- */}
      {showAddBillModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-base font-extrabold text-slate-800">Generate Patient Bill</h3>
              <button onClick={() => setShowAddBillModal(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleBillSubmit(onAddBillSubmit)} className="p-6 space-y-4">
              
              {/* Health ID Checkbox Input group */}
              <div>
                <label className="block text-xs font-bold text-rose-600 uppercase tracking-wider">Patient Health Card ID (Unique)</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    {...regBill('healthId')}
                    placeholder="E.g. MC-123456"
                    className="flex-grow rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm uppercase outline-none focus:border-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPatient}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shrink-0 transition-all cursor-pointer"
                  >
                    Verify Card ID
                  </button>
                </div>
                {verifyCardStatus && <p className={`text-[10px] mt-1.5 ${verifyCardClass}`}>{verifyCardStatus}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Full Name</label>
                <input type="text" {...regBill('patientName', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="Verification will autofill this" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <input type="text" {...regBill('patientMobile', { required: true, pattern: /^[0-9]{10}$/ })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="10-digit number" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Treatment / Diagnostic Details</label>
                <textarea rows="2" {...regBill('treatmentDetails', { required: true })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="E.g. Diagnostic Fever Test, Medicine..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Bill Amount (₹)</label>
                  <input type="number" {...regBill('billAmount', { required: true, min: 1 })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 outline-none" placeholder="500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                  <select {...regBill('billStatus')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2.5 px-3 text-slate-800 text-sm focus:border-rose-500 bg-white outline-none">
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Base64 Bill File Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Upload Bill Photo / Invoice</label>
                <div className="mt-1 flex items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 p-4 rounded-xl relative transition-all hover:bg-slate-100">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBillPhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedBillPhoto ? (
                    <div className="text-center">
                      <img src={uploadedBillPhoto} alt="Invoice preview" className="max-h-[120px] rounded-lg shadow-sm border border-slate-200 mx-auto" />
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Click/drag to change receipt</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Camera className="h-6 w-6 mx-auto mb-1.5" />
                      <span className="text-xs font-bold block uppercase tracking-wide">Select receipt image</span>
                      <span className="text-[10px] block mt-0.5">JPEG, JPG, PNG up to 2MB</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-bold py-3 mt-6 text-sm shadow-md transition-all">
                GENERATE TREATMENT LOG
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;
