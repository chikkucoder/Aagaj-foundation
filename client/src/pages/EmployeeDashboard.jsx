import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { getEmployeeProfile, getAllApplicants, getAllBeneficiaries } from '../api/userApi';
import apiClient from '../api/apiClient';
import {
  User,
  LogOut,
  IdCard,
  Building,
  MapPin,
  Mail,
  Phone,
  Activity,
  Heart,
  Scissors,
  Users,
  Briefcase,
  AlertCircle,
  Menu,
  ChevronDown,
  Printer,
  Download,
  X,
  Search,
  RotateCw,
  Plus,
  FileText,
  CreditCard,
  Building2,
  ShieldAlert,
  ArrowLeft,
  UserCheck,
  Handshake,
  Store,
  Grid,
  ExternalLink,
  CalendarCheck
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Navigation Sidebar State
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, workLinks, healthcards, silayi, swarojgaar, ngoJobs
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  // Unified Data Stores
  const [allApplicants, setAllApplicants] = useState([]);
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const [allHealthCards, setAllHealthCards] = useState([]);

  // Selected Records for Modals
  const [selectedHealthCard, setSelectedHealthCard] = useState(null);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const healthCardRef = useRef(null);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Fetch all employee profile information and tables
  const syncDashboardData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');

    const email = sessionStorage.getItem('loggedInUserEmail');
    if (!email) {
      setError('Unauthorized access. Session not found.');
      setLoading(false);
      return;
    }

    try {
      const [profRes, appRes, benRes, hcRes] = await Promise.all([
        getEmployeeProfile(email).catch(err => ({ success: false, message: 'Profile load failed' })),
        getAllApplicants().catch(err => []),
        getAllBeneficiaries().catch(err => []),
        apiClient.get('/api/healthcard/all').catch(err => ({ data: { success: false, data: [] } }))
      ]);

      if (profRes.success) {
        setProfile(profRes.profile);
        setStats(profRes.stats);
      } else {
        setError(profRes.message || 'Unable to retrieve employee profile.');
      }

      setAllApplicants(Array.isArray(appRes) ? appRes : []);
      setAllBeneficiaries(Array.isArray(benRes) ? benRes : []);
      setAllHealthCards(hcRes.data?.success ? hcRes.data.data : []);

    } catch (err) {
      console.error('Failed to synchronize employee data', err);
      setError('Server connection error. Failed to refresh logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncDashboardData(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resolveAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const normalizedPath = assetPath.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) return normalizedPath;
    if (normalizedPath.startsWith('/')) return `${baseUrl}${normalizedPath}`;
    return `${baseUrl}/${normalizedPath}`;
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

  // Helper to resolve profile's registered logs based on District Coordinator roles
  const getFilteredData = () => {
    if (!profile) return [];
    const term = searchTerm.toLowerCase();
    const empEmail = (profile.email || '').toLowerCase().trim();
    const empName = (profile.fullName || '').toLowerCase().trim();

    // Email/Name matching helper
    const isRegisteredByMe = (regBy) => {
      if (!regBy) return false;
      const cleanRegBy = regBy.toLowerCase().trim();
      return cleanRegBy === empEmail || cleanRegBy === empName;
    };

    const role = profile.role || 'Employee';
    const isDistrictCoordinator = role.toLowerCase() === 'district coordinator';
    const districtVal = (profile.district || '').toLowerCase().trim();

    const isMatchForHC = (item) => {
      if (isDistrictCoordinator && districtVal) {
        return (item.address?.district || '').toLowerCase().trim() === districtVal;
      }
      return isRegisteredByMe(item.registeredBy);
    };

    const isMatchForSilayi = (item) => {
      return isRegisteredByMe(item.registeredBy);
    };

    const isMatchForSwarojgaar = (item) => {
      if (isDistrictCoordinator && districtVal) {
        return (item.location?.district || '').toLowerCase().trim() === districtVal;
      }
      return isRegisteredByMe(item.registeredBy);
    };

    const isMatchForNgo = (item) => {
      if (isDistrictCoordinator && districtVal) {
        return (item.district || '').toLowerCase().trim() === districtVal;
      }
      return isRegisteredByMe(item.registeredBy);
    };

    switch (currentView) {
      case 'healthcards':
        return allHealthCards.filter(c => {
          const isMine = isMatchForHC(c);
          const matchesSearch = c.fullName?.toLowerCase().includes(term) || c.mobile?.includes(term) || c.healthId?.toLowerCase().includes(term) || c.aadhar?.includes(term);
          return isMine && matchesSearch;
        });

      case 'silayi':
        return allBeneficiaries.filter(b => {
          const isSilayi = b.yojanaName === 'Mahila Silai Prasikshan Yojana';
          const isMine = isMatchForSilayi(b);
          const matchesSearch = b.name?.toLowerCase().includes(term) || b.mobileNumber?.includes(term) || b.aadharNumber?.includes(term) || b.serialNumber?.toLowerCase().includes(term);
          return isSilayi && isMine && matchesSearch;
        });

      case 'swarojgaar':
        return allBeneficiaries.filter(b => {
          const isSwarojgaar = b.yojanaName === 'Mahila Swarojgaar Yojana';
          const isMine = isMatchForSwarojgaar(b);
          const matchesSearch = b.name?.toLowerCase().includes(term) || b.mobileNumber?.includes(term) || b.address?.toLowerCase().includes(term);
          return isSwarojgaar && isMine && matchesSearch;
        });

      case 'ngoJobs':
        return allApplicants.filter(a => {
          const isNgo = a.job_category === 'NGO';
          const isMine = isMatchForNgo(a);
          const matchesSearch = a.fullName?.toLowerCase().includes(term) || a.mobile?.includes(term) || a.aadhar?.includes(term) || a.uniqueId?.toString().includes(term);
          return isNgo && isMine && matchesSearch;
        });

      default:
        return [];
    }
  };

  const handleViewInvoice = (item, type) => {
    let amountVal = 0;
    let scheme = '';
    
    if (type === 'silayi') {
      amountVal = item.registrationFee || 799;
      scheme = 'Silayi Yojana';
    } else if (type === 'swarojgaar') {
      amountVal = item.registrationFee || 100;
      scheme = 'Swarojgaar Group';
    } else if (type === 'ngo') {
      amountVal = item.amount || 499;
      scheme = `NGO Job (${item.roleApplied || item.applyForPost})`;
    }

    setSelectedPayment({
      beneficiaryName: item.name || item.fullName || item.groupName || 'Beneficiary',
      beneficiaryPhone: item.mobileNumber || item.mobile || 'N/A',
      timestamp: item.createdAt || item.date || new Date(),
      paymentId: item.paymentId || 'N/A',
      orderId: item.orderId || 'N/A',
      schemeType: scheme,
      amount: amountVal
    });
    setShowReceiptModal(true);
  };

  const filteredList = getFilteredData();
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Employee Profile Dashboard';
      case 'workLinks': return 'Work Control Panel';
      case 'healthcards': return 'My Issued Identity Health Cards';
      case 'silayi': return 'My Mahila Silayi Yojana Registrants';
      case 'swarojgaar': return 'My Mahila Swarojgaar Group Submissions';
      case 'ngoJobs': return 'My NGO Coordinator Applicants Logs';
      default: return 'Aagaj Agent Desk';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#051630]/5">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ED1C24] border-t-transparent"></div>
          <p className="font-semibold text-slate-600">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdf5] px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <AlertCircle className="h-14 w-14 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-slate-800">Session Error</h3>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
          <button
            onClick={handleLogout}
            className="w-full mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-sm font-bold shadow-md cursor-pointer transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const role = profile?.role || 'Employee';
  const isDistrictCoordinator = role.toLowerCase() === 'district coordinator';
  const photo = profile?.photoPath ? resolveAssetUrl(profile.photoPath) : '/logo.jpg';

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-row overflow-x-hidden">
      
      {/* Dynamic Printing Style CSS Section */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0px;
            margin: 0px;
          }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR PANEL (PERSISTENT DESKTOP, COLLAPSIBLE MOBILE) --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#051630] text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800 bg-[#030e20]">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Aagaj Logo" className="h-9 w-auto rounded-md bg-white p-0.5" />
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">Aagaj Agent</h1>
              <span className="text-[9px] text-[#fdd831] font-bold uppercase tracking-widest bg-amber-400/10 px-1 py-0.5 rounded">Console Desk</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto">
          
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
            <button
              onClick={() => { setCurrentView('dashboard'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <User className="h-4.5 w-4.5" /> My Profile
            </button>
            <button
              onClick={() => { setCurrentView('workLinks'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'workLinks' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Grid className="h-4.5 w-4.5" /> Work Control Panel
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">My Enrolment Logs</p>
            <button
              onClick={() => { setCurrentView('healthcards'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'healthcards' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <IdCard className="h-4.5 w-4.5" /> Issued Health Cards
            </button>
            <button
              onClick={() => { setCurrentView('silayi'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'silayi' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Scissors className="h-4.5 w-4.5" /> Silayi Enrolments
            </button>
            <button
              onClick={() => { setCurrentView('swarojgaar'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'swarojgaar' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Store className="h-4.5 w-4.5" /> Swarojgaar Groups
            </button>
            <button
              onClick={() => { setCurrentView('ngoJobs'); setCurrentPage(1); setSearchTerm(''); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'ngoJobs' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Handshake className="h-4.5 w-4.5" /> NGO Job Submissions
            </button>
          </div>

        </nav>

        {/* Sidebar Footer Profiles */}
        <div className="p-4 border-t border-slate-800 bg-[#030e20]">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={photo}
              alt="Avatar"
              className="h-8 w-8 rounded-full border border-slate-700 object-cover bg-white"
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white leading-none truncate">{profile?.fullName || 'Active Agent'}</p>
              <span className="text-[9px] text-[#fdd831] font-bold uppercase tracking-wide truncate block mt-1">{role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600/10 border border-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white py-2 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit Session
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col overflow-x-hidden">
        
        {/* Dynamic Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 border border-slate-200">
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{getViewTitle()}</h2>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden sm:block">Aagaj Foundation Social Welfare Trust</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => syncDashboardData(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Refresh Desk</span>
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-6">

          {/* ======================================================== */}
          {/*   1. MY PROFILE & DASHBOARD MODULE                       */}
          {/* ======================================================== */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Performance counts grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Health Cards Issued</span>
                    <h3 className="mt-2 text-2xl font-black text-rose-600">{stats?.healthCardCount || 0}</h3>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">{isDistrictCoordinator ? 'District Total' : 'Registered By Me'}</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center">
                    <IdCard className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Silayi Enrolments</span>
                    <h3 className="mt-2 text-2xl font-black text-[#e83e8c]">{stats?.silayiCount || 0}</h3>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">Registered By Me</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-pink-50 text-[#e83e8c] border border-pink-100 flex items-center justify-center">
                    <Scissors className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Swarojgaar Groups</span>
                    <h3 className="mt-2 text-2xl font-black text-[#20c997]">{stats?.swarojgaarCount || 0}</h3>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">{isDistrictCoordinator ? 'District Total' : 'Registered By Me'}</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-teal-50 text-[#20c997] border border-teal-100 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NGO Job Submissions</span>
                    <h3 className="mt-2 text-2xl font-black text-blue-600">{stats?.ngoApplicationCount || 0}</h3>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">{isDistrictCoordinator ? 'District Total' : 'Registered By Me'}</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center">
                    <Handshake className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Detailed agent profile information card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl p-4 sm:p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]"></span>
                    Agent Credentials Profile
                  </h4>
                  <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wide">
                    {profile?.source || 'Agent'}
                  </span>
                </div>

                {/* Avatar and title */}
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 border-b border-slate-100 pb-6 mb-6">
                  <img
                    src={photo}
                    alt="Agent Avatar"
                    className="h-20 w-20 rounded-full border-4 border-slate-50 object-cover bg-white p-0.5 shadow-md shadow-slate-200"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Authorized Operator</span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mt-0.5">{profile?.fullName}</h3>
                    <span className="text-xs font-bold text-[#ED1C24] uppercase tracking-wide mt-1 block">{role}</span>
                  </div>
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Full Name</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.fullName || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation / Access Level</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{role}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communication Email</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">{profile?.email || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Contact Number</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.mobile || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <Building className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Place / Block</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.blockOrPlace || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Panchayat</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.panchayat || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 sm:col-span-2 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Territory District / State</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{profile?.district ? `${profile.district} / ${profile.state || 'Bihar'}` : '-'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/*   2. QUICK WORK LINKS GRID MODULE                         */}
          {/* ======================================================== */}
          {currentView === 'workLinks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
                <div className="mb-6">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    Authorized Entry Shortcuts
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Click on any welfare yojana registration panel below to directly launch its enrollment portal page.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Link 1: Health card */}
                  <Link to="/medical/healthcard" className="group bg-gradient-to-br from-white to-rose-50/20 border border-slate-100 hover:border-rose-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IdCard className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">Issue Identity Health Card</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Enroll new patient profiles under the Swasthya Suraksha Scheme and dispense digital smart identity cards.</p>
                    </div>
                  </Link>

                  {/* Link 2: Silayi Yojana */}
                  <Link to="/medical/healthcard" className="group bg-gradient-to-br from-white to-pink-50/20 border border-slate-100 hover:border-pink-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-pink-50 text-[#e83e8c] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Scissors className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-pink-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#e83e8c] transition-colors">Silayi Yojana Register</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Register local female candidates for free sewing machine training programs under Silai Prasikshan Yojana.</p>
                    </div>
                  </Link>

                  {/* Link 3: Swarojgaar Groups */}
                  <Link to="/swarojgaar/register" className="group bg-gradient-to-br from-white to-teal-50/20 border border-slate-100 hover:border-teal-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-teal-50 text-[#20c997] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#20c997] transition-colors">Swarojgaar Group Registry</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Enroll multi-member self-help working groups for small trade subsidies and self-employment business assets.</p>
                    </div>
                  </Link>

                  {/* Link 4: NGO Jobs */}
                  <Link to="/apply" className="group bg-gradient-to-br from-white to-blue-50/20 border border-slate-100 hover:border-blue-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Handshake className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">NGO Coordinator Jobs</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Register new block-level social coordinators and field recruitment agents for direct employment positions.</p>
                    </div>
                  </Link>

                  {/* Link 5: Swasthya Suraksha Partner */}
                  <Link to="/schemes/swasthya-suraksha" className="group bg-gradient-to-br from-white to-purple-50/20 border border-slate-100 hover:border-purple-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Activity className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-purple-600 transition-colors">Hospital Partner Registry</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Add regional clinics, clinical labs, or retail pharmacies to Aagaj Health Network as medical concession partners.</p>
                    </div>
                  </Link>

                  {/* Link 6: Appointments */}
                  <Link to="/medical/appointment" className="group bg-gradient-to-br from-white to-amber-50/20 border border-slate-100 hover:border-amber-100 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-48">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarCheck className="h-6 w-6" />
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">Book Doctor Appointment</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Book a subsidized doctor consultation appointment at hospital partners using verified active Patient Health IDs.</p>
                    </div>
                  </Link>

                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/*   3. LOGS VIEWS (HEALTH CARDS, SILAYI, SWAROJGAAR, NGO)   */}
          {/* ======================================================== */}
          {currentView !== 'dashboard' && currentView !== 'workLinks' && (
             <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              
               {/* Table search & title controls header */}
               <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#ED1C24]"></span>
                    Registrations List
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Showing {filteredList.length} total entries matching filters</p>
                </div>

                {/* Search query input */}
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="block w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 outline-none bg-white focus:border-[#ED1C24] transition-all"
                  />
                </div>
              </div>

              {/* Table rendering content */}
              <div className="overflow-x-auto">
                
                {paginatedList.length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold">No registered entries found in your logs</p>
                    <p className="text-xs mt-1">Try relaxing search terms or check if you registered cards under this session.</p>
                  </div>
                ) : (
                   <table className="w-full text-left border-collapse whitespace-nowrap">
                    
                    {/* Header Columns based on View */}
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        
                        {currentView === 'healthcards' && (
                          <>
                            <th className="py-4 px-6">Beneficiary Patient</th>
                            <th className="py-4 px-6">Mobile Contact</th>
                            <th className="py-4 px-6">Aadhar No.</th>
                            <th className="py-4 px-6">Age / Gender</th>
                            <th className="py-4 px-6">Health ID</th>
                            <th className="py-4 px-6">Expiry Date</th>
                            <th className="py-4 px-6">Payment</th>
                            <th className="py-4 px-6 text-center">Action</th>
                          </>
                        )}

                        {currentView === 'silayi' && (
                          <>
                            <th className="py-4 px-6">Serial</th>
                            <th className="py-4 px-6">Candidate Name</th>
                            <th className="py-4 px-6">Guardian / Husband</th>
                            <th className="py-4 px-6">Mobile Contact</th>
                            <th className="py-4 px-6">Aadhar No.</th>
                            <th className="py-4 px-6">Training Course</th>
                            <th className="py-4 px-6">Fee Paid</th>
                            <th className="py-4 px-6">Payment Status</th>
                            <th className="py-4 px-6 text-center">Receipt</th>
                          </>
                        )}

                        {currentView === 'swarojgaar' && (
                          <>
                            <th className="py-4 px-6">Group Name</th>
                            <th className="py-4 px-6">Members Count</th>
                            <th className="py-4 px-6">Village / Panchayat</th>
                            <th className="py-4 px-6">District</th>
                            <th className="py-4 px-6">Sub Division</th>
                            <th className="py-4 px-6">Fee Charged</th>
                            <th className="py-4 px-6">Payment Status</th>
                            <th className="py-4 px-6 text-center">Invoice</th>
                          </>
                        )}

                        {currentView === 'ngoJobs' && (
                          <>
                            <th className="py-4 px-6">Photo</th>
                            <th className="py-4 px-6">Applicant ID</th>
                            <th className="py-4 px-6">Full Name</th>
                            <th className="py-4 px-6">Mobile Contact</th>
                            <th className="py-4 px-6">Role Applied</th>
                            <th className="py-4 px-6">District / Territory</th>
                            <th className="py-4 px-6">Aadhar No.</th>
                            <th className="py-4 px-6">Amount</th>
                            <th className="py-4 px-6">Payment Status</th>
                            <th className="py-4 px-6 text-center">Action</th>
                          </>
                        )}

                      </tr>
                    </thead>

                    {/* Table Row Content */}
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-xs">
                      
                      {paginatedList.map((item, idx) => (
                        <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* 1. HEALTHCARDS ROW */}
                          {currentView === 'healthcards' && (
                            <>
                              <td className="py-4 px-6 flex items-center gap-3">
                                <img
                                  src={item.photoPath ? resolveAssetUrl(item.photoPath) : '/logo.jpg'}
                                  alt="Patient"
                                  className="h-8 w-8 rounded-full border border-slate-100 object-cover shadow-sm shrink-0"
                                  onError={handleImageError}
                                />
                                <span className="font-extrabold text-slate-800 uppercase">{item.fullName}</span>
                              </td>
                              <td className="py-4 px-6 font-bold">{item.mobile}</td>
                              <td className="py-4 px-6 font-mono text-[11px] tracking-wide">{item.aadhar}</td>
                              <td className="py-4 px-6 uppercase">{item.age} Yrs / {item.gender}</td>
                              <td className="py-4 px-6 font-mono text-emerald-600 font-bold tracking-wider">{item.healthId}</td>
                              <td className="py-4 px-6 text-slate-500">
                                {new Date(item.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {item.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => { setSelectedHealthCard(item); setShowHealthCardModal(true); }}
                                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 text-[10px] transition-all cursor-pointer shadow-sm"
                                >
                                  View Card
                                </button>
                              </td>
                            </>
                          )}

                          {/* 2. SILAYI ROWS */}
                          {currentView === 'silayi' && (
                            <>
                              <td className="py-4 px-6 font-bold text-slate-400">{item.serialNumber || '-'}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800 uppercase">{item.name}</td>
                              <td className="py-4 px-6 uppercase">{item.guardianName}</td>
                              <td className="py-4 px-6">{item.mobileNumber}</td>
                              <td className="py-4 px-6 font-mono tracking-wide">{item.aadharNumber}</td>
                              <td className="py-4 px-6 text-indigo-600 uppercase font-bold">{item.trainingName || 'Sewing Course'}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800">₹{item.registrationFee || 799}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {item.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleViewInvoice(item, 'silayi')}
                                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 text-[10px] border border-slate-200 transition-all cursor-pointer"
                                >
                                  View Receipt
                                </button>
                              </td>
                            </>
                          )}

                          {/* 3. SWAROJGAAR ROWS */}
                          {currentView === 'swarojgaar' && (
                            <>
                              <td className="py-4 px-6 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-xs border border-teal-100 shrink-0">
                                  {item.groupName?.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-extrabold text-slate-800 uppercase">{item.groupName}</span>
                              </td>
                              <td className="py-4 px-6 font-bold text-center">
                                <span className="bg-slate-100 text-slate-700 font-black rounded-lg px-2.5 py-1">
                                  {Array.isArray(item.members) ? item.members.length : 0} Members
                                </span>
                              </td>
                              <td className="py-4 px-6 uppercase">{item.location?.village || item.village || 'N/A'} / {item.location?.panchayat || item.panchayat || 'N/A'}</td>
                              <td className="py-4 px-6 uppercase">{item.location?.district || item.district || 'N/A'}</td>
                              <td className="py-4 px-6 uppercase">{item.location?.subDivision || item.anumandal || 'N/A'}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800">₹{item.registrationFee || 100}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {item.paymentStatus}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleViewInvoice(item, 'swarojgaar')}
                                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 text-[10px] border border-slate-200 transition-all cursor-pointer"
                                >
                                  View Invoice
                                </button>
                              </td>
                            </>
                          )}

                          {/* 4. NGO JOBS ROW */}
                          {currentView === 'ngoJobs' && (
                            <>
                              <td className="py-4 px-6">
                                <img
                                  src={item.photoPath ? resolveAssetUrl(item.photoPath) : '/logo.jpg'}
                                  alt="Applicant Photo"
                                  className="h-8 w-8 rounded-full border border-slate-100 object-cover shadow-sm"
                                  onError={handleImageError}
                                />
                              </td>
                              <td className="py-4 px-6 font-mono text-[10px] tracking-wide text-slate-400">{item.uniqueId || '-'}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800 uppercase">{item.fullName}</td>
                              <td className="py-4 px-6 font-bold">{item.mobile}</td>
                              <td className="py-4 px-6 font-black text-rose-600 uppercase">{item.roleApplied}</td>
                              <td className="py-4 px-6 uppercase">{item.district || 'N/A'}</td>
                              <td className="py-4 px-6 font-mono tracking-wide">{item.aadhar}</td>
                              <td className="py-4 px-6 font-extrabold text-slate-800">₹{item.amount || 499}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${item.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => handleViewInvoice(item, 'ngo')}
                                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 text-[10px] border border-slate-200 transition-all cursor-pointer"
                                >
                                  View Invoice
                                </button>
                              </td>
                            </>
                          )}

                        </tr>
                      ))}

                    </tbody>
                  </table>
                )}

              </div>

              {/* Table Pagination Section */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 px-4 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous Page
                  </button>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 px-4 py-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Page
                  </button>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* --- MODAL 1. PRINTABLE SCHEME TRANSACTION INVOICE --- */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1"><Printer className="h-4 w-4" /> Official Invoice Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto bg-slate-100 flex justify-center">
              {/* Receipt Area wrapper */}
              <div id="printable-area" className="w-full max-w-[420px] bg-white border border-slate-300 p-6 rounded shadow-md font-sans text-slate-800">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h2 className="m-0 text-[#000080] text-lg font-black uppercase tracking-wider">Aagaj Foundation</h2>
                  <p className="m-0 text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Under Indian Trust Act 1882 | Govt. Registration No: IV/34</p>
                  <p className="m-0 text-[8px] font-medium text-slate-400 mt-0.5">Helpline: +91 9431430464 | support@aagajfoundation.com</p>
                </div>

                <div className="flex justify-between items-start mt-4 text-[10px] leading-relaxed">
                  <div>
                    <span className="font-bold text-[#000080]">RECEIPT TO:</span>
                    <p className="m-0 font-extrabold text-slate-900 uppercase">{selectedPayment.beneficiaryName || 'Applicant'}</p>
                    <p className="m-0 text-slate-400 font-semibold">{selectedPayment.beneficiaryPhone}</p>
                  </div>
                  <div className="text-right">
                    <div><span className="font-bold text-[#000080]">DATE:</span> {new Date(selectedPayment.timestamp).toLocaleString()}</div>
                    <div><span className="font-bold text-[#000080]">TXN ID:</span> <span className="font-mono text-[9px]">{selectedPayment.paymentId || 'Pending'}</span></div>
                    <div><span className="font-bold text-[#000080]">ORDER ID:</span> <span className="font-mono text-[9px]">{selectedPayment.orderId}</span></div>
                  </div>
                </div>

                <div className="mt-6">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-[#000080] text-white border-b-2 border-red-500 uppercase text-[8px] font-bold tracking-wider">
                        <th className="py-2 px-3 font-black">Description of Service</th>
                        <th className="py-2 px-3 font-black text-right">Registered Scheme</th>
                        <th className="py-2 px-3 font-black text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <td className="py-3 px-3">
                          <p className="font-bold m-0 uppercase">Aagaj Scheme Enrolment</p>
                          <p className="text-[8px] text-slate-400 m-0">Dynamic digital portal entry credentials pass and Identity card provisioning logs.</p>
                        </td>
                        <td className="py-3 px-3 text-right text-indigo-600 font-bold uppercase">{selectedPayment.schemeType}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{selectedPayment.amount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                  <div className="border border-emerald-300 bg-emerald-50 text-emerald-800 px-3 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> VERIFIED SUCCESS
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="text-[#000080] font-bold">GRAND TOTAL:</span>
                    <h3 className="m-0 text-lg font-black text-[#ED1C24]">₹{selectedPayment.amount}.00</h3>
                  </div>
                </div>

                <div className="flex justify-between mt-8 text-[9px] leading-tight font-semibold text-slate-400">
                  <div className="text-center w-28">
                    <div className="h-8"></div>
                    <div className="border-t border-slate-300 pt-1 uppercase">PAYER SIGNATURE</div>
                  </div>
                  <div className="text-center w-32 border border-slate-100 bg-slate-50/50 p-1 rounded relative">
                    <span className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-red-500/20 rotate-12 select-none">AAGAJ FOUNDATION</span>
                    <img src="/logo.jpg" alt="Seal" className="h-6 mx-auto opacity-70" />
                    <div className="border-t border-slate-300 pt-1 uppercase text-[8px] mt-1 font-bold">AUTHORIZED TRUSTEE</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowReceiptModal(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close View
              </button>
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer">
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2. PRINTABLE HEALTH CARD VIEWER --- */}
      {showHealthCardModal && selectedHealthCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1"><Printer className="h-4 w-4" /> Issued Health Card View</h3>
              <button onClick={() => setShowHealthCardModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex flex-col items-center gap-6 overflow-y-auto w-full">
              {/* Card Front & Back wrapper for Printing/Downloading */}
              <div id="printable-area" className="flex flex-col gap-6 items-center w-full bg-slate-100">
                
                {/* FRONT SIDE WRAPPER */}
                <div className="w-full flex justify-center items-center overflow-hidden h-[180px] sm:h-[220px] md:h-[300px]">
                  <div className="origin-center scale-[0.58] sm:scale-75 md:scale-100 shrink-0">
                    <div ref={healthCardRef} className="w-[480px] h-[300px] rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans text-slate-800 shrink-0">
                      <div className="bg-slate-50 text-[#2e3192] text-center py-1 text-[9px] font-black uppercase tracking-wider border-b border-slate-100">
                        Issued Under Swasthya Suraksha Yojna
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#2e3192] to-[#1a1c54] h-[75px] text-white py-3 px-5 flex justify-between items-center relative">
                        <div className="flex items-center gap-2">
                          <img src="/logo.jpg" alt="Logo" className="h-9 w-9 rounded-lg bg-white p-0.5" />
                          <span className="text-base font-black text-[#ed1c24] tracking-wider uppercase">Aagaj.Foundation</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-slate-300 tracking-wider block">HEALTH CARD</span>
                          <span className="text-sm font-extrabold text-[#ed1c24] block">{selectedHealthCard.healthId}</span>
                        </div>
                      </div>

                      <div className="flex-grow flex p-4 bg-white items-center">
                        <div className="w-[90px] h-[115px] rounded-lg border-2 border-[#2e3192] bg-slate-50 overflow-hidden shrink-0 shadow-sm p-0.5">
                          <img
                            src={selectedHealthCard.photoPath ? resolveAssetUrl(selectedHealthCard.photoPath) : '/logo.jpg'}
                            alt="Patient"
                            className="w-full h-full object-cover rounded-md"
                            crossOrigin="anonymous"
                            onError={handleImageError}
                          />
                        </div>

                        <div className="flex-grow grid grid-cols-2 gap-x-3 gap-y-2 items-start self-start text-[10px] ml-4 text-left">
                          <div className="col-span-2">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name</label>
                            <span className="font-extrabold text-slate-850 text-xs block uppercase truncate">{selectedHealthCard.fullName}</span>
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Age / Gender</label>
                            <span className="font-bold text-slate-700 block">{selectedHealthCard.age} Yrs / {selectedHealthCard.gender}</span>
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Blood Group</label>
                            <span className="font-bold text-slate-700 block">{selectedHealthCard.bloodGroup}</span>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Aadhar Number</label>
                            <span className="font-bold text-slate-700 block tracking-wide font-mono">{selectedHealthCard.aadhar?.replace(/(\d{4})/g, '$1 ').trim()}</span>
                          </div>
                          <div className="col-span-2">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Contact No.</label>
                            <span className="font-extrabold text-[#2e3192] block">+91 {selectedHealthCard.mobile}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border-t border-[#ed1c24] py-2 px-5 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-[8px] font-black text-emerald-600 block">VALID IDENTITY</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[7px] text-slate-400 block">EXPIRY DATE</span>
                          <span className="font-extrabold text-slate-800 text-[10px] block uppercase">
                            {new Date(selectedHealthCard.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACK SIDE WRAPPER */}
                <div className="w-full flex justify-center items-center overflow-hidden h-[180px] sm:h-[220px] md:h-[300px]">
                  <div className="origin-center scale-[0.58] sm:scale-75 md:scale-100 shrink-0">
                    <div className="w-[480px] h-[300px] rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden relative flex flex-col justify-between select-none font-sans text-slate-800 shrink-0">
                      <div className="bg-[#ed1c24] text-white text-center py-2 text-[10px] font-black uppercase tracking-wider">
                        Residential &amp; Emergency Details
                      </div>

                      <div className="flex-grow p-4 flex flex-col justify-between bg-white text-[10px]">
                        <div className="flex items-center justify-between text-left">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-grow text-[10px]">
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Village</label>
                              <span className="font-bold text-slate-700 block uppercase">{selectedHealthCard.address?.village || selectedHealthCard.village || 'N/A'}</span>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Panchayat</label>
                              <span className="font-bold text-slate-700 block uppercase">{selectedHealthCard.address?.panchayat || selectedHealthCard.panchayat || 'N/A'}</span>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Block</label>
                              <span className="font-bold text-slate-700 block uppercase">{selectedHealthCard.address?.block || selectedHealthCard.block || 'N/A'}</span>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">District</label>
                              <span className="font-bold text-slate-700 block uppercase">{selectedHealthCard.address?.district || selectedHealthCard.district || 'N/A'}</span>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">State</label>
                              <span className="font-bold text-slate-700 block uppercase">{selectedHealthCard.address?.state || selectedHealthCard.state || 'N/A'}</span>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Pin Code</label>
                              <span className="font-bold text-slate-700 block">{selectedHealthCard.address?.pincode || selectedHealthCard.pincode || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center shrink-0 ml-4 p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=HEALTH-ID:${selectedHealthCard.healthId}%0ANAME:${encodeURIComponent(selectedHealthCard.fullName)}`}
                              alt="QR Code"
                              className="h-14 w-14 object-contain rounded-md"
                            />
                            <span className="text-[7px] font-black text-slate-800 tracking-wider uppercase mt-0.5">Scan Profile</span>
                          </div>
                        </div>

                        <div className="border border-dashed border-slate-200 bg-slate-50 p-2 rounded-xl text-center mt-3">
                          <p className="text-[8px] font-black text-slate-900 tracking-wider uppercase m-0">AAGAJ FOUNDATION - REG: 1882 ACT</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50 w-full">
              <button onClick={() => setShowHealthCardModal(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close Card
              </button>
              <button
                onClick={() => {
                  if (!healthCardRef.current) return;
                  html2canvas(healthCardRef.current, { scale: 3, useCORS: true }).then((canvas) => {
                    const link = document.createElement('a');
                    link.download = `HealthCard_MC_${selectedHealthCard.healthId}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  });
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download JPG
              </button>
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer">
                <Printer className="h-4 w-4" /> Print Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDashboard;
