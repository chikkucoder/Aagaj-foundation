import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import html2canvas from 'html2canvas';
import {
  getAllApplicants,
  getAllBeneficiaries,
  deleteEmployee,
  getAllAppointments,
  getHospitalAdminStats,
  getHospitalAdminHospitals,
  registerHospital,
  editHospital,
  toggleHospitalStatus,
  deleteHospital,
  generateHospitalCredentials,
  getHospitalGlobalReports,
  getHospitalAuditLogs,
  getAdminTransactions
} from '../api/userApi';
import apiClient from '../api/apiClient';
import {
  Users,
  Handshake,
  IdCard,
  Scissors,
  Store,
  Activity,
  HeartPulse,
  CalendarCheck,
  Search,
  Plus,
  RotateCw,
  LogOut,
  Trash2,
  FileSpreadsheet,
  Eye,
  Lock,
  Download,
  X,
  FileText,
  UserCheck,
  CreditCard,
  Building2,
  ShieldAlert,
  Menu,
  ChevronDown,
  Printer,
  Edit,
  UserPlus,
  Image
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Navigation Sidebar State
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, ngoJobs, normalJobs, hospitalMaster, healthcards, appointments, allTransactions, donationHistory, auditLogs
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPaymentsMenu, setShowPaymentsMenu] = useState(true);

  // Data States
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [healthCards, setHealthCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Hospital Master States
  const [hospStats, setHospStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    totalBilling: 0,
    totalTreatments: 0,
    totalAppointments: 0
  });
  const [hospitals, setHospitals] = useState([]);
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [hospitalBills, setHospitalBills] = useState([]);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Records for Modals
  const [selectedCardUser, setSelectedCardUser] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const cardRef = useRef(null);

  // Credentials View Modal
  const [viewCreds, setViewCreds] = useState(null); // { username, password }

  // Modals Toggles
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddHospModal, setShowAddHospModal] = useState(false);
  const [showEditHospModal, setShowEditHospModal] = useState(false);
  const [showCredsHospModal, setShowCredsHospModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Payments / Receipt Modals
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedHealthCard, setSelectedHealthCard] = useState(null);
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const healthCardRef = useRef(null);

  // Forms Hooks
  const { register: regAddEmp, handleSubmit: handleAddEmpSubmit, formState: { errors: addEmpErrors }, reset: resetAddEmpForm } = useForm();
  const [addEmpSuccess, setAddEmpSuccess] = useState(null);
  const [addEmpError, setAddEmpError] = useState('');

  const { register: regAddHosp, handleSubmit: handleAddHospSubmit, formState: { errors: addHospErrors }, reset: resetAddHospForm, setValue: setAddHospValue } = useForm();
  const [addHospError, setAddHospError] = useState('');
  const [addHospSuccess, setAddHospSuccess] = useState(false);

  const { register: regEditHosp, handleSubmit: handleEditHospSubmit, formState: { errors: editHospErrors }, reset: resetEditHospForm } = useForm();
  const [editHospError, setEditHospError] = useState('');

  const { register: regCredHosp, handleSubmit: handleCredHospSubmit, formState: { errors: credHospErrors }, reset: resetCredHospForm } = useForm();
  const [credHospError, setCredHospError] = useState('');

  // Fetch all stats and tables
  const syncData = async () => {
    setLoading(true);
    try {
      const [appRes, benRes, apptRes, hcRes, txnRes, donRes, hospStatsRes, hospListRes, hospBillsRes, auditRes] = await Promise.all([
        getAllApplicants().catch(err => []),
        getAllBeneficiaries().catch(err => []),
        getAllAppointments().catch(err => ({ success: false, data: [] })),
        apiClient.get('/api/healthcard/all').catch(err => ({ data: { success: false, data: [] } })),
        getAdminTransactions().catch(err => ({ success: false, data: [] })),
        apiClient.get('/api/donation/get-history').catch(err => ({ data: [] })),
        getHospitalAdminStats().catch(err => ({ success: false, stats: {} })),
        getHospitalAdminHospitals().catch(err => ({ success: false, data: [] })),
        getHospitalGlobalReports().catch(err => ({ success: false, data: [] })),
        getHospitalAuditLogs().catch(err => ({ success: false, data: [] }))
      ]);

      setApplicants(Array.isArray(appRes) ? appRes : []);
      setBeneficiaries(Array.isArray(benRes) ? benRes : []);
      setAppointments(apptRes.success ? apptRes.data : []);
      setHealthCards(hcRes.data?.success ? hcRes.data.data : []);
      setTransactions(txnRes.success ? txnRes.data : []);
      setDonations(Array.isArray(donRes.data) ? donRes.data : (Array.isArray(donRes) ? donRes : []));
      setAuditLogs(auditRes.success ? auditRes.data : []);

      if (hospStatsRes.success) {
        setHospStats(hospStatsRes.stats);
      }
      setHospitals(hospListRes.success ? hospListRes.data : []);
      setHospitalBills(hospBillsRes.success ? hospBillsRes.data : []);

    } catch (err) {
      console.error('Failed to synchronize admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  // Carousel manager states
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrder, setNewOrder] = useState(0);
  const [newFile, setNewFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCarouselAdmin = async () => {
    setCarouselLoading(true);
    try {
      const res = await apiClient.get('/api/carousel/all');
      if (res.data && res.data.success) {
        setCarouselImages(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin carousel images", err);
    } finally {
      setCarouselLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'carouselControl') {
      fetchCarouselAdmin();
    }
  }, [currentView]);

  const handleCarouselUpload = async (e) => {
    e.preventDefault();
    if (!newFile) {
      alert("Please select an image file first.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", newFile);
      
      const uploadRes = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadRes.data && uploadRes.data.success) {
        const { imageUrl, publicId } = uploadRes.data;
        
        const saveRes = await apiClient.post('/api/carousel', {
          imageUrl,
          publicId,
          title: newTitle,
          order: newOrder ? Number(newOrder) : 0,
          active: true
        });
        
        if (saveRes.data && saveRes.data.success) {
          alert("Image uploaded and added to carousel successfully!");
          setNewTitle('');
          setNewOrder(0);
          setNewFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          fetchCarouselAdmin();
        } else {
          alert("Failed to save image entry in database.");
        }
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCarouselField = async (id, updatedFields) => {
    try {
      const res = await apiClient.put(`/api/carousel/${id}`, updatedFields);
      if (res.data && res.data.success) {
        setCarouselImages(prev => prev.map(img => img._id === id ? { ...img, ...updatedFields } : img));
      } else {
        alert("Failed to update carousel image details.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating image details.");
    }
  };

  const handleDeleteCarouselImage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this carousel image? This will permanently delete it from the website and Cloudinary.")) return;
    try {
      const res = await apiClient.delete(`/api/carousel/${id}`);
      if (res.data && res.data.success) {
        alert("Image deleted successfully!");
        setCarouselImages(prev => prev.filter(img => img._id !== id));
      } else {
        alert("Failed to delete image.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting image.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteApplicant = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this applicant record?')) return;
    try {
      const res = await deleteEmployee(id);
      if (res.success) {
        alert('Deleted successfully');
        syncData();
      } else {
        alert(res.message || 'Deletion failed');
      }
    } catch (err) {
      alert('Error connecting to the server');
    }
  };

  // Add Employee Pass Submit
  const onAddEmployeeSubmit = async (data) => {
    setAddEmpError('');
    setAddEmpSuccess(null);
    try {
      const res = await apiClient.post('/api/admin/create-password', {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        designation: data.designation,
        district: data.district,
        state: data.state,
        password: data.password
      });
      if (res.data && res.data.success) {
        setAddEmpSuccess({ username: res.data.username });
        resetAddEmpForm();
        syncData();
      } else {
        setAddEmpError(res.data?.message || 'Failed to update credentials.');
      }
    } catch (err) {
      setAddEmpError(err.response?.data?.message || 'Server connection error.');
    }
  };

  // Register Hospital Submit
  const onAddHospitalSubmit = async (data) => {
    setAddHospError('');
    setAddHospSuccess(false);
    try {
      const res = await registerHospital({
        biz: data.biz,
        hashPass: data.hashPass,
        license: data.license,
        city: data.city,
        state: data.state,
        pin: data.pin,
        owner: data.owner,
        phone: data.phone,
        email: data.email,
        specialization: data.specialization ? data.specialization.split(',').map(s => s.trim()) : ['General Medicine']
      });
      if (res.success) {
        setAddHospSuccess(true);
        resetAddHospForm();
        setShowAddHospModal(false);
        syncData();
        alert('Hospital Registered successfully with Super Admin permissions');
      } else {
        setAddHospError(res.message || 'Registration failed');
      }
    } catch (err) {
      setAddHospError(err.response?.data?.message || 'Server connection error');
    }
  };

  // Edit Hospital Submit
  const onEditHospitalSubmit = async (data) => {
    setEditHospError('');
    try {
      const res = await editHospital(selectedHospital.uniqueId, {
        biz: data.biz,
        license: data.license,
        city: data.city,
        state: data.state,
        pin: data.pin,
        owner: data.owner,
        phone: data.phone,
        email: data.email,
        specialization: data.specialization ? data.specialization.split(',').map(s => s.trim()) : ['General Medicine']
      });
      if (res.success) {
        setShowEditHospModal(false);
        setSelectedHospital(null);
        syncData();
        alert('Hospital updated successfully');
      } else {
        setEditHospError(res.message || 'Edit failed');
      }
    } catch (err) {
      setEditHospError(err.response?.data?.message || 'Server connection error');
    }
  };

  // Provision credentials submit
  const onCredHospitalSubmit = async (data) => {
    setCredHospError('');
    try {
      const res = await generateHospitalCredentials({
        uniqueId: selectedHospital.uniqueId,
        email: data.email,
        password: data.password,
        loginId: data.loginId || `HOSP-${selectedHospital.uniqueId}`
      });
      if (res.success) {
        setShowCredsHospModal(false);
        setSelectedHospital(null);
        syncData();
        alert('Hospital Credentials provisioned and updated successfully');
      } else {
        setCredHospError(res.message || 'Credentials update failed');
      }
    } catch (err) {
      setCredHospError(err.response?.data?.message || 'Server connection error');
    }
  };

  // Toggle Hospital Status
  const handleToggleHospStatus = async (uniqueId) => {
    try {
      const res = await toggleHospitalStatus(uniqueId);
      if (res.success) {
        syncData();
      } else {
        alert(res.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Error communicating with backend');
    }
  };

  // Delete Hospital
  const handleDeleteHospital = async (uniqueId) => {
    if (!window.confirm('WARNING: Deleting this Hospital will also permanently delete all related patients billing records and scheduled doctor appointments. Do you want to proceed?')) return;
    try {
      const res = await deleteHospital(uniqueId);
      if (res.success) {
        alert('Hospital and associated logs deleted successfully');
        syncData();
      } else {
        alert(res.message || 'Deletion failed');
      }
    } catch (err) {
      alert('Error communicating with backend');
    }
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

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAddHospValue('hashPass', pass);
  };

  // Download ID Card PNG
  const downloadIDCard = () => {
    if (!cardRef.current) return;
    html2canvas(cardRef.current, { scale: 3, useCORS: true }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `Employee_Card_${selectedCardUser.fullName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Counts & Stats
  const totalCount = applicants.length;
  const ngoCount = applicants.filter(u => u.job_category === 'NGO').length;
  const normalCount = applicants.filter(u => u.job_category === 'Normal').length;
  const idCount = applicants.filter(u => u.emp_username).length;

  const silayiCount = beneficiaries.filter(d => d.yojanaName === 'Mahila Silai Prasikshan Yojana').length;
  const swarojgaarCount = beneficiaries.filter(d => d.yojanaName === 'Mahila Swarojgaar Yojana').length;
  const swasthyaCount = beneficiaries.filter(d => d.yojanaName === 'Swasthya Suraksha Yojana').length;

  // Filter lists based on view & search
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();

    switch (currentView) {
      case 'dashboard':
        return applicants.filter(u => {
          const matchesSearch = u.fullName?.toLowerCase().includes(term) || u.uniqueId?.toString().includes(term) || u.email?.toLowerCase().includes(term);
          if (roleFilter === 'All') return matchesSearch;
          if (roleFilter === 'NGO') return matchesSearch && u.job_category === 'NGO';
          if (roleFilter === 'Normal') return matchesSearch && u.job_category === 'Normal';
          if (roleFilter === 'Employee') return matchesSearch && u.job_category === 'Employee';
          return matchesSearch && u.roleApplied === roleFilter;
        });

      case 'ngoJobs':
        return applicants.filter(u => u.job_category === 'NGO' && (
          u.fullName?.toLowerCase().includes(term) || u.uniqueId?.toString().includes(term) || u.mobile?.includes(term) || u.roleApplied?.toLowerCase().includes(term)
        ));

      case 'normalJobs':
        return applicants.filter(u => u.job_category === 'Normal' && (
          u.fullName?.toLowerCase().includes(term) || u.uniqueId?.toString().includes(term) || u.mobile?.includes(term) || u.roleApplied?.toLowerCase().includes(term)
        ));

      case 'hospitalMaster':
        return hospitals.filter(h => {
          const matchesSearch = h.businessName?.toLowerCase().includes(term) || h.uniqueId?.toLowerCase().includes(term) || h.licenseNumber?.toLowerCase().includes(term) || h.contact?.ownerName?.toLowerCase().includes(term);
          if (specializationFilter === 'All') return matchesSearch;
          return matchesSearch && Array.isArray(h.specialization) && h.specialization.some(s => s.toLowerCase() === specializationFilter.toLowerCase());
        });

      case 'healthcards':
        return healthCards.filter(c => (
          c.fullName?.toLowerCase().includes(term) || c.mobile?.includes(term) || c.healthId?.toLowerCase().includes(term) || c.aadhar?.includes(term)
        ));

      case 'appointments':
        return appointments.filter(a => (
          a.name?.toLowerCase().includes(term) || a.healthId?.toLowerCase().includes(term) || a.department?.toLowerCase().includes(term)
        ));

      case 'allTransactions':
        return transactions.filter(t => (
          t.paymentId?.toLowerCase().includes(term) || t.orderId?.toLowerCase().includes(term) || t.beneficiaryName?.toLowerCase().includes(term) || t.beneficiaryPhone?.includes(term) || t.schemeType?.toLowerCase().includes(term)
        ));

      case 'donationHistory':
        return donations.filter(d => (
          d.payment_id?.toLowerCase().includes(term) || d.donor_name?.toLowerCase().includes(term) || d.email?.toLowerCase().includes(term) || d.phone?.includes(term) || d.pan?.toLowerCase().includes(term)
        ));

      case 'auditLogs':
        return auditLogs.filter(l => (
          l.actor?.email?.toLowerCase().includes(term) || l.action?.toLowerCase().includes(term) || l.ipAddress?.includes(term) || l.userAgent?.toLowerCase().includes(term)
        ));

      default:
        return [];
    }
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
      case 'dashboard': return 'Super Admin Dashboard';
      case 'ngoJobs': return 'NGO Coordinator Careers Data';
      case 'normalJobs': return 'Normal Jobs Candidates Log';
      case 'hospitalMaster': return 'Swasthya Suraksha Partner Control (Hospital Master)';
      case 'healthcards': return 'Issued Identity Health Cards';
      case 'appointments': return 'Doctor Schedule Bookings';
      case 'allTransactions': return 'Consolidated Scheme Payment Logs';
      case 'donationHistory': return 'Donations Receipt Register (Razorpay)';
      case 'auditLogs': return 'Super Admin Audit Action Trails';
      case 'carouselControl': return 'Dashboard Image Control (Hero Carousel)';
      default: return 'Foundation Control Panel';
    }
  };

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
              <h1 className="text-sm font-black text-white uppercase tracking-wider">Aagaj Admin</h1>
              <span className="text-[9px] text-[#fdd831] font-bold uppercase tracking-widest bg-amber-400/10 px-1 py-0.5 rounded">Control Panel</span>
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
              onClick={() => { setCurrentView('dashboard'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'dashboard' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Users className="h-4.5 w-4.5" /> Dashboard Metrics
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Careers System</p>
            <button
              onClick={() => { setCurrentView('ngoJobs'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'ngoJobs' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Handshake className="h-4.5 w-4.5" /> NGO Jobs
            </button>
            <button
              onClick={() => { setCurrentView('normalJobs'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'normalJobs' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Store className="h-4.5 w-4.5" /> Normal Jobs
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Health Network</p>
            <button
              onClick={() => { setCurrentView('hospitalMaster'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'hospitalMaster' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <HeartPulse className="h-4.5 w-4.5" /> Hospital Master
            </button>
            <button
              onClick={() => { setCurrentView('healthcards'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'healthcards' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <IdCard className="h-4.5 w-4.5" /> Health Cards
            </button>
            <button
              onClick={() => { setCurrentView('appointments'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'appointments' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <CalendarCheck className="h-4.5 w-4.5" /> Appointments
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 cursor-pointer" onClick={() => setShowPaymentsMenu(!showPaymentsMenu)}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payments Master</p>
              <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${showPaymentsMenu ? '' : 'rotate-180'}`} />
            </div>
            {showPaymentsMenu && (
              <div className="space-y-1 pl-2">
                <button
                  onClick={() => { setCurrentView('allTransactions'); setCurrentPage(1); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${currentView === 'allTransactions' ? 'bg-slate-800 text-[#fdd831] border-l-2 border-[#fdd831]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <CreditCard className="h-3.5 w-3.5" /> All Transactions
                </button>
                <button
                  onClick={() => { setCurrentView('donationHistory'); setCurrentPage(1); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${currentView === 'donationHistory' ? 'bg-slate-800 text-[#fdd831] border-l-2 border-[#fdd831]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Donation History
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Control</p>
            <button
              onClick={() => { setCurrentView('carouselControl'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'carouselControl' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Image className="h-4.5 w-4.5" /> Image Control
            </button>
            <button
              onClick={() => { setCurrentView('auditLogs'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'auditLogs' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <ShieldAlert className="h-4.5 w-4.5" /> Audit Activity Trails
            </button>
          </div>

        </nav>

        {/* Sidebar Footer Profiles */}
        <div className="p-4 border-t border-slate-800 bg-[#030e20]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[#fdd831] text-[#051630] font-black flex items-center justify-center text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">{user?.fullName || 'Administrator'}</p>
              <span className="text-[10px] text-slate-500 leading-none">Super Admin</span>
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

      {/* Main content wrapper */}
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
              onClick={syncData}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {currentView === 'dashboard' && (
              <button
                onClick={() => {
                  setAddEmpSuccess(null);
                  setAddEmpError('');
                  setShowAddEmpModal(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#051630] hover:bg-slate-800 text-white shadow px-3 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Grant Access Pass</span>
              </button>
            )}

            {currentView === 'hospitalMaster' && (
              <button
                onClick={() => {
                  setAddHospError('');
                  setAddHospSuccess(false);
                  setShowAddHospModal(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white shadow px-3 py-2 text-xs font-bold transition-all cursor-pointer animate-pulse"
              >
                <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Register Hospital</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 space-y-6">
          
          {/* ======================================================== */}
          {/*   1. DASHBOARD OVERVIEW VIEW                             */}
          {/* ======================================================== */}
          {currentView === 'dashboard' && (
            <>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</span>
                    <Users className="h-5 w-5 text-rose-500 opacity-60" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-slate-800">{totalCount}</h3>
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">NGO + General Registrations</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NGO Candidates</span>
                    <Handshake className="h-5 w-5 text-amber-500 opacity-60" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-slate-800">{ngoCount}</h3>
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">Block / Block Coordinators</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Normal Candidates</span>
                    <Store className="h-5 w-5 text-blue-500 opacity-60" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-slate-800">{normalCount}</h3>
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">Normal Job Enrolments</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Employees</span>
                    <IdCard className="h-5 w-5 text-emerald-500 opacity-60" />
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-slate-800">{idCount}</h3>
                  <span className="text-[9px] text-slate-400 block mt-1 font-semibold uppercase">With Active Passwords</span>
                </div>

              </div>

              {/* Sub Yojana Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#e83e8c]/10 to-[#e83e8c]/5 rounded-2xl border border-[#e83e8c]/20 p-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#e83e8c]">Silayi Yojana</span>
                    <Scissors className="h-4 w-4 text-[#e83e8c]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-2">{silayiCount}</h3>
                </div>
                <div className="bg-gradient-to-br from-[#20c997]/10 to-[#20c997]/5 rounded-2xl border border-[#20c997]/20 p-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#20c997]">Mahila Swarojgaar</span>
                    <Store className="h-4 w-4 text-[#20c997]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-2">{swarojgaarCount}</h3>
                </div>
                <div className="bg-gradient-to-br from-[#6610f2]/10 to-[#6610f2]/5 rounded-2xl border border-[#6610f2]/20 p-4">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#6610f2]">Health Partners</span>
                    <HeartPulse className="h-4 w-4 text-[#6610f2]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-2">{swasthyaCount}</h3>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/*   2. HOSPITAL MASTER VIEW                                */}
          {/* ======================================================== */}
          {currentView === 'hospitalMaster' && (
            <>
              {/* Hospital Summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Partners</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">{hospStats.totalHospitals}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Active Partners</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">{hospStats.activeHospitals}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Billing (INR)</span>
                  <span className="text-xl font-black text-indigo-600 mt-1 block">₹{hospStats.totalBilling}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Treatments Log</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block">{hospStats.totalTreatments}</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 col-span-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Doctor Appointments</span>
                  <span className="text-xl font-black text-amber-500 mt-1 block">{hospStats.totalAppointments}</span>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/*   3. ALL TRANSACTIONS VIEW                               */}
          {/* ======================================================== */}
          {currentView === 'allTransactions' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Successful Payments</span>
                <h4 className="text-2xl font-black mt-1">₹{transactions.filter(t => t.status === 'success').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0).toFixed(2)}</h4>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Pending Transactions</span>
                <h4 className="text-2xl font-black mt-1">{transactions.filter(t => t.status === 'pending').length} logs</h4>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800">
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Verification Mismatch</span>
                <h4 className="text-2xl font-black mt-1">{transactions.filter(t => t.verificationStatus === 'signature_mismatch' || t.verificationStatus === 'amount_mismatch').length} logs</h4>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/*   4. DONATION HISTORY VIEW                               */}
          {/* ======================================================== */}
          {currentView === 'donationHistory' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#051630] to-indigo-950 text-white p-6 rounded-3xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Razorpay Aggregate Donations</span>
                <h3 className="text-3xl font-black text-[#fdd831] mt-2">₹{donations.filter(d => d.status === 'Success').reduce((acc, d) => acc + (d.amount || 0), 0).toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-slate-400 mt-2 font-semibold">Consolidated 80G tax exemption donation logs</p>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recent Donors</span>
                  <p className="text-sm font-semibold text-slate-700 mt-1">Check full donor profile details below</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                    {donations.length}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none mt-1">Total Contributors</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Active online contribution</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/*   DATA DISPLAY TABLE PANEL                               */}
          {/* ======================================================== */}
          {currentView !== 'carouselControl' ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xl p-4 sm:p-6">
            
            {/* Table Header Filter Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]"></span>
                  {currentView === 'dashboard' ? `${roleFilter} Candidates List` : (currentView === 'ngoJobs' ? 'NGO Job Applications' : (currentView === 'normalJobs' ? 'Normal Job Applications' : `${currentView.replace(/([A-Z])/g, ' $1')} Logs`))}
                </h4>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                {currentView === 'dashboard' && (
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white outline-none focus:border-[#ED1C24] transition-all cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="NGO">Only NGO Jobs</option>
                    <option value="Normal">Only Normal Jobs</option>
                    <option value="Employee">Registered Employees</option>
                    <option value="Panchayat Coordinator">Panchayat Coordinator</option>
                    <option value="Block Coordinator">Block Coordinator</option>
                    <option value="District Coordinator">District Coordinator</option>
                    <option value="Health Supervisor">Health Supervisor</option>
                    <option value="Mahila Mitra">Mahila Mitra</option>
                    <option value="Skill Trainer">Skill Trainer</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                )}

                {currentView === 'hospitalMaster' && (
                  <select
                    value={specializationFilter}
                    onChange={(e) => { setSpecializationFilter(e.target.value); setCurrentPage(1); }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white outline-none focus:border-[#ED1C24] transition-all cursor-pointer"
                  >
                    <option value="All">All Specializations</option>
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
                )}
                
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search name, phone or ID..."
                    className="w-full sm:w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#ED1C24] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ED1C24] border-t-transparent"></div>
                <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Aggregating live records...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  
                  {/* ========================================== */}
                  {/*  TABLE 1. DASHBOARD & JOBS CANDIDATES MAP  */}
                  {/* ========================================== */}
                  {['dashboard', 'ngoJobs', 'normalJobs'].includes(currentView) && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Photo</th>
                          <th className="py-3 px-4">Pravesh ID</th>
                          <th className="py-3 px-4">Name / Contact</th>
                          <th className="py-3 px-4">Role Applied</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Credentials</th>
                          <th className="py-3 px-4 text-center">Receipt PDF</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No job candidates matching filters found.</td>
                          </tr>
                        ) : (
                          paginatedList.map(user => {
                            const photo = user.photoPath ? resolveAssetUrl(user.photoPath) : '/logo.jpg';
                            return (
                              <tr key={user._id} className="hover:bg-slate-50/50 transition-all">
                                <td className="py-3 px-4">
                                  <img
                                    src={photo}
                                    alt="Candidate Photo"
                                    className="h-9 w-9 rounded-full border border-slate-100 object-cover shadow-sm"
                                    onError={handleImageError}
                                  />
                                </td>
                                <td className="py-3 px-4 font-black text-[#ED1C24]">AF-{user.uniqueId}</td>
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  <p className="font-bold">{user.fullName}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{user.email || user.mobile}</p>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">{user.roleApplied || 'NGO Candidate'}</td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${user.job_category === 'NGO' ? 'bg-amber-100 text-amber-800' : (user.job_category === 'Normal' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800')}`}>
                                    {user.job_category || 'NGO'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {user.emp_password ? (
                                    <button
                                      onClick={() => setViewCreds({ username: user.emp_username, password: 'Protected (Aagaj@123)' })}
                                      className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200 transition-all cursor-pointer"
                                    >
                                      <Lock className="h-3 w-3" /> View Pass
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">No Pass</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {user.applicationPdf ? (
                                    <a
                                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/application/pdf/${user._id}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-all"
                                    >
                                      <FileText className="h-3.5 w-3.5" /> View
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-semibold">No File</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => { setSelectedCardUser(user); setShowCardModal(true); }}
                                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                      title="Identity Card"
                                    >
                                      <IdCard className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteApplicant(user._id)}
                                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 2. HOSPITAL MASTER MANAGEMENT GRID  */}
                  {/* ========================================== */}
                  {currentView === 'hospitalMaster' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Hospital Code</th>
                          <th className="py-3 px-4">Business Name</th>
                          <th className="py-3 px-4">Owner & WhatsApp</th>
                          <th className="py-3 px-4">Location (City/State)</th>
                          <th className="py-3 px-4">NABH/License</th>
                          <th className="py-3 px-4">Credentials</th>
                          <th className="py-3 px-4">State Toggle</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No Swasthya Partner hospitals registered.</td>
                          </tr>
                        ) : (
                          paginatedList.map(hosp => (
                            <tr key={hosp._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 font-black text-rose-600">HOSP-{hosp.uniqueId}</td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-900">{hosp.businessName}</p>
                                <p className="text-[10px] text-indigo-500 font-semibold">{hosp.specialization?.join(', ') || 'General Medicine'}</p>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800">
                                <p>{hosp.contact?.ownerName}</p>
                                <p className="text-[10px] text-slate-400">{hosp.contact?.whatsappNumber}</p>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{hosp.address?.city}, {hosp.address?.state}</td>
                              <td className="py-3 px-4 font-bold text-slate-500">{hosp.licenseNumber}</td>
                              <td className="py-3 px-4">
                                {hosp.hasCredentials ? (
                                  <button
                                    onClick={() => setViewCreds({ username: hosp.loginId || hosp.email, password: 'Protected (Bcrypt Hashed)' })}
                                    className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200 transition-all cursor-pointer"
                                  >
                                    <Lock className="h-3 w-3" /> Provisioned
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setSelectedHospital(hosp); resetCredHospForm(); setShowCredsHospModal(true); }}
                                    className="flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200 transition-all cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3" /> Gen Credentials
                                  </button>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleHospStatus(hosp.uniqueId)}
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase cursor-pointer transition-all ${hosp.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}`}
                                >
                                  {hosp.isActive ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => { setSelectedHospital(hosp); resetEditHospForm(); setShowEditHospModal(true); }}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHospital(hosp.uniqueId)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 3. HEALTH ID CARDS LOG              */}
                  {/* ========================================== */}
                  {currentView === 'healthcards' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Photo</th>
                          <th className="py-3 px-4">Health ID</th>
                          <th className="py-3 px-4">Cardholder Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Aadhar Card</th>
                          <th className="py-3 px-4">Location (District)</th>
                          <th className="py-3 px-4">Expiry Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No health card registers issued.</td>
                          </tr>
                        ) : (
                          paginatedList.map(card => (
                            <tr key={card._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4">
                                <img
                                  src={card.photoPath ? resolveAssetUrl(card.photoPath) : '/logo.jpg'}
                                  alt="Cardholder Photo"
                                  className="h-8 w-8 rounded-full border border-slate-100 object-cover shadow-sm"
                                  onError={handleImageError}
                                />
                              </td>
                              <td className="py-3 px-4 font-black text-rose-600">{card.healthId}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{card.fullName}</td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{card.mobile}</td>
                              <td className="py-3 px-4 text-slate-500 font-medium">{card.aadhar}</td>
                              <td className="py-3 px-4 text-slate-500">{card.address?.district}, {card.address?.state}</td>
                              <td className="py-3 px-4 text-rose-500 font-bold">{new Date(card.expiryDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800 uppercase">Paid Success</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => { setSelectedHealthCard(card); setShowHealthCardModal(true); }}
                                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-[#ED1C24] hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center gap-1 ml-auto animate-pulse"
                                  title="View Health Card"
                                >
                                  <Eye className="h-3.5 w-3.5" /> View Card
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 4. DOCTOR APPOINTMENTS REGISTER     */}
                  {/* ========================================== */}
                  {currentView === 'appointments' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Appointment Date</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Health ID</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Hospital Name</th>
                          <th className="py-3 px-4">Issue Description</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12 text-slate-400 font-semibold">No medical appointments booked.</td>
                          </tr>
                        ) : (
                          paginatedList.map(appt => (
                            <tr key={appt._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-500 font-bold">{appt.date}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{appt.name}</td>
                              <td className="py-3 px-4 font-black text-slate-600">{appt.healthId}</td>
                              <td className="py-3 px-4 text-indigo-600 font-bold">{appt.department}</td>
                              <td className="py-3 px-4 font-semibold text-slate-700">{appt.hospitalId || 'General Clinic'}</td>
                              <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{appt.message}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-800 uppercase">{appt.status || 'Pending'}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 5. ALL TRANSACTIONS DOCK LOG        */}
                  {/* ========================================== */}
                  {currentView === 'allTransactions' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Date/Time</th>
                          <th className="py-3 px-4">Payer Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Payment ID / Txn ID</th>
                          <th className="py-3 px-4">Scheme Type</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Gateway Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No transaction records generated in the gateway.</td>
                          </tr>
                        ) : (
                          paginatedList.map(txn => (
                            <tr key={txn._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400 font-bold">{new Date(txn.timestamp).toLocaleString()}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{txn.beneficiaryName || 'Donor'}</td>
                              <td className="py-3 px-4 font-medium text-slate-500">{txn.beneficiaryPhone || 'N/A'}</td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-600">{txn.paymentId || txn.orderId}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600 uppercase tracking-wide">
                                  {txn.schemeType}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-black text-indigo-600">₹{txn.amount}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${txn.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {txn.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => { setSelectedPayment(txn); setShowReceiptModal(true); }}
                                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1 justify-end ml-auto"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Receipt
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 6. DONATIONS REGISTER               */}
                  {/* ========================================== */}
                  {currentView === 'donationHistory' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Donor Name</th>
                          <th className="py-3 px-4">Email ID</th>
                          <th className="py-3 px-4">Phone Number</th>
                          <th className="py-3 px-4">PAN Card</th>
                          <th className="py-3 px-4">State</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-12 text-slate-400 font-semibold">No Razorpay online contributions received yet.</td>
                          </tr>
                        ) : (
                          paginatedList.map(don => (
                            <tr key={don._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400 font-bold">{new Date(don.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-black text-slate-800">{don.donor_name}</td>
                              <td className="py-3 px-4 font-medium text-indigo-500">{don.email}</td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{don.phone}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-500">{don.pan || 'N/A'}</td>
                              <td className="py-3 px-4 text-slate-500">{don.state || 'N/A'}</td>
                              <td className="py-3 px-4 font-black text-emerald-600">₹{don.amount}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800 uppercase">Paid</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => { setSelectedDonation(don); setShowDonationModal(true); }}
                                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-[#ED1C24] hover:bg-red-50 transition-all cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Cert
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* ========================================== */}
                  {/*  TABLE 7. AUDIT TRAIL HISTORY              */}
                  {/* ========================================== */}
                  {currentView === 'auditLogs' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Actor Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Action Trail</th>
                          <th className="py-3 px-4">IP Address</th>
                          <th className="py-3 px-4">User Agent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-[10px]">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">No security audits logged.</td>
                          </tr>
                        ) : (
                          paginatedList.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                              <td className="py-3 px-4 font-black text-slate-800">{log.actor?.email || 'System'}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-slate-600">
                                  {log.actor?.role || 'Guest'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-[#ED1C24]">{log.action}</td>
                              <td className="py-3 px-4 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                              <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{log.userAgent}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                </div>

                {/* Smart Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 mt-6 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Showing page <span className="font-extrabold text-slate-900">{currentPage}</span> of <span className="font-extrabold text-slate-900">{totalPages}</span> ({filteredList.length} total entries)
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                          >
                            Prev
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center border px-3 py-2 text-xs font-black cursor-pointer ${
                                currentPage === page
                                  ? 'z-10 bg-[#ED1C24] border-[#ED1C24] text-white'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
          ) : (
            <div className="space-y-6">
              
              {/* Form Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]"></span>
                  Upload New Carousel Image
                </h3>
                
                <form onSubmit={handleCarouselUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Image (Max 5MB)</label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => setNewFile(e.target.files[0])}
                      accept="image/*"
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-[#ED1C24] hover:file:bg-rose-100 cursor-pointer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Slide Title / Alt Text</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Sewing Training Center"
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 outline-none focus:border-[#ED1C24] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort Order</label>
                    <input 
                      type="number" 
                      value={newOrder}
                      onChange={(e) => setNewOrder(Number(e.target.value))}
                      placeholder="e.g. 0, 1, 2"
                      className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 outline-none focus:border-[#ED1C24] transition-all"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {uploading ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" /> Add to Carousel
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Grid Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ED1C24]"></span>
                  Active Slides ({carouselImages.length})
                </h3>

                {carouselLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ED1C24] border-t-transparent"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading slides...</p>
                  </div>
                ) : carouselImages.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-semibold">
                    No custom carousel images uploaded yet. The homepage will display default local images.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {carouselImages.map((img) => (
                      <div key={img._id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/55 p-3">
                        <div className="space-y-3">
                          {/* Image preview */}
                          <div className="relative h-40 w-full rounded-xl overflow-hidden bg-black">
                            <img 
                              src={img.imageUrl} 
                              alt={img.title} 
                              className="w-full h-full object-cover object-center"
                              style={{ objectPosition: '50% 25%' }}
                            />
                            {!img.active && (
                              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                                Inactive
                              </div>
                            )}
                          </div>

                          {/* Editable fields */}
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title / Caption</label>
                              <input 
                                type="text"
                                defaultValue={img.title}
                                onBlur={(e) => handleUpdateCarouselField(img._id, { title: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs text-slate-800 outline-none focus:border-[#ED1C24] transition-all"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sort Order</label>
                                <input 
                                  type="number"
                                  defaultValue={img.order}
                                  onBlur={(e) => handleUpdateCarouselField(img._id, { order: Number(e.target.value) })}
                                  className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs text-slate-800 outline-none focus:border-[#ED1C24] transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCarouselField(img._id, { active: !img.active })}
                                  className={`w-full py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                                    img.active 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                                >
                                  {img.active ? 'Active' : 'Inactive'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-medium">Uploaded {new Date(img.createdAt).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCarouselImage(img._id)}
                            className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* --- MODAL 1. ID CARD PREVIEW --- */}
      {showCardModal && selectedCardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">Employee Pass Preview</h3>
              <button onClick={() => setShowCardModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100">
              <div ref={cardRef} className="w-[280px] h-[440px] rounded-2xl bg-white shadow-lg overflow-hidden relative border border-slate-200 flex flex-col justify-between select-none">
                <div className="bg-[#000080] text-white text-center py-3 px-4 border-b-4 border-[#ED1C24]">
                  <h3 className="m-0 text-base font-black uppercase tracking-wider">Aagaj Foundation</h3>
                  <p className="m-0 text-[8px] font-bold tracking-widest opacity-80 mt-0.5 uppercase">Govt. Registered Trust Act 1882</p>
                </div>
                
                <div className="flex justify-end px-4 pt-2">
                  <div className="border border-red-200 bg-red-50 text-[#ED1C24] font-black text-[9px] px-2 py-0.5 rounded">
                    ID: AF-{selectedCardUser.uniqueId}
                  </div>
                </div>
                
                <div className="flex flex-col items-center mt-1">
                  <img
                    src={selectedCardUser.photoPath ? resolveAssetUrl(selectedCardUser.photoPath) : '/logo.jpg'}
                    alt="Photo"
                    className="w-20 h-20 rounded-full border-4 border-[#ED1C24] object-cover bg-white p-1"
                    onError={handleImageError}
                  />
                </div>
                
                <div className="text-center px-4 mt-1 flex-grow">
                  <h4 className="text-[#000080] text-sm font-black uppercase truncate m-0">{selectedCardUser.fullName}</h4>
                  <p className="text-[#ED1C24] text-[9px] font-black tracking-wider uppercase m-0 mt-0.5">{selectedCardUser.roleApplied || 'NGO Employee'}</p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-left text-[9px] leading-relaxed text-slate-700 mt-2 space-y-0.5">
                    <div><span className="text-[#000080] font-black inline-block w-14">Post:</span> {selectedCardUser.roleApplied || 'N/A'}</div>
                    <div><span className="text-[#000080] font-black inline-block w-14">DOB:</span> {selectedCardUser.dob || 'N/A'}</div>
                    <div><span className="text-[#000080] font-black inline-block w-14">Mobile:</span> {selectedCardUser.mobile || 'N/A'}</div>
                    <div><span className="text-[#000080] font-black inline-block w-14">Email:</span> {selectedCardUser.email || 'N/A'}</div>
                    <div><span className="text-[#000080] font-black inline-block w-14">Dist:</span> {selectedCardUser.district || 'N/A'}</div>
                    <div><span className="text-[#000080] font-black inline-block w-14">State:</span> {selectedCardUser.state || 'BIHAR'}</div>
                  </div>
                </div>
                
                <div className="bg-[#000080] text-white text-center py-1.5 text-[8px] font-bold uppercase tracking-widest">
                  aagajfoundation.com | Helpline: 9431430464
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowCardModal(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close
              </button>
              <button onClick={downloadIDCard} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2 text-xs font-bold shadow-md cursor-pointer">
                <Download className="h-4 w-4" /> Save PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2. ACCESS CREDENTIALS SECURE VIEW --- */}
      {viewCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase">System Security Credentials</h3>
              <button onClick={() => setViewCreds(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Secure Username / ID</p>
              <h5 className="text-base font-black text-slate-800 select-all">{viewCreds.username}</h5>
              <div className="h-px bg-slate-100 my-4"></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Encrypted Password</p>
              <h4 className="text-lg font-black text-emerald-600 select-all">{viewCreds.password}</h4>
              <p className="text-[9px] text-slate-400 mt-3 font-semibold uppercase leading-tight">Credentials successfully provisioned in Aagaj secure data systems.</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button onClick={() => setViewCreds(null)} className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2 text-xs font-bold cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3. GRANT EMPLOYEE PASS --- */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase">Grant Employee Credentials</h3>
              <button onClick={() => setShowAddEmpModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {addEmpError && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">{addEmpError}</div>}
              {addEmpSuccess ? (
                <div className="text-center py-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase">Access Pass Provisioned</h4>
                  <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">System Login Username</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5 select-all">{addEmpSuccess.username}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-3">Initial Password</p>
                    <p className="text-xs font-black text-emerald-600 mt-0.5">As created by Super Admin</p>
                  </div>
                  <button onClick={() => setShowAddEmpModal(false)} className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-6 py-2.5 text-xs font-bold cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddEmpSubmit(onAddEmployeeSubmit)} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Employee Full Name</label>
                    <input type="text" {...regAddEmp('fullName', { required: 'Name is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24]" placeholder="E.g. Vivek Kumar" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Mobile Number</label>
                      <input type="text" {...regAddEmp('mobile', { required: 'Mobile required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24]" placeholder="10 Digit Number" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Official Email</label>
                      <input type="email" {...regAddEmp('email', { required: 'Email is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24]" placeholder="name@aagaj.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-rose-600">Access Login Password</label>
                    <input type="text" {...regAddEmp('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24]" placeholder="Create unique password" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Designation / Profile Role</label>
                    <select {...regAddEmp('designation')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs bg-white outline-none focus:border-[#ED1C24] cursor-pointer">
                      <option value="Panchayat Coordinator">Panchayat Coordinator</option>
                      <option value="Block Coordinator">Block Coordinator</option>
                      <option value="District Coordinator">District Coordinator</option>
                      <option value="Health Supervisor">Health Supervisor</option>
                      <option value="Mahila Mitra">Mahila Mitra</option>
                      <option value="Skill Trainer">Skill Trainer</option>
                      <option value="Trainer">Trainer</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Assign District</label>
                      <input type="text" {...regAddEmp('district')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" placeholder="E.g. Patna" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Assign State</label>
                      <input type="text" {...regAddEmp('state')} defaultValue="Bihar" className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                    </div>
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-4 py-2.5 text-xs font-bold cursor-pointer transition-all duration-150">
                    Register Access Pass
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4. REGISTER NEW PARTNER HOSPITAL --- */}
      {showAddHospModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between bg-[#ED1C24] text-white p-4">
              <h3 className="text-sm font-extrabold uppercase tracking-tight flex items-center gap-1.5">
                <HeartPulse className="h-4.5 w-4.5 text-white animate-pulse" /> Register New Hospital Partner
              </h3>
              <button onClick={() => setShowAddHospModal(false)} className="rounded-lg p-1 text-white hover:bg-red-700/50 cursor-pointer transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {addHospError && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-[#ED1C24] border border-rose-100">{addHospError}</div>}
              
              <form onSubmit={handleAddHospSubmit(onAddHospitalSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Business Name (Hospital Name)</label>
                    <input type="text" {...regAddHosp('biz', { required: 'Hospital Name is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="Aagaj Hospital" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">License Number</label>
                    <input type="text" {...regAddHosp('license', { required: 'License is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="LIC/2026/01" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Specialization / Categories (Add multiple)</label>
                    <input type="text" list="specializations-list" {...regAddHosp('specialization')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="Select or type to add custom..." />
                    <datalist id="specializations-list">
                      <option value="General Medicine" />
                      <option value="Cardiology ❤️" />
                      <option value="Orthopedics 🦴" />
                      <option value="Neurology 🧠" />
                      <option value="Pediatrics 👶" />
                      <option value="Dermatology ✨" />
                      <option value="Gynecology 🤰" />
                      <option value="Patholab 🔬" />
                      <option value="Chemist Shop 💊" />
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Owner Name</label>
                    <input type="text" {...regAddHosp('owner', { required: 'Owner name required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">WhatsApp Number</label>
                    <input type="text" {...regAddHosp('phone', { required: 'Contact required', pattern: { value: /^\d{10}$/, message: '10 digits' } })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="10 digit number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">City</label>
                    <input type="text" {...regAddHosp('city', { required: 'City required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">State</label>
                    <input type="text" {...regAddHosp('state', { required: 'State required' })} defaultValue="Bihar" className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="Bihar" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Pincode</label>
                    <input type="text" {...regAddHosp('pin', { required: 'Pincode required', pattern: { value: /^\d{6}$/, message: '6 digits' } })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2">
                  <h4 className="text-xs font-black text-[#ED1C24] uppercase tracking-wide">Set Partner Login Access</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Login ID (Email Address)</label>
                    <input type="email" {...regAddHosp('email', { required: 'Hospital email is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="hospital@foundation.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Set Secure Password</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" {...regAddHosp('hashPass', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} className="block flex-grow rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs placeholder-slate-400 outline-none focus:border-[#ED1C24] transition-colors" placeholder="Min 6 chars" />
                      <button type="button" onClick={generatePassword} className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs px-3 font-bold transition-all cursor-pointer active:scale-95">Gen</button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white mt-5 py-3.5 text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md active:scale-[0.98]">
                  COMPLETE REGISTRATION
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5. EDIT SWASTHYA HOSPITAL --- */}
      {showEditHospModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5"><HeartPulse className="h-4.5 w-4.5 text-indigo-600" /> Edit Hospital - HOSP-{selectedHospital.uniqueId}</h3>
              <button onClick={() => setShowEditHospModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {editHospError && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">{editHospError}</div>}
              
              <form onSubmit={handleEditHospSubmit(onEditHospitalSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Business / Hospital Name</label>
                    <input type="text" defaultValue={selectedHospital.businessName} {...regEditHosp('biz', { required: 'Hospital Name required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">NABH / License Number</label>
                    <input type="text" defaultValue={selectedHospital.licenseNumber} {...regEditHosp('license', { required: 'License required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500">Hospital Registered Email ID</label>
                  <input type="email" defaultValue={selectedHospital.email} {...regEditHosp('email', { required: 'Email required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Authorized Owner</label>
                    <input type="text" defaultValue={selectedHospital.contact?.ownerName} {...regEditHosp('owner', { required: 'Owner required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">WhatsApp / Contact</label>
                    <input type="text" defaultValue={selectedHospital.contact?.whatsappNumber} {...regEditHosp('phone', { required: 'Phone required', pattern: { value: /^\d{10}$/, message: '10 digits' } })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Specializations (Comma separated)</label>
                    <input type="text" list="specializations-list" defaultValue={selectedHospital.specialization?.join(', ')} {...regEditHosp('specialization')} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">City</label>
                    <input type="text" defaultValue={selectedHospital.address?.city} {...regEditHosp('city', { required: 'City required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">State</label>
                    <input type="text" defaultValue={selectedHospital.address?.state} {...regEditHosp('state', { required: 'State required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500">Pincode</label>
                    <input type="text" defaultValue={selectedHospital.address?.pincode} {...regEditHosp('pin', { required: 'Pin required', pattern: { value: /^\d{6}$/, message: '6 digits' } })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                  </div>
                </div>

                <button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-4 py-3 text-xs font-bold cursor-pointer transition-all">
                  Save Changes
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6. PROVISION HOSPITAL SYSTEM CREDENTIALS --- */}
      {showCredsHospModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5"><Lock className="h-4.5 w-4.5 text-amber-500" /> Gen Credentials - {selectedHospital.businessName}</h3>
              <button onClick={() => setShowCredsHospModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {credHospError && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">{credHospError}</div>}
              
              <form onSubmit={handleCredHospSubmit(onCredHospitalSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500">Hospital Login ID (Unique)</label>
                  <input type="text" defaultValue={`HOSP-${selectedHospital.uniqueId}`} {...regCredHosp('loginId', { required: 'Login ID is required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs font-mono outline-none focus:border-[#ED1C24]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500">Official Access Email</label>
                  <input type="email" defaultValue={selectedHospital.email} {...regCredHosp('email', { required: 'Email required' })} className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 text-rose-600">Assign New Login Password</label>
                  <input type="password" {...regCredHosp('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" placeholder="At least 6 characters" />
                </div>

                <button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-4 py-3 text-xs font-bold cursor-pointer transition-all">
                  Provision Hospital Credentials
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 7. PRINTABLE SCHEME TRANSACTION INVOICE --- */}
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
                    <p className="m-0 font-extrabold text-slate-900">{selectedPayment.beneficiaryName || 'Applicant'}</p>
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
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer animate-pulse">
                <Printer className="h-4 w-4" /> Print Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 8. PRINTABLE 80G DONATION CERTIFICATE --- */}
      {showDonationModal && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1"><Printer className="h-4 w-4" /> 80G Donation Certificate</h3>
              <button onClick={() => setShowDonationModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto bg-slate-100 flex justify-center">
              {/* Receipt Area wrapper */}
              <div id="printable-area" className="w-full max-w-[420px] bg-white border-4 border-[#000080] p-6 rounded shadow-md font-sans text-slate-800 relative">
                
                {/* Thin inner gold border */}
                <div className="border border-[#fdd831] p-4 flex flex-col h-full justify-between">
                  
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h2 className="m-0 text-[#000080] text-lg font-black uppercase tracking-wider">Aagaj Foundation</h2>
                    <p className="m-0 text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Registered Public Charitable Trust Act 1882</p>
                    <p className="m-0 text-[8px] font-extrabold text-[#ED1C24] uppercase mt-0.5 tracking-wider">Income Tax Exemption 80G Provision Registered</p>
                  </div>

                  <div className="mt-4 text-center">
                    <h4 className="m-0 text-[#000080] text-xs font-black uppercase tracking-widest border-y border-slate-200 py-1.5 bg-slate-50">Donation Receipt & Certificate</h4>
                  </div>

                  <div className="mt-4 text-[10px] leading-relaxed text-slate-600 text-justify">
                    <p className="m-0">This is to certify and thank <strong className="text-slate-900 uppercase font-black">{selectedDonation.donor_name}</strong>, residing at <strong className="text-slate-900 font-bold">{selectedDonation.address || 'N/A'}, {selectedDonation.city || ''}, {selectedDonation.state || ''} ({selectedDonation.pincode || ''})</strong>, for their generous online financial contribution of <strong className="text-emerald-600 font-extrabold">₹{selectedDonation.amount}.00</strong> towards social rehabilitation and mahila empowerment schemes of Aagaj Foundation.</p>
                  </div>

                  <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] space-y-1">
                    <div><span className="text-[#000080] font-bold inline-block w-20">PAN CARD NO:</span> <strong className="text-slate-900 font-mono font-bold uppercase">{selectedDonation.pan || 'N/A'}</strong></div>
                    <div><span className="text-[#000080] font-bold inline-block w-20">RECEIPT NO:</span> <strong className="text-slate-900 font-mono">{selectedDonation.payment_id}</strong></div>
                    <div><span className="text-[#000080] font-bold inline-block w-20">ORDER REF:</span> <strong className="text-slate-900 font-mono">{selectedDonation.order_id}</strong></div>
                    <div><span className="text-[#000080] font-bold inline-block w-20">DATE OF TXN:</span> <strong className="text-slate-900">{new Date(selectedDonation.date).toLocaleDateString()}</strong></div>
                  </div>

                  <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-200">
                    <div className="text-center w-28">
                      <div className="h-6"></div>
                      <div className="border-t border-slate-300 pt-1 text-[8px] uppercase font-bold text-slate-400">DONOR SIGN</div>
                    </div>
                    <div className="text-center w-32 border border-slate-100 bg-slate-50/50 p-1 rounded relative">
                      <span className="absolute inset-0 flex items-center justify-center font-black text-[9px] text-red-500/20 rotate-12 select-none">AAGAJ FOUNDATION</span>
                      <img src="/logo.jpg" alt="Seal" className="h-6 mx-auto opacity-70" />
                      <div className="border-t border-slate-300 pt-1 text-[8px] uppercase font-bold text-slate-400 mt-1">TRUSTEE SEAL</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowDonationModal(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close Certificate
              </button>
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer animate-pulse">
                <Printer className="h-4 w-4" /> Print Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 9. PRINTABLE HEALTH CARD VIEWER --- */}
      {showHealthCardModal && selectedHealthCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <div className="p-6 bg-slate-105 flex flex-col items-center gap-6 overflow-y-auto w-full">
              {/* Card Front & Back wrapper for Printing/Downloading */}
              <div id="printable-area" className="flex flex-col gap-6 items-center w-full bg-slate-105">
                
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
                              crossOrigin="anonymous"
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

export default AdminDashboard;
