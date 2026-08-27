import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import html2canvas from 'html2canvas-pro';
import { transliterateToHindi } from '../utils/transliterate';
import PartnershipCertificate from '../components/PartnershipCertificate';
import MembershipCertificate from '../components/MembershipCertificate';
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
  resetHospitalPassword,
  getHospitalGlobalReports,
  getHospitalAuditLogs,
  getHospitalActivity,
  getEmployeeActivity,
  getAdminTransactions,
  editHealthCardDetails,
  deleteMembership,
  toggleApplicantStatus
} from '../api/userApi';
import { getAdminAttendanceReport, getEmployeeAttendanceDossier } from '../api/attendanceApi';
import apiClient from '../api/apiClient';
import { resolveAssetUrl, compressImageFile } from '../utils/cardDownloadUtils';
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
  Home,
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
  Image,
  Award,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user, updateUser } = useAuth();
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
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

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

  // Employee Attendance Report States
  const [attendanceReport, setAttendanceReport] = useState({ date: '', stats: {}, report: [] });
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceReportLoading, setAttendanceReportLoading] = useState(false);
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('All');
  const [selectedEmployeeDossier, setSelectedEmployeeDossier] = useState(null);
  const [showAttendanceDossierModal, setShowAttendanceDossierModal] = useState(false);
  const [dossierLoading, setDossierLoading] = useState(false);

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
  const [cardPhotoUrl, setCardPhotoUrl] = useState('/logo.jpg');
  const [healthCardPhotoUrl, setHealthCardPhotoUrl] = useState('/logo.jpg');

  // Certificate Modals
  const [selectedCertBeneficiary, setSelectedCertBeneficiary] = useState(null);
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [showCertPreviewModal, setShowCertPreviewModal] = useState(false);
  const [selectedCertData, setSelectedCertData] = useState(null);
  const [certFormSubmitting, setCertFormSubmitting] = useState(false);
  const [certFormError, setCertFormError] = useState('');
  const certRef = useRef(null);

  // Partnership Certificate States
  const [selectedPartnershipCert, setSelectedPartnershipCert] = useState(null);
  const [showIssuePartnershipCertModal, setShowIssuePartnershipCertModal] = useState(false);
  const [showPartnershipCertModal, setShowPartnershipCertModal] = useState(false);
  const [partnershipCertSubmitting, setPartnershipCertSubmitting] = useState(false);
  const [partnershipCertError, setPartnershipCertError] = useState('');

  // Membership Master States
  const [memberships, setMemberships] = useState([]);
  const [selectedMembershipCert, setSelectedMembershipCert] = useState(null);
  const [showMembershipCertModal, setShowMembershipCertModal] = useState(false);

  // Patient Bill Receipt Preview Modal State
  const [selectedBillReceipt, setSelectedBillReceipt] = useState(null);
  const [showBillReceiptModal, setShowBillReceiptModal] = useState(false);
  const [activeReceiptIndex, setActiveReceiptIndex] = useState(0);

  // Admin Profile & Security Settings States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('password'); // 'password' | 'profile'
  
  // Profile Form States
  const [profileFullName, setProfileFullName] = useState(user?.fullName || 'Administrator');
  const [profileEmail, setProfileEmail] = useState(user?.email || sessionStorage.getItem('adminEmail') || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      if (user.fullName) setProfileFullName(user.fullName);
      const emailVal = user.email || sessionStorage.getItem('adminEmail');
      if (emailVal) setProfileEmail(emailVal);
    }
  }, [user]);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak (कमजोर)', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium (मध्यम)', color: 'bg-amber-500' };
    return { score, label: 'Strong (मजबूत)', color: 'bg-emerald-500' };
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setProfileSubmitting(true);

    try {
      const activeEmail = user?.email || sessionStorage.getItem('adminEmail') || profileEmail;
      const res = await apiClient.put('/api/admin/register/update-profile', {
        currentEmail: activeEmail,
        fullName: profileFullName,
        newEmail: profileEmail
      });

      if (res.data && res.data.success) {
        setProfileSuccessMsg('Profile details updated successfully!');
        if (updateUser) {
          updateUser({ fullName: profileFullName, email: profileEmail });
        }
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        setProfileErrorMsg(res.data?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(err.response?.data?.message || 'Server error updating profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your Current Password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match!');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const activeEmail = user?.email || sessionStorage.getItem('adminEmail') || profileEmail;
      const res = await apiClient.post('/api/admin/register/change-password', {
        email: activeEmail,
        currentPassword,
        newPassword
      });

      if (res.data && res.data.success) {
        setPasswordSuccessMsg('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 4000);
      } else {
        setPasswordErrorMsg(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordErrorMsg(err.response?.data?.message || 'Server error changing password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const [certStartDate, setCertStartDate] = useState('');
  const [certDuration, setCertDuration] = useState('2 माह');
  const [certEndDate, setCertEndDate] = useState('');

  // Hindi Name Editing State for Certificates
  const [certNameHindi, setCertNameHindi] = useState('');
  const [certGuardianHindi, setCertGuardianHindi] = useState('');
  const [certNameEng, setCertNameEng] = useState('');
  const [certGuardianEng, setCertGuardianEng] = useState('');
  const [isUpdatingCertNames, setIsUpdatingCertNames] = useState(false);
  const [certNameUpdateSuccess, setCertNameUpdateSuccess] = useState('');

  useEffect(() => {
    if (selectedCertBeneficiary) {
      let sDate = '';
      if (selectedCertBeneficiary.trainingDate && selectedCertBeneficiary.trainingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        sDate = selectedCertBeneficiary.trainingDate;
      } else {
        sDate = new Date().toISOString().split('T')[0];
      }
      setCertStartDate(sDate);
      
      const dur = selectedCertBeneficiary.trainingDuration || '2 माह';
      setCertDuration(dur);

      const nameH = selectedCertBeneficiary.nameInHindi || transliterateToHindi(selectedCertBeneficiary.name);
      const gH = selectedCertBeneficiary.guardianNameInHindi || transliterateToHindi(selectedCertBeneficiary.guardianName);
      setCertNameHindi(nameH);
      setCertGuardianHindi(gH);
      setCertNameEng(selectedCertBeneficiary.name || '');
      setCertGuardianEng(selectedCertBeneficiary.guardianName || '');
    }
  }, [selectedCertBeneficiary]);

  useEffect(() => {
    if (selectedCertData) {
      const nameH = selectedCertData.nameInHindi || transliterateToHindi(selectedCertData.name);
      const gH = selectedCertData.guardianNameInHindi || transliterateToHindi(selectedCertData.guardianName);
      setCertNameHindi(nameH);
      setCertGuardianHindi(gH);
      setCertNameEng(selectedCertData.name || '');
      setCertGuardianEng(selectedCertData.guardianName || '');
      setCertNameUpdateSuccess('');
    }
  }, [selectedCertData]);

  const handleUpdateCertNames = async (id) => {
    if (!id) return;
    setIsUpdatingCertNames(true);
    setCertNameUpdateSuccess('');
    try {
      const response = await apiClient.put(`/api/schemes/admin/update-certificate-names/${id}`, {
        name: certNameEng,
        guardianName: certGuardianEng,
        nameInHindi: certNameHindi,
        guardianNameInHindi: certGuardianHindi
      });
      if (response.data && response.data.success) {
        setCertNameUpdateSuccess('नाम सफलतापूर्वक अपडेट हो गया!');
        setSelectedCertData(prev => prev ? { 
          ...prev, 
          name: certNameEng, 
          guardianName: certGuardianEng, 
          nameInHindi: certNameHindi, 
          guardianNameInHindi: certGuardianHindi 
        } : prev);
        syncData();
        setTimeout(() => setCertNameUpdateSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating names');
    } finally {
      setIsUpdatingCertNames(false);
    }
  };

  useEffect(() => {
    if (certStartDate && certDuration) {
      const date = new Date(certStartDate);
      if (!isNaN(date.getTime())) {
        const monthsMatch = certDuration.match(/\d+/);
        const months = monthsMatch ? parseInt(monthsMatch[0], 10) : 2;
        date.setMonth(date.getMonth() + months);
        setCertEndDate(date.toISOString().split('T')[0]);
      }
    }
  }, [certStartDate, certDuration]);

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

  // Hospital Password Reset State & Form Hook
  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [resetPassError, setResetPassError] = useState('');
  const { register: regResetPass, handleSubmit: handleResetPassSubmit, formState: { errors: resetPassErrors }, reset: resetResetPassForm } = useForm();

  // Hospital Activity Report Modal States
  const [showHospActivityModal, setShowHospActivityModal] = useState(false);
  const [hospActivityData, setHospActivityData] = useState(null);
  const [hospActivityLoading, setHospActivityLoading] = useState(false);
  const [hospActivityError, setHospActivityError] = useState('');

  // Employee Activity Report Modal States
  const [showEmpActivityModal, setShowEmpActivityModal] = useState(false);
  const [empActivityData, setEmpActivityData] = useState(null);
  const [empActivityLoading, setEmpActivityLoading] = useState(false);
  const [empActivityError, setEmpActivityError] = useState('');

  // Health Card Full Details View Modal
  const [selectedHealthCardDetails, setSelectedHealthCardDetails] = useState(null);
  const [showHealthCardDetailsModal, setShowHealthCardDetailsModal] = useState(false);

  // Edit Health Card Modal States
  const [showEditHealthCardModal, setShowEditHealthCardModal] = useState(false);
  const [selectedEditHealthCard, setSelectedEditHealthCard] = useState(null);
  const [selectedEditHealthCardPhoto, setSelectedEditHealthCardPhoto] = useState(null);
  const [editHealthCardPhotoPreview, setEditHealthCardPhotoPreview] = useState(null);
  const [editHealthCardError, setEditHealthCardError] = useState('');
  const [editHealthCardSuccess, setEditHealthCardSuccess] = useState('');
  const [editHealthCardSubmitting, setEditHealthCardSubmitting] = useState(false);
  const [editFamilyMembers, setEditFamilyMembers] = useState([]);
  
  const { 
    register: regEditHealthCard, 
    handleSubmit: handleEditHealthCardSubmit, 
    formState: { errors: editHealthCardErrors }, 
    reset: resetEditHealthCardForm, 
    setValue: setEditHealthCardValue,
    watch: watchEditHealthCard
  } = useForm();
  const editCardTypeWatch = watchEditHealthCard('cardType', 'Single');

  // Membership Full Details & Edit Modal States
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [selectedEditMemberPhoto, setSelectedEditMemberPhoto] = useState(null);
  const [editMemberPhotoPreview, setEditMemberPhotoPreview] = useState(null);
  const [editMemberError, setEditMemberError] = useState('');
  const [editMemberSuccess, setEditMemberSuccess] = useState('');
  const [editMemberSubmitting, setEditMemberSubmitting] = useState(false);

  const { 
    register: regEditMember, 
    handleSubmit: handleEditMemberSubmit, 
    formState: { errors: editMemberErrors }, 
    reset: resetEditMemberForm, 
    setValue: setEditMemberValue,
    watch: watchEditMember
  } = useForm();


  const { register: regCustomCard, handleSubmit: handleCustomCardSubmit, formState: { errors: customCardErrors }, reset: resetCustomCardForm, setValue: setCustomCardValue, watch: watchCustomCard } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      job_category: 'NGO',
      amount: 499
    }
  });

  const [customCardPhotoFile, setCustomCardPhotoFile] = useState(null);
  const [customCardPhotoPreview, setCustomCardPhotoPreview] = useState(null);
  const [customCardSubmitting, setCustomCardSubmitting] = useState(false);
  const [customCardError, setCustomCardError] = useState('');

  // Custom Health Card Form states & hooks
  const { register: regCustomHealthCard, handleSubmit: handleCustomHealthCardSubmit, formState: { errors: customHealthCardErrors }, reset: resetCustomHealthCardForm, setValue: setCustomHealthCardValue, watch: watchCustomHealthCard } = useForm({
    defaultValues: {
      cardType: 'Single',
      gender: 'Male',
      bloodGroup: 'A+',
      state: 'BIHAR',
      amount: 201
    }
  });
  const [customHealthCardPhotoFile, setCustomHealthCardPhotoFile] = useState(null);
  const [customHealthCardPhotoPreview, setCustomHealthCardPhotoPreview] = useState(null);
  const [customHealthCardSubmitting, setCustomHealthCardSubmitting] = useState(false);
  const [customHealthCardError, setCustomHealthCardError] = useState('');
  const [customFamilyMembers, setCustomFamilyMembers] = useState([
    { relationship: 'Father', fullName: '', age: '', gender: 'Male', aadhar: '' },
    { relationship: 'Mother', fullName: '', age: '', gender: 'Female', aadhar: '' },
    { relationship: 'Child 1', fullName: '', age: '', gender: 'Male', aadhar: '' },
    { relationship: 'Child 2', fullName: '', age: '', gender: 'Male', aadhar: '' }
  ]);

  // Custom Silayi Yojana Form states & hooks
  const { register: regCustomSilayi, handleSubmit: handleCustomSilayiSubmit, formState: { errors: customSilayiErrors }, reset: resetCustomSilayiForm } = useForm({
    defaultValues: {
      gender: 'Female',
      amount: 799,
      trainingName: 'Sewing machine training',
      existingSkills: 'None',
      trainingDuration: '3 Months',
      trainingDate: new Date().toLocaleDateString('en-IN')
    }
  });
  const [customSilayiPhotoFile, setCustomSilayiPhotoFile] = useState(null);
  const [customSilayiPhotoPreview, setCustomSilayiPhotoPreview] = useState(null);
  const [customSilayiSubmitting, setCustomSilayiSubmitting] = useState(false);
  const [customSilayiError, setCustomSilayiError] = useState('');
  // Fetch all stats and tables
  const syncData = async () => {
    setLoading(true);
    try {
      const [appRes, benRes, apptRes, hcRes, txnRes, donRes, hospStatsRes, hospListRes, hospBillsRes, auditRes, enquiriesRes, memRes] = await Promise.all([
        getAllApplicants().catch(err => []),
        getAllBeneficiaries().catch(err => []),
        getAllAppointments().catch(err => ({ success: false, data: [] })),
        apiClient.get('/api/healthcard/all').catch(err => ({ data: { success: false, data: [] } })),
        getAdminTransactions().catch(err => ({ success: false, data: [] })),
        apiClient.get('/api/donation/get-history').catch(err => ({ data: [] })),
        getHospitalAdminStats().catch(err => ({ success: false, stats: {} })),
        getHospitalAdminHospitals().catch(err => ({ success: false, data: [] })),
        getHospitalGlobalReports().catch(err => ({ success: false, data: [] })),
        getHospitalAuditLogs().catch(err => ({ success: false, data: [] })),
        apiClient.get('/api/admin/enquiries/all').catch(err => ({ data: { success: false, data: [] } })),
        apiClient.get('/api/membership/all').catch(err => ({ data: { success: false, data: [] } }))
      ]);

      setApplicants(Array.isArray(appRes) ? appRes : []);
      setBeneficiaries(Array.isArray(benRes) ? benRes : []);
      setAppointments(apptRes.success ? apptRes.data : []);
      setHealthCards(hcRes.data?.success ? hcRes.data.data : []);
      setTransactions(txnRes.success ? txnRes.data : []);
      setDonations(Array.isArray(donRes.data) ? donRes.data : (Array.isArray(donRes) ? donRes : []));
      setAuditLogs(auditRes.success ? auditRes.data : []);
      setEnquiries(enquiriesRes.data?.success ? enquiriesRes.data.data : []);
      setMemberships(memRes.data?.success ? memRes.data.data : (Array.isArray(memRes.data?.data) ? memRes.data.data : []));

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

  // Fetch Attendance Report for Admin
  const fetchAdminAttendanceReport = async (targetDate = attendanceDate) => {
    setAttendanceReportLoading(true);
    try {
      const res = await getAdminAttendanceReport(targetDate);
      if (res.success) {
        setAttendanceReport({
          date: res.date,
          stats: res.stats || {},
          report: res.report || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch admin attendance report", err);
    } finally {
      setAttendanceReportLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'employeeAttendance') {
      fetchAdminAttendanceReport(attendanceDate);
    }
  }, [currentView, attendanceDate]);

  // View specific employee attendance dossier modal
  const handleViewEmployeeAttendance = async (email) => {
    if (!email) return;
    setDossierLoading(true);
    setShowAttendanceDossierModal(true);
    try {
      const res = await getEmployeeAttendanceDossier(email);
      if (res.success) {
        setSelectedEmployeeDossier(res);
      } else {
        alert(res.message || 'Failed to load employee attendance dossier');
      }
    } catch (err) {
      console.error("Failed to fetch employee dossier", err);
    } finally {
      setDossierLoading(false);
    }
  };

  const formatActiveSecondsToHM = (secs) => {
    if (!secs || secs <= 0) return '0h 0m';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

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

  const formatToIndianDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    if (!selectedCertBeneficiary) return;
    
    setCertFormSubmitting(true);
    setCertFormError('');
    
    const formEl = e.currentTarget;
    const certNo = formEl.certificateNo.value;
    const certDate = formEl.certificateDate.value;
    const trainingStartDate = formEl.trainingStartDate.value;
    const trainingEndDate = formEl.trainingEndDate.value;
    const trainingGrade = formEl.trainingGrade.value;
    
    try {
      const response = await apiClient.put(`/api/schemes/admin/issue-certificate/${selectedCertBeneficiary._id}`, {
        certificateNo: certNo,
        certificateDate: certDate,
        trainingStartDate: trainingStartDate,
        trainingEndDate: trainingEndDate,
        trainingGrade: trainingGrade
      });
      
      if (response.data && response.data.success) {
        alert("Certificate issued successfully!");
        setShowIssueCertModal(false);
        setBeneficiaries(prev => prev.map(b => b._id === selectedCertBeneficiary._id ? response.data.data : b));
        setSelectedCertData(response.data.data);
        setShowCertPreviewModal(true);
      } else {
        setCertFormError(response.data?.message || "Failed to issue certificate.");
      }
    } catch (err) {
      console.error(err);
      setCertFormError(err.response?.data?.message || "Server connection error.");
    } finally {
      setCertFormSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!id) return;
    if (!window.confirm("क्या आप वाकई इस सदस्यता रिकॉर्ड को हटाना चाहते हैं? (Are you sure you want to delete this membership record?)")) {
      return;
    }
    try {
      const res = await deleteMembership(id);
      if (res && res.success) {
        alert("सदस्यता रिकॉर्ड सफलतापूर्वक हटा दिया गया!");
        setMemberships(prev => prev.filter(m => m._id !== id));
      } else {
        alert(res?.message || "हटाने में विफलता हुई।");
      }
    } catch (err) {
      console.error("Error deleting member record:", err);
      alert(err.response?.data?.message || "सदस्यता रिकॉर्ड हटाने में त्रुटि हुई।");
    }
  };

  // --- UNIFIED MEMBERSHIP DETAILS & EDIT HANDLERS ---
  const handleOpenMemberDetails = (member) => {
    setSelectedMemberDetails(member);
    setSelectedEditMemberPhoto(null);
    setEditMemberPhotoPreview(member.photoUrl ? resolveAssetUrl(member.photoUrl) : '/logo.jpg');
    setEditMemberError('');
    setEditMemberSuccess('');

    resetEditMemberForm({
      fullName: member.fullName || '',
      fatherOrHusbandName: member.fatherOrHusbandName || '',
      dobOrAge: member.dobOrAge || '',
      gender: member.gender || 'Female',
      mobileNumber: member.mobileNumber || '',
      email: member.email || '',
      aadhaarNumber: member.aadhaarNumber || '',
      panNumber: member.panNumber || '',
      address: member.address || '',
      city: member.city || '',
      district: member.district || '',
      state: member.state || 'Bihar',
      pincode: member.pincode || '',
      occupation: member.occupation || '',
      organization: member.organization || '',
      membershipType: member.membershipType || 'General Member',
      joiningDate: member.joiningDate || new Date().toISOString().split('T')[0],
      interestAreas: Array.isArray(member.interestAreas) ? member.interestAreas.join(', ') : (member.interestAreas || ''),
      paymentAmount: member.paymentAmount || 100,
      paymentStatus: member.paymentStatus || 'Paid',
      certificateNo: member.certificateNo || ''
    });

    setShowMemberDetailsModal(true);
  };

  const handleEditMemberPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file: compressedFile, dataUrl } = await compressImageFile(file, 800, 0.85);
        setSelectedEditMemberPhoto(compressedFile);
        setEditMemberPhotoPreview(dataUrl);
      } catch (err) {
        setSelectedEditMemberPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => setEditMemberPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmitEditMember = async (data) => {
    setEditMemberSubmitting(true);
    setEditMemberError('');
    setEditMemberSuccess('');

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });

      if (selectedEditMemberPhoto) {
        formData.append('photo', selectedEditMemberPhoto);
      }

      const res = await apiClient.put(`/api/membership/admin/edit/${selectedMemberDetails._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setEditMemberSuccess("सदस्यता का विवरण सफलतापूर्वक अपडेट हो गया!");
        const updated = res.data.data;
        setSelectedMemberDetails(updated);
        setMemberships(prev => prev.map(m => m._id === updated._id ? updated : m));
        syncData();
        setTimeout(() => {
          setEditMemberSuccess('');
        }, 3500);
      } else {
        setEditMemberError(res.data?.message || "विवरण अपडेट करने में विफलता हुई।");
      }
    } catch (err) {
      console.error("Admin Edit Member Error:", err);
      setEditMemberError(err.response?.data?.message || "सर्वर त्रुटि: विवरण अपडेट नहीं हो सका।");
    } finally {
      setEditMemberSubmitting(false);
    }
  };

  // --- UNIFIED HEALTH CARD DETAILS & EDIT HANDLERS ---
  const handleOpenHealthCardDetails = (card) => {
    setSelectedHealthCardDetails(card);
    setSelectedEditHealthCard(card);
    setSelectedEditHealthCardPhoto(null);
    setEditHealthCardPhotoPreview(card.photoPath ? resolveAssetUrl(card.photoPath) : '/logo.jpg');
    setEditHealthCardError('');
    setEditHealthCardSuccess('');

    if (Array.isArray(card.familyMembers) && card.familyMembers.length > 0) {
      setEditFamilyMembers(card.familyMembers);
    } else {
      setEditFamilyMembers([
        { relationship: 'Father', fullName: '', age: '', gender: 'Male', aadhar: '' },
        { relationship: 'Mother', fullName: '', age: '', gender: 'Female', aadhar: '' },
        { relationship: 'Child 1', fullName: '', age: '', gender: 'Male', aadhar: '' },
        { relationship: 'Child 2', fullName: '', age: '', gender: 'Male', aadhar: '' }
      ]);
    }

    resetEditHealthCardForm({
      fullName: card.fullName || '',
      mobile: card.mobile || '',
      email: card.email || '',
      aadhar: card.aadhar || '',
      age: card.age || '',
      gender: card.gender || 'Male',
      bloodGroup: card.bloodGroup || 'A+',
      village: card.address?.village || card.village || '',
      panchayat: card.address?.panchayat || card.panchayat || '',
      block: card.address?.block || card.block || '',
      district: card.address?.district || card.district || '',
      state: card.address?.state || card.state || 'Bihar',
      pincode: card.address?.pincode || card.pincode || '',
      cardType: card.cardType || 'Single',
      registeredBy: card.registeredBy || 'Self',
      expiryDate: card.expiryDate ? new Date(card.expiryDate).toISOString().split('T')[0] : ''
    });

    setShowHealthCardDetailsModal(true);
  };

  const handleEditPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file: compressedFile, dataUrl } = await compressImageFile(file, 800, 0.85);
        setSelectedEditHealthCardPhoto(compressedFile);
        setEditHealthCardPhotoPreview(dataUrl);
      } catch (err) {
        setSelectedEditHealthCardPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => setEditHealthCardPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleEditFamilyMemberChange = (index, field, value) => {
    const updated = [...editFamilyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setEditFamilyMembers(updated);
  };

  const handleAddEditFamilyMember = () => {
    setEditFamilyMembers(prev => [
      ...prev,
      { relationship: 'Member', fullName: '', age: '', gender: 'Male', aadhar: '' }
    ]);
  };

  const handleRemoveEditFamilyMember = (index) => {
    setEditFamilyMembers(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmitEditHealthCard = async (formDataValues) => {
    if (!selectedEditHealthCard) return;
    setEditHealthCardSubmitting(true);
    setEditHealthCardError('');
    setEditHealthCardSuccess('');

    try {
      const data = new FormData();
      data.append('fullName', formDataValues.fullName);
      data.append('mobile', formDataValues.mobile);
      data.append('email', formDataValues.email || '');
      data.append('aadhar', formDataValues.aadhar);
      data.append('age', formDataValues.age);
      data.append('gender', formDataValues.gender);
      data.append('bloodGroup', formDataValues.bloodGroup);
      data.append('village', formDataValues.village || '');
      data.append('panchayat', formDataValues.panchayat || '');
      data.append('block', formDataValues.block || '');
      data.append('district', formDataValues.district || '');
      data.append('state', formDataValues.state || 'Bihar');
      data.append('pincode', formDataValues.pincode || '');
      data.append('cardType', formDataValues.cardType || 'Single');
      data.append('registeredBy', formDataValues.registeredBy || 'Self');
      data.append('expiryDate', formDataValues.expiryDate || '');

      if (formDataValues.cardType === 'Family') {
        data.append('familyMembers', JSON.stringify(editFamilyMembers));
      }

      if (selectedEditHealthCardPhoto) {
        data.append('photo', selectedEditHealthCardPhoto);
      }

      const res = await apiClient.put(`/api/healthcard/admin/edit/${selectedEditHealthCard._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setEditHealthCardSuccess('Health Card details and photo updated successfully!');
        setSelectedHealthCardDetails(res.data.data);
        setSelectedEditHealthCard(res.data.data);
        setHealthCards(prev => prev.map(c => c._id === selectedEditHealthCard._id ? res.data.data : c));
        
        setTimeout(() => {
          setEditHealthCardSuccess('');
          syncData();
        }, 1500);
      } else {
        setEditHealthCardError(res.data?.message || 'Failed to update health card.');
      }
    } catch (err) {
      console.error(err);
      setEditHealthCardError(err.response?.data?.message || 'Server error updating health card.');
    } finally {
      setEditHealthCardSubmitting(false);
    }
  };

  // Resolve Employee Pass Card photo to local blob URL to bypass CORS
  useEffect(() => {
    let active = true;
    let localUrl = '';

    if (selectedCardUser && selectedCardUser.photoPath) {
      const url = resolveAssetUrl(selectedCardUser.photoPath);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setCardPhotoUrl(localUrl);
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
                  setCardPhotoUrl(localUrl);
                })
                .catch(() => {
                  if (active) setCardPhotoUrl('/logo.jpg');
                });
            } catch (e) {
              if (active) setCardPhotoUrl('/logo.jpg');
            }
          } else {
            if (active) setCardPhotoUrl('/logo.jpg');
          }
        });
    } else {
      setCardPhotoUrl('/logo.jpg');
    }

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [selectedCardUser]);

  // Resolve Health Card photo to local blob URL to bypass CORS
  useEffect(() => {
    let active = true;
    let localUrl = '';

    if (selectedHealthCard && selectedHealthCard.photoPath) {
      const url = resolveAssetUrl(selectedHealthCard.photoPath);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setHealthCardPhotoUrl(localUrl);
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
                  setHealthCardPhotoUrl(localUrl);
                })
                .catch(() => {
                  if (active) setHealthCardPhotoUrl('/logo.jpg');
                });
            } catch (e) {
              if (active) setHealthCardPhotoUrl('/logo.jpg');
            }
          } else {
            if (active) setHealthCardPhotoUrl('/logo.jpg');
          }
        });
    } else {
      setHealthCardPhotoUrl('/logo.jpg');
    }

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [selectedHealthCard]);

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

  const handleToggleApplicantStatus = async (id, currentStatus) => {
    const actionText = currentStatus === false ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} this employee's account?`)) return;
    try {
      const res = await toggleApplicantStatus(id);
      if (res.success) {
        alert(res.message || 'Status updated successfully');
        syncData();
      } else {
        alert(res.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error connecting to the server');
    }
  };

  const handleToggleEnquiryStatus = async (id) => {
    try {
      const res = await apiClient.put(`/api/admin/enquiries/${id}/status`);
      if (res.data && res.data.success) {
        alert(res.data.message || 'Enquiry status updated.');
        syncData();
      } else {
        alert(res.data?.message || 'Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating enquiry status.');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this enquiry?')) return;
    try {
      const res = await apiClient.delete(`/api/admin/enquiries/${id}`);
      if (res.data && res.data.success) {
        alert(res.data.message || 'Enquiry deleted successfully.');
        syncData();
      } else {
        alert(res.data?.message || 'Failed to delete enquiry.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting enquiry.');
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

  const handleCustomCardPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB.');
        return;
      }
      setCustomCardPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setCustomCardPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onCustomCardSubmit = async (data) => {
    if (!customCardPhotoFile) {
      alert('Please upload candidate photo before generating card.');
      return;
    }

    setCustomCardSubmitting(true);
    setCustomCardError('');

    const qualificationsData = {
      matric: { school: data.m_school, year: data.m_year, board: data.m_board, subject: data.m_sub, division: data.m_div, marks: data.m_marks, remarks: data.m_rem },
      inter: { school: data.i_school, year: data.i_year, board: data.i_board, subject: data.i_sub, division: data.i_div, marks: data.i_marks, remarks: data.i_rem },
      grad: { school: data.g_school, year: data.g_year, board: data.g_board, subject: data.g_sub, division: data.g_div, marks: data.g_marks, remarks: data.g_rem },
    };

    const formData = new FormData();
    formData.append('full_name', data.fullName);
    formData.append('email', data.email);
    formData.append('mobile', data.mobile);
    formData.append('dob', data.dob);
    formData.append('district', data.district);
    formData.append('state', data.state);
    formData.append('block', data.block || '');
    formData.append('panchayat', data.panchayat || '');
    formData.append('place', data.place || '');
    formData.append('apply_for_post', data.apply_for_post || data.role_applied);
    formData.append('role_applied', data.role_applied);
    formData.append('aadhar', data.aadhar);
    formData.append('job_category', data.job_category);
    formData.append('amount', data.amount);
    formData.append('qualifications', JSON.stringify(qualificationsData));
    formData.append('registeredBy', user?.email || 'Admin');
    formData.append('photo', customCardPhotoFile);
    formData.append('post_place', data.post_place || '');

    try {
      const response = await apiClient.post('/api/application/admin/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        alert("Custom job registration & ID card generated successfully!");
        
        // Reset form
        resetCustomCardForm();
        setCustomCardPhotoFile(null);
        setCustomCardPhotoPreview(null);
        
        // Load stats/list
        syncData();

        // Popup Employee Pass Preview modal immediately
        setSelectedCardUser(response.data.data);
        setShowCardModal(true);
      } else {
        setCustomCardError(response.data?.message || 'Direct registration failed.');
      }
    } catch (err) {
      console.error(err);
      setCustomCardError(err.response?.data?.message || 'Server connection error.');
    } finally {
      setCustomCardSubmitting(false);
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

  // Hospital Password Reset submit
  const onResetPassSubmit = async (data) => {
    setResetPassError('');
    if (data.password !== data.confirmPassword) {
      setResetPassError('Passwords do not match');
      return;
    }
    try {
      const res = await resetHospitalPassword({
        uniqueId: selectedHospital.uniqueId,
        password: data.password
      });
      if (res.success) {
        setShowResetPassModal(false);
        setSelectedHospital(null);
        resetResetPassForm();
        syncData();
        alert('Hospital password reset successfully');
      } else {
        setResetPassError(res.message || 'Password reset failed');
      }
    } catch (err) {
      setResetPassError(err.response?.data?.message || 'Server connection error');
    }
  };

  // View Hospital Activity logs and stats
  const handleViewHospitalActivity = async (hospitalId) => {
    setHospActivityError('');
    setHospActivityLoading(true);
    setHospActivityData(null);
    setShowHospActivityModal(true);
    try {
      const res = await getHospitalActivity(hospitalId);
      if (res.success) {
        setHospActivityData(res.data);
      } else {
        setHospActivityError(res.message || 'Failed to load activity details.');
      }
    } catch (err) {
      setHospActivityError(err.response?.data?.message || 'Server connection error.');
    } finally {
      setHospActivityLoading(false);
    }
  };

  // View Employee Activity logs and stats
  const handleViewEmployeeActivity = async (email) => {
    setEmpActivityError('');
    setEmpActivityLoading(true);
    setEmpActivityData(null);
    setShowEmpActivityModal(true);
    try {
      const res = await getEmployeeActivity(email);
      if (res.success) {
        setEmpActivityData(res.data);
      } else {
        setEmpActivityError(res.message || 'Failed to load employee activity details.');
      }
    } catch (err) {
      setEmpActivityError(err.response?.data?.message || 'Server connection error.');
    } finally {
      setEmpActivityLoading(false);
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
    const normalized = String(assetPath).trim().replace(/\\/g, '/');
    if (
      normalized.startsWith('http://') || 
      normalized.startsWith('https://') || 
      normalized.startsWith('data:') || 
      normalized.startsWith('blob:')
    ) {
      return normalized;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    if (normalized.startsWith('/')) {
      return `${baseUrl}${normalized}`;
    }
    return `${baseUrl}/${normalized}`;
  };

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    const prodBase = 'https://aagajfoundation.com';
    
    // Only attempt production fallback for relative server URLs, NOT for base64/blob
    if (
      currentSrc && 
      (currentSrc.includes('localhost') || currentSrc.includes('127.0.0.1')) && 
      !currentSrc.startsWith('data:') && 
      !currentSrc.startsWith('blob:')
    ) {
      try {
        const url = new URL(currentSrc);
        e.target.onerror = () => {
          e.target.onerror = null;
          e.target.src = '/logo.jpg';
        };
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
    html2canvas(cardRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Employee_Card_${selectedCardUser.fullName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error("Error generating ID card canvas:", err);
        alert("Failed to save image. Please try again.");
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
          
          if (specializationFilter === 'Chemist Shop 💊') {
            return matchesSearch && h.category === 'Pharmacy';
          }
          if (specializationFilter === 'Patholab 🔬') {
            return matchesSearch && h.category === 'Lab';
          }
          if (specializationFilter === 'Blood Bank 🩸') {
            return matchesSearch && h.category === 'BloodBank';
          }

          // Strip emoji characters from specialization name
          const cleanFilter = specializationFilter.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase();
          const hasMatchingSpec = Array.isArray(h.specialization) && h.specialization.some(s => {
            const cleanSpec = s.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase();
            return cleanSpec === cleanFilter;
          });

          return matchesSearch && hasMatchingSpec;
        });

      case 'healthcards':
        return healthCards.filter(c => (
          c.fullName?.toLowerCase().includes(term) || c.mobile?.includes(term) || c.healthId?.toLowerCase().includes(term) || c.aadhar?.includes(term)
        ));

      case 'silayiBeneficiaries':
        return beneficiaries.filter(b => {
          const isSilayi = b.yojanaName === 'Mahila Silai Prasikshan Yojana';
          const matchesSearch = 
            b.name?.toLowerCase().includes(term) || 
            b.mobileNumber?.includes(term) || 
            b.aadharNumber?.includes(term) || 
            b.serialNumber?.toLowerCase().includes(term);
          return isSilayi && matchesSearch;
        });

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

      case 'enquiries':
        return enquiries.filter(e => (
          e.fullName?.toLowerCase().includes(term) ||
          e.mobile?.includes(term) ||
          e.email?.toLowerCase().includes(term) ||
          e.subject?.toLowerCase().includes(term) ||
          e.message?.toLowerCase().includes(term)
        ));

      case 'memberships':
        return memberships.filter(m => (
          m.fullName?.toLowerCase().includes(term) ||
          m.membershipId?.toLowerCase().includes(term) ||
          m.certificateNo?.toLowerCase().includes(term) ||
          m.mobileNumber?.includes(term) ||
          m.aadhaarNumber?.includes(term) ||
          m.paymentId?.toLowerCase().includes(term) ||
          m.membershipType?.toLowerCase().includes(term)
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
      case 'memberships': return 'Registered Official Memberships & Certificates';
      case 'hospitalMaster': return 'Swasthya Suraksha Partner Control (Hospital Master)';
      case 'healthcards': return 'Issued Identity Health Cards';
      case 'appointments': return 'Doctor Schedule Bookings';
      case 'allTransactions': return 'Consolidated Scheme Payment Logs';
      case 'donationHistory': return 'Donations Receipt Register (Razorpay)';
      case 'auditLogs': return 'Super Admin Audit Action Trails';
      case 'carouselControl': return 'Dashboard Image Control (Hero Carousel)';
      case 'customCard': return 'Custom Job Card & Pass Generator';
      case 'customHealthCard': return 'Custom Health Card Generator';
      case 'customSilayiYojana': return 'Custom Mahila Silayi Yojana Generator';
      case 'silayiBeneficiaries': return 'Mahila Silayi Yojana Beneficiaries List';
      case 'enquiries': return 'Visitor Enquiry Management';
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
            <button
              onClick={() => { setCurrentView('memberships'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'memberships' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Award className="h-4.5 w-4.5" /> Memberships Master
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-[#fdd831] uppercase tracking-widest">HR & Attendance System</p>
            <button
              onClick={() => { setCurrentView('employeeAttendance'); fetchAdminAttendanceReport(); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'employeeAttendance' ? 'bg-[#ED1C24] text-white font-black shadow-lg shadow-rose-900/40' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
            >
              <CalendarCheck className="h-4.5 w-4.5 text-[#fdd831]" /> Employee Attendance Report
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
            <button
              onClick={() => { setCurrentView('customCard'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'customCard' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <IdCard className="h-4.5 w-4.5" /> Custom Pass Generator
            </button>
            <button
              onClick={() => { setCurrentView('customHealthCard'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'customHealthCard' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <HeartPulse className="h-4.5 w-4.5" /> Custom Health Card
            </button>
            <button
              onClick={() => { setCurrentView('customSilayiYojana'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'customSilayiYojana' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Scissors className="h-4.5 w-4.5" /> Custom Silayi Yojana
            </button>
            <button
              onClick={() => { setCurrentView('silayiBeneficiaries'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'silayiBeneficiaries' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Users className="h-4.5 w-4.5" /> Silayi Beneficiary List
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
              onClick={() => { setShowProfileModal(true); setProfileActiveTab('password'); setIsSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/40 border border-slate-700/50"
            >
              <span className="flex items-center gap-3"><UserCheck className="h-4.5 w-4.5 text-[#fdd831]" /> Admin Profile</span>
              <KeyRound className="h-3.5 w-3.5 text-slate-400" />
            </button>
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
            <button
              onClick={() => { setCurrentView('enquiries'); setCurrentPage(1); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentView === 'enquiries' ? 'bg-[#fdd831] text-[#051630]' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <FileText className="h-4.5 w-4.5" /> User Enquiries
            </button>
          </div>

        </nav>

        {/* Sidebar Footer Profiles */}
        <div className="p-4 border-t border-slate-800 bg-[#030e20]">
          <div 
            onClick={() => { setShowProfileModal(true); setProfileActiveTab('password'); }}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-all mb-3 group"
            title="Click to manage profile & change password"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#fdd831] text-[#051630] font-black flex items-center justify-center text-xs shadow-md">
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none group-hover:text-[#fdd831] transition-all">{user?.fullName || 'Administrator'}</p>
                <span className="text-[10px] text-slate-400 leading-none">Super Admin</span>
              </div>
            </div>
            <div className="p-1 rounded-lg bg-slate-800 text-slate-400 group-hover:text-[#fdd831] group-hover:bg-slate-700 transition-all">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#fdd831]/10 border border-[#fdd831]/20 hover:bg-[#fdd831] text-[#fdd831] hover:text-[#051630] py-2 text-xs font-bold transition-all cursor-pointer shadow-sm mb-2"
          >
            <Home className="h-3.5 w-3.5" /> Go to Homepage
          </button>
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
          {/*   0. EMPLOYEE ATTENDANCE REPORT & ACTIVE TIME MODULE     */}
          {/* ======================================================== */}
          {currentView === 'employeeAttendance' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#051630] via-[#0b2b5c] to-[#051630] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                  <div>
                    <span className="bg-[#fdd831] text-[#051630] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider mb-2 inline-block">
                      HR Management & Time Audit
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Employee Attendance & Active Software Time Report</h2>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      Monitor daily employee punch records, live online status, and exact active portal hours spent working.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/attendance/admin/export?date=${attendanceDate}`;
                        window.open(url, '_blank');
                      }}
                      className="flex items-center gap-2 bg-[#ED1C24] hover:bg-[#c4131a] text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-lg transition-all cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Export CSV Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Employees</span>
                    <h3 className="mt-1 text-2xl font-black text-slate-900">{attendanceReport.stats?.totalEmployees || 0}</h3>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">Registered Agents</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Present / Punched In</span>
                    <h3 className="mt-1 text-2xl font-black text-emerald-600">{attendanceReport.stats?.presentCount || 0}</h3>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase">Active Shift Today</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Absent Employees</span>
                    <h3 className="mt-1 text-2xl font-black text-rose-600">{attendanceReport.stats?.absentCount || 0}</h3>
                    <span className="text-[9px] text-rose-500 font-bold uppercase">Not Logged In</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Software Active Time</span>
                    <h3 className="mt-1 text-xl font-black text-[#051630]">
                      {formatActiveSecondsToHM(attendanceReport.stats?.totalActiveSeconds || 0)}
                    </h3>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">Logged On Software</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Filter & Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Target Date Picker */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Select Date:</span>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={attendanceStatusFilter}
                    onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Punched In">Punched In</option>
                    <option value="Present">Present</option>
                    <option value="Punched Out">Punched Out</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                {/* Search Box & Refresh */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employee name, email or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/20"
                    />
                  </div>

                  <button
                    onClick={() => fetchAdminAttendanceReport(attendanceDate)}
                    disabled={attendanceReportLoading}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                    title="Refresh Report"
                  >
                    <RotateCw className={`h-4 w-4 ${attendanceReportLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

              </div>

              {/* Main Employee Attendance Listing Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Employee Attendance Register ({attendanceReport.report ? attendanceReport.report.length : 0})
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Date: {attendanceReport.date || attendanceDate}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#051630] text-white uppercase text-[10px] font-extrabold tracking-wider">
                      <tr>
                        <th className="p-4">Employee Details</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Today's Status</th>
                        <th className="p-4">Live Portal Activity</th>
                        <th className="p-4">First Punch-In</th>
                        <th className="p-4">Last Activity</th>
                        <th className="p-4">Software Active Time</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {attendanceReport.report && attendanceReport.report.length > 0 ? (
                        attendanceReport.report
                          .filter(emp => {
                            const term = searchTerm.toLowerCase();
                            const matchesSearch = emp.fullName?.toLowerCase().includes(term) ||
                              emp.email?.toLowerCase().includes(term) ||
                              emp.empId?.toLowerCase().includes(term);
                            const matchesStatus = attendanceStatusFilter === 'All' || emp.status === attendanceStatusFilter;
                            return matchesSearch && matchesStatus;
                          })
                          .map((emp, idx) => (
                            <tr key={emp.email || idx} className="hover:bg-slate-50 transition-colors">
                              
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 font-black text-slate-700 flex items-center justify-center text-xs shadow-sm">
                                    {emp.fullName ? emp.fullName.charAt(0).toUpperCase() : 'E'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">{emp.fullName}</p>
                                    <p className="text-[11px] text-slate-400 font-mono">{emp.email}</p>
                                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 uppercase">
                                      {emp.empId || 'EMP'} &bull; {emp.designation || 'Employee'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                <span className="font-semibold text-slate-700 block">{emp.district || 'N/A'}</span>
                                <span className="text-[10px] text-slate-400 block">{emp.state || ''}</span>
                              </td>

                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                                  emp.status === 'Punched In' || emp.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  emp.status === 'Punched Out' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>

                              <td className="p-4">
                                {emp.isOnline ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Online Now
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                    <span className="h-2 w-2 rounded-full bg-slate-300" /> Offline
                                  </span>
                                )}
                              </td>

                              <td className="p-4 font-mono font-bold text-slate-700">
                                {emp.punchIn ? new Date(emp.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>

                              <td className="p-4 font-mono text-slate-500">
                                {emp.lastPingAt ? new Date(emp.lastPingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>

                              <td className="p-4">
                                <span className="font-black text-[#051630] text-sm font-mono block">
                                  {formatActiveSecondsToHM(emp.totalActiveSeconds || 0)}
                                </span>
                                <span className="text-[9px] text-slate-400 block font-semibold">({emp.totalActiveSeconds || 0} secs)</span>
                              </td>

                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleViewEmployeeAttendance(emp.email)}
                                  className="inline-flex items-center gap-1.5 bg-[#051630] hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                                  title="View detailed attendance & active duration dossier"
                                >
                                  <Eye className="h-3.5 w-3.5 text-[#fdd831]" /> View Attendance
                                </button>
                              </td>

                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-400 font-bold">
                            No attendance records found for selected date.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

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
                <div 
                  onClick={() => { setCurrentView('silayiBeneficiaries'); setCurrentPage(1); setSearchTerm(''); }}
                  className="bg-gradient-to-br from-[#e83e8c]/10 to-[#e83e8c]/5 rounded-2xl border border-[#e83e8c]/20 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                >
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
          {/*   4.5. MEMBERSHIPS MASTER VIEW SUMMARY                   */}
          {/* ======================================================== */}
          {currentView === 'memberships' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white p-5 rounded-3xl border border-rose-800 shadow-md">
                <span className="text-xs text-rose-200 font-bold uppercase tracking-wider">Total Registered Members</span>
                <h3 className="text-3xl font-black text-[#fdd831] mt-2">{memberships.length}</h3>
                <p className="text-[10px] text-rose-300 mt-1 font-semibold">Official enrolled members with certificates</p>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Membership Fees</span>
                <h3 className="text-3xl font-black text-rose-900 mt-2">₹{memberships.reduce((acc, m) => acc + (Number(m.paymentAmount) || 0), 0).toLocaleString('en-IN')}</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Verified online payment contributions</p>
              </div>
              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Certificates Issued</span>
                  <h3 className="text-3xl font-black text-emerald-600 mt-2">{memberships.filter(m => m.certificateIssued !== false).length}</h3>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">100% Verified Certificates Issued ✅</span>
              </div>
            </div>
          )}


          {/* ======================================================== */}
          {/*   DATA DISPLAY TABLE PANEL                               */}
          {/* ======================================================== */}
          {currentView !== 'carouselControl' && currentView !== 'customCard' && currentView !== 'customHealthCard' && currentView !== 'customSilayiYojana' && (
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
                    <option value="Blood Bank 🩸">Blood Bank 🩸</option>
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
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold">{user.fullName}</p>
                                    {user.isActive === false && (
                                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800 uppercase animate-pulse">Deactivated</span>
                                    )}
                                  </div>
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
                                    {['NGO', 'Normal'].includes(user.job_category) && (
                                      <button
                                        onClick={() => handleToggleApplicantStatus(user._id, user.isActive)}
                                        className={`rounded-lg border p-1.5 transition-all cursor-pointer ${user.isActive === false ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'}`}
                                        title={user.isActive === false ? "Activate Employee Account" : "Deactivate Employee Account"}
                                      >
                                        {user.isActive === false ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleViewEmployeeActivity(user.email || user.emp_username)}
                                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                                      title="View Employee Activity Report"
                                    >
                                      <Activity className="h-3.5 w-3.5" />
                                    </button>
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
                                  <div className="flex flex-col gap-1.5 items-start">
                                    <button
                                      onClick={() => setViewCreds({ username: hosp.loginId || hosp.email, password: 'Protected (Bcrypt Hashed)' })}
                                      className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-200 transition-all cursor-pointer"
                                    >
                                      <Lock className="h-3 w-3" /> Provisioned
                                    </button>
                                    <button
                                      onClick={() => { setSelectedHospital(hosp); resetResetPassForm(); setShowResetPassModal(true); }}
                                      className="flex items-center gap-1 rounded bg-[#fdd831] px-2 py-0.5 text-[10px] font-bold text-[#051630] hover:bg-[#ebd04c] transition-all cursor-pointer"
                                      title="Reset Hospital Password"
                                    >
                                      <RotateCw className="h-2.5 w-2.5" /> Reset Pass
                                    </button>
                                  </div>
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
                                <div className="flex justify-end items-center gap-1.5">
                                  {hosp.certificateIssued ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setSelectedPartnershipCert(hosp);
                                          setShowPartnershipCertModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-[#0D5C53] text-white px-2 py-1 text-[10px] font-bold hover:bg-[#093e38] transition-all cursor-pointer shadow-sm"
                                        title="View Official Partnership Certificate"
                                      >
                                        <Award className="h-3 w-3 text-[#D4AF37]" /> View
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedPartnershipCert(hosp);
                                          setPartnershipCertError('');
                                          setShowIssuePartnershipCertModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-amber-600 text-white px-2 py-1 text-[10px] font-bold hover:bg-amber-700 transition-all cursor-pointer shadow-sm"
                                        title="Edit Partnership Certificate Details"
                                      >
                                        <Edit className="h-3 w-3 text-white" /> Edit Cert
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedPartnershipCert(hosp);
                                        setPartnershipCertError('');
                                        setShowIssuePartnershipCertModal(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded bg-[#8B1E4B] text-white px-2 py-1 text-[10px] font-bold hover:bg-[#681436] transition-all cursor-pointer shadow-sm"
                                      title="Issue Official Partnership Certificate"
                                    >
                                      <Award className="h-3 w-3 text-white" /> Issue Cert
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleViewHospitalActivity(hosp.uniqueId)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                                    title="View Hospital Activity Logs & Stats"
                                  >
                                    <Activity className="h-3.5 w-3.5" />
                                  </button>
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
                              <td className="py-3 px-4 font-bold text-slate-900">
                                <p className="font-bold">{card.fullName}</p>
                                <span className={`inline-block w-max text-[8px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded-full ${card.cardType === 'Family' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-100 text-slate-600'}`}>
                                  {card.cardType || 'Single'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-600">{card.mobile}</td>
                              <td className="py-3 px-4 text-slate-500 font-medium">{card.aadhar}</td>
                              <td className="py-3 px-4 text-slate-500">{card.address?.district}, {card.address?.state}</td>
                              <td className="py-3 px-4 text-rose-500 font-bold">{new Date(card.expiryDate).toLocaleDateString()}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800 uppercase">Paid Success</span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => { setSelectedHealthCard(card); setShowHealthCardModal(true); }}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 hover:text-[#ED1C24] hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-xs"
                                    title="View Printable Health Card (Front & Back)"
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View Card
                                  </button>
                                  <button
                                    onClick={() => handleOpenHealthCardDetails(card)}
                                    className="rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-indigo-700 hover:text-indigo-950 hover:bg-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-xs"
                                    title="View All Details & Edit Health Card"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> View &amp; Edit Details
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
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Issue Description</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No medical appointments booked.</td>
                          </tr>
                        ) : (
                          paginatedList.map(appt => (
                            <tr key={appt._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-500 font-bold">{appt.date}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{appt.name}</td>
                              <td className="py-3 px-4 font-black text-slate-600">{appt.healthId}</td>
                              <td className="py-3 px-4 text-indigo-600 font-bold">{appt.department}</td>
                              <td className="py-3 px-4 font-semibold text-slate-700">{appt.hospitalId || 'General Clinic'}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                  appt.appointmentType === 'teleconsultation' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {appt.appointmentType === 'teleconsultation' ? 'Teleconsultation' : 'Physical Visit'}
                                </span>
                              </td>
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
                  {/*  TABLE 4.5. SILAYI YOJANA BENEFICIARIES GRID */}
                  {/* ========================================== */}
                  {currentView === 'silayiBeneficiaries' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Photo</th>
                          <th className="py-3 px-4">Serial No (Reg)</th>
                          <th className="py-3 px-4">Candidate Name</th>
                          <th className="py-3 px-4">Guardian Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Aadhar Card</th>
                          <th className="py-3 px-4">Training / Duration</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400 font-semibold">No Silayi Yojana candidates matching filters found.</td>
                          </tr>
                        ) : (
                          paginatedList.map(b => {
                            const photo = b.photoUrl ? resolveAssetUrl(b.photoUrl) : '/logo.jpg';
                            return (
                              <tr key={b._id} className="hover:bg-slate-50/50 transition-all">
                                <td className="py-3 px-4">
                                  <img
                                    src={photo}
                                    alt="Trainee Photo"
                                    className="h-9 w-9 rounded-full border border-slate-100 object-cover shadow-sm"
                                    onError={handleImageError}
                                  />
                                </td>
                                <td className="py-3 px-4 font-black text-rose-600">{b.serialNumber}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  <p>{b.name}</p>
                                  <span className="text-[10px] text-slate-400 font-semibold">{b.email}</span>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-700">{b.guardianName || 'N/A'}</td>
                                <td className="py-3 px-4 font-semibold text-[#000080]">+91 {b.mobileNumber}</td>
                                <td className="py-3 px-4 font-mono font-semibold text-slate-500">{b.aadharNumber?.replace(/(\d{4})/g, '$1 ').trim()}</td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-800 uppercase">{b.trainingName}</p>
                                  <span className="text-[9px] text-[#e83e8c] font-black uppercase">{b.trainingDuration} (from {b.trainingDate})</span>
                                </td>
                                <td className="py-3 px-4 text-right font-semibold">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedPayment({
                                          beneficiaryName: b.name,
                                          beneficiaryPhone: b.mobileNumber,
                                          timestamp: b.createdAt || new Date(),
                                          paymentId: b.paymentId,
                                          orderId: b.orderId,
                                          schemeType: 'Silayi Yojana',
                                          amount: b.registrationFee || 799
                                        });
                                        setShowReceiptModal(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded bg-[#000080] text-white px-2 py-1.5 text-[10px] font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                                    >
                                      <Printer className="h-3.5 w-3.5" /> Invoice
                                    </button>

                                    {b.certificateIssued ? (
                                      <button
                                        onClick={() => {
                                          setSelectedCertData(b);
                                          setShowCertPreviewModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-1.5 text-[10px] font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                                      >
                                        <Award className="h-3.5 w-3.5" /> View Cert
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setSelectedCertBeneficiary(b);
                                          setCertFormError('');
                                          setShowIssueCertModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-indigo-600 text-white px-2 py-1.5 text-[10px] font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                                      >
                                        <Award className="h-3.5 w-3.5" /> Issue Cert
                                      </button>
                                    )}
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

                  {/* ========================================== */}
                  {/*  TABLE 8. USER ENQUIRIES REGISTER          */}
                  {/* ========================================== */}
                  {currentView === 'enquiries' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">Contact Info</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Message</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-12 text-slate-400 font-semibold">No visitor enquiries received.</td>
                          </tr>
                        ) : (
                          paginatedList.map(enq => (
                            <tr key={enq._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4 text-slate-400 font-bold">{new Date(enq.createdAt).toLocaleDateString()}</td>
                              <td className="py-3 px-4 font-black text-slate-800">{enq.fullName}</td>
                              <td className="py-3 px-4 font-semibold text-slate-600">
                                <p>{enq.mobile}</p>
                                <p className="text-[10px] text-indigo-500 font-medium">{enq.email || 'No Email'}</p>
                              </td>
                              <td className="py-3 px-4 font-bold text-[#ED1C24]">{enq.subject}</td>
                              <td className="py-3 px-4 text-slate-600 max-w-xs break-words whitespace-normal font-medium">
                                {enq.message}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase transition-all ${
                                  enq.status === 'Resolved' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {enq.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleToggleEnquiryStatus(enq._id)}
                                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                                      enq.status === 'Resolved'
                                        ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                    title={enq.status === 'Resolved' ? 'Mark Pending' : 'Mark Resolved'}
                                  >
                                    {enq.status === 'Resolved' ? 'Mark Pending' : 'Mark Resolved'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEnquiry(enq._id)}
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
                  {/*  TABLE 9. MEMBERSHIPS & CERTIFICATES LOG   */}
                  {/* ========================================== */}
                  {currentView === 'memberships' && (
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Photo</th>
                          <th className="py-3 px-4">Membership ID</th>
                          <th className="py-3 px-4">Member Name</th>
                          <th className="py-3 px-4">Guardian Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Joining Date</th>
                          <th className="py-3 px-4">Membership Type</th>
                          <th className="py-3 px-4">Payment Info</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {paginatedList.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-12 text-slate-400 font-semibold">No registered memberships found.</td>
                          </tr>
                        ) : (
                          paginatedList.map(m => (
                            <tr key={m._id} className="hover:bg-slate-50/50 transition-all">
                              <td className="py-3 px-4">
                                {(() => {
                                  const photoSrc = m.photoUrl || m.photo || m.photoPath || m.image || m.profileImage || m.avatar || m.imageUrl;
                                  if (photoSrc) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenMemberDetails(m)}
                                        className="relative group block rounded-full focus:outline-none cursor-pointer"
                                        title="Click to view or change photo"
                                      >
                                        <img 
                                          src={resolveAssetUrl(photoSrc)} 
                                          alt={m.fullName} 
                                          className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-rose-600 transition-all shadow-xs"
                                          onError={handleImageError}
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                          <Camera className="h-3.5 w-3.5 text-white" />
                                        </div>
                                      </button>
                                    );
                                  }
                                  const initials = m.fullName ? m.fullName.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AF';
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMemberDetails(m)}
                                      className="relative group h-10 w-10 rounded-full bg-gradient-to-tr from-rose-100 to-amber-100 border border-rose-300 text-rose-800 flex items-center justify-center font-black text-[11px] shadow-xs cursor-pointer hover:bg-rose-200 transition-all"
                                      title="No photo uploaded - Click to upload photo now"
                                    >
                                      <span>{initials}</span>
                                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs border border-white">
                                        <Camera className="h-2.5 w-2.5" />
                                      </div>
                                    </button>
                                  );
                                })()}
                              </td>
                              <td className="py-3 px-4 font-black text-rose-800 font-mono">{m.membershipId}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                <p>{m.fullName}</p>
                                <span className="text-[10px] text-slate-400 font-semibold">{m.city || m.district || 'N/A'}, {m.state || 'Bihar'}</span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-700">{m.fatherOrHusbandName || 'N/A'}</td>
                              <td className="py-3 px-4 font-semibold text-slate-800">+91 {m.mobileNumber}</td>
                              <td className="py-3 px-4 font-medium text-slate-600">{m.joiningDate}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 text-[10px] font-black uppercase">
                                  {m.membershipType || 'General Member'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-black uppercase w-max">
                                    Paid ₹{m.paymentAmount} ✅
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">{m.paymentId}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedMembershipCert(m);
                                      setShowMembershipCertModal(true);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-xl bg-rose-800 text-white px-2.5 py-1.5 text-[10px] font-bold hover:bg-rose-900 transition-all cursor-pointer shadow-sm"
                                    title="View Official Membership Certificate"
                                  >
                                    <Award className="h-3.5 w-3.5" /> Certificate
                                  </button>
                                  <button
                                    onClick={() => handleOpenMemberDetails(m)}
                                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 px-2.5 py-1.5 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                                    title="View & Edit All Membership Details"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-rose-600" /> View &amp; Edit Details
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMember(m._id)}
                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 text-rose-600 hover:bg-rose-100 px-2 py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                                    title="Delete Member Record"
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
        )}

        {currentView === 'carouselControl' && (
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

        {currentView === 'customCard' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-10 space-y-8 max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Direct Candidate Pass Registration</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Generate a successful job card & receipt bypass</p>
              </div>

              {/* Photo Frame */}
              <div className="flex flex-col items-center space-y-1.5 shrink-0">
                <div className="h-32 w-28 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative bg-slate-50 group hover:border-[#ED1C24] transition-all">
                  {customCardPhotoPreview ? (
                    <img src={customCardPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PHOTO</span>
                  )}
                </div>
                <label className="cursor-pointer text-[10px] font-extrabold text-[#ED1C24] hover:underline uppercase tracking-wide">
                  Choose Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleCustomCardPhotoChange} />
                </label>
              </div>
            </div>

            <form onSubmit={handleCustomCardSubmit(onCustomCardSubmit)} className="space-y-8 text-left">
              
              {/* SECTION: ADMIN SETTINGS (CUSTOM ROLE & PRICE) */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-[#0B2C66] tracking-wider border-l-4 border-[#0B2C66] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  Custom Job & Payment Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Job Category</label>
                    <select
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white cursor-pointer transition-all"
                      {...regCustomCard('job_category', { required: true })}
                    >
                      <option value="NGO">NGO Job</option>
                      <option value="Normal">Normal Job</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Custom Job Role</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase"
                      placeholder="e.g. Senior Panchayat Coordinator"
                      {...regCustomCard('role_applied', { required: 'Job Role is required' })}
                    />
                    {customCardErrors.role_applied && <p className="text-red-500 text-xs font-bold">{customCardErrors.role_applied.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Applied Post Location</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase"
                      placeholder="e.g. Dalsinghsarai"
                      {...regCustomCard('post_place', { required: 'Post location is required' })}
                    />
                    {customCardErrors.post_place && <p className="text-red-500 text-xs font-bold">{customCardErrors.post_place.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Custom Fee / Registration Price (INR)</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all"
                      placeholder="e.g. 999"
                      {...regCustomCard('amount', { required: 'Registration fee is required', min: 0 })}
                    />
                    {customCardErrors.amount && <p className="text-red-500 text-xs font-bold">{customCardErrors.amount.message}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 1: PERSONAL INFORMATION */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  1. Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Full Name"
                      {...regCustomCard('fullName', { required: 'Full Name is required' })}
                    />
                    {customCardErrors.fullName && <p className="text-red-500 text-xs font-bold">{customCardErrors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Father / Husband Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Father / Husband Name"
                      {...regCustomCard('fatherName', { required: 'Father/Husband Name is required' })}
                    />
                    {customCardErrors.fatherName && <p className="text-red-500 text-xs font-bold">{customCardErrors.fatherName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mother's Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Mother's Name"
                      {...regCustomCard('motherName', { required: "Mother's Name is required" })}
                    />
                    {customCardErrors.motherName && <p className="text-red-500 text-xs font-bold">{customCardErrors.motherName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Date of Birth (DD/MM/YYYY)</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                      {...regCustomCard('dob', { 
                        required: 'Date of Birth is required',
                        pattern: { value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/, message: 'Format must be DD/MM/YYYY' }
                      })}
                    />
                    {customCardErrors.dob && <p className="text-red-500 text-xs font-bold">{customCardErrors.dob.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mobile Number</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="10-Digit Mobile Number"
                      maxLength={10}
                      {...regCustomCard('mobile', {
                        required: 'Mobile is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6-9' }
                      })}
                    />
                    {customCardErrors.mobile && <p className="text-red-500 text-xs font-bold">{customCardErrors.mobile.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email ID</label>
                    <input
                      type="email"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="name@example.com"
                      {...regCustomCard('email', { required: 'Email ID is required' })}
                    />
                    {customCardErrors.email && <p className="text-red-500 text-xs font-bold">{customCardErrors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Aadhar Number</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="12-Digit Aadhar Number"
                      maxLength={12}
                      {...regCustomCard('aadhar', {
                        required: 'Aadhar Number is required',
                        pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' }
                      })}
                    />
                    {customCardErrors.aadhar && <p className="text-red-500 text-xs font-bold">{customCardErrors.aadhar.message}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERMANENT HOME ADDRESS */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  2. Permanent Home Address
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Village</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('village', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Panchayat</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('panchayat', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Post Office</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('post', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Block</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('block', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Police Station</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('police', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">District</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('district', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">State</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('state', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pin Code</label>
                    <input type="text" maxLength={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomCard('pin', { required: true, pattern: /^\d{6}$/ })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ward No</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomCard('ward')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total Ward</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomCard('total_ward')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nationality</label>
                    <input type="text" defaultValue="INDIAN" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('nationality', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Languages Known</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('languages_known', { required: true })} />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BANK DETAILS */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  3. Bank Account Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Account Number</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomCard('bank_account')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">IFSC Code</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('bank_ifsc')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Account Holder Name</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('bank_holder')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Bank Name</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('bank_name')} />
                  </div>
                </div>
              </div>

              {/* SECTION 4: EDUCATIONAL QUALIFICATIONS */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  4. Educational Qualifications
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner bg-slate-50/50">
                  <table className="min-w-[800px] w-full text-slate-700 text-xs font-semibold">
                    <thead className="bg-slate-100 text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4 text-left">Exam</th>
                        <th className="py-3 px-4 text-left">Name of School/College</th>
                        <th className="py-3 px-4 text-left">Year</th>
                        <th className="py-3 px-4 text-left">Board/University</th>
                        <th className="py-3 px-4 text-left">Subjects</th>
                        <th className="py-3 px-4 text-left">Division</th>
                        <th className="py-3 px-4 text-left">% Marks</th>
                        <th className="py-3 px-4 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Matric */}
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">Matric</td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('m_school')} /></td>
                        <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('m_year')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('m_board')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('m_sub')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('m_div')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('m_marks')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('m_rem')} /></td>
                      </tr>

                      {/* Inter */}
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">Intermediate</td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('i_school')} /></td>
                        <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('i_year')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('i_board')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('i_sub')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('i_div')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('i_marks')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('i_rem')} /></td>
                      </tr>

                      {/* Grad */}
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-800">Graduation</td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('g_school')} /></td>
                        <td className="py-2.5 px-2"><input type="text" maxLength={4} className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('g_year')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('g_board')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('g_sub')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('g_div')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all" {...regCustomCard('g_marks')} /></td>
                        <td className="py-2.5 px-2"><input type="text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/10 bg-white transition-all uppercase" {...regCustomCard('g_rem')} /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Declarations and signatures */}
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <p className="text-center font-bold text-[#000080] text-sm leading-relaxed">
                  I hereby declare that the information provided above is true to the best of my knowledge and belief.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-bold text-slate-500 text-xs items-end">
                  <div className="space-y-4 text-center">
                    <div className="h-12 border-b-2 border-slate-200"></div>
                    <span className="text-slate-600 uppercase tracking-wide text-[10px]">Guardian Signature</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="uppercase text-[10px] tracking-wide text-slate-600">Place</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomCard('place', { required: true })} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="uppercase text-[10px] tracking-wide text-slate-600">Date</label>
                    <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomCard('date', { required: true })} />
                  </div>

                  <div className="space-y-4 text-center">
                    <div className="h-12 border-b-2 border-slate-200"></div>
                    <span className="text-slate-600 uppercase tracking-wide text-[10px]">Coordinator Signature</span>
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              {customCardError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-xs">
                  ❌ {customCardError}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={customCardSubmitting}
                  className="rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg text-base transition-all duration-300 w-full sm:w-auto disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {customCardSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating Pass...
                    </>
                  ) : (
                    'Generate Custom Pass & Card'
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {currentView === 'customHealthCard' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-10 space-y-8 max-w-[1200px] mx-auto text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Direct Health Card Registration</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Generate a successful health card & payment bypass</p>
              </div>

              {/* Photo Frame */}
              <div className="flex flex-col items-center space-y-1.5 shrink-0">
                <div className="h-32 w-28 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative bg-slate-50 group hover:border-[#ED1C24] transition-all">
                  {customHealthCardPhotoPreview ? (
                    <img src={customHealthCardPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PHOTO</span>
                  )}
                </div>
                <label className="cursor-pointer text-[10px] font-extrabold text-[#ED1C24] hover:underline uppercase tracking-wide">
                  Choose Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Photo size must be less than 5MB.');
                        return;
                      }
                      setCustomHealthCardPhotoFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => setCustomHealthCardPhotoPreview(event.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>

            <form onSubmit={handleCustomHealthCardSubmit(async (data) => {
              if (parseInt(data.amount, 10) < 0) {
                alert('Fee cannot be negative');
                return;
              }
              if (!customHealthCardPhotoFile) {
                alert('Please upload candidate photo before generating card.');
                return;
              }
              setCustomHealthCardSubmitting(true);
              setCustomHealthCardError('');

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
              formData.append('photo', customHealthCardPhotoFile);
              formData.append('cardType', data.cardType);
              formData.append('amount', data.amount);
              formData.append('registeredBy', user?.email || 'Admin');

              if (data.cardType === 'Family') {
                formData.append('familyMembers', JSON.stringify(customFamilyMembers));
              }

              try {
                const response = await apiClient.post('/api/healthcard/admin/create', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data && response.data.success) {
                  alert("Custom health card generated successfully!");
                  resetCustomHealthCardForm();
                  setCustomHealthCardPhotoFile(null);
                  setCustomHealthCardPhotoPreview(null);
                  syncData();
                  setSelectedHealthCard(response.data.data);
                  setShowHealthCardModal(true);
                } else {
                  setCustomHealthCardError(response.data?.message || 'Direct creation failed.');
                }
              } catch (err) {
                console.error(err);
                setCustomHealthCardError(err.response?.data?.message || 'Server connection error.');
              } finally {
                setCustomHealthCardSubmitting(false);
              }
            })} className="space-y-8">
              
              {/* Settings Card */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-[#0B2C66] tracking-wider border-l-4 border-[#0B2C66] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  Custom Card & Payment Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Card Type</label>
                    <select
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white cursor-pointer transition-all"
                      {...regCustomHealthCard('cardType', { 
                        required: true,
                        onChange: (e) => {
                          const val = e.target.value;
                          setCustomHealthCardValue('amount', val === 'Family' ? 499 : 201);
                        }
                      })}
                    >
                      <option value="Single">Single Health Card</option>
                      <option value="Family">Family Health Card</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Custom Fee / Registration Price (INR)</label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        if (Number(e.target.value) < 0) {
                          e.target.value = 0;
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all"
                      placeholder="e.g. 201"
                      {...regCustomHealthCard('amount', { 
                        required: 'Fee is required', 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Fee cannot be negative' } 
                      })}
                    />
                    {customHealthCardErrors.amount && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.amount.message}</p>}
                  </div>
                </div>
              </div>

              {/* Personal Particulars */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  1. Personal Particulars
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Full Name"
                      {...regCustomHealthCard('fullName', { required: 'Full Name is required' })}
                    />
                    {customHealthCardErrors.fullName && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Number (WhatsApp)</label>
                    <input
                      type="text"
                      maxLength={10}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="10-Digit Mobile Number"
                      {...regCustomHealthCard('mobile', {
                        required: 'Mobile is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6-9' }
                      })}
                    />
                    {customHealthCardErrors.mobile && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.mobile.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Aadhar Number (12 Digits)</label>
                    <input
                      type="text"
                      maxLength={12}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="12-Digit Aadhar Number"
                      {...regCustomHealthCard('aadhar', {
                        required: 'Aadhar Number is required',
                        pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' }
                      })}
                    />
                    {customHealthCardErrors.aadhar && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.aadhar.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address (Optional)</label>
                    <input
                      type="email"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="Enter Email Address"
                      {...regCustomHealthCard('email', {
                        pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' }
                      })}
                    />
                    {customHealthCardErrors.email && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Age</label>
                      <input
                        type="number"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                        placeholder="Age"
                        {...regCustomHealthCard('age', { required: 'Age is required', min: 1 })}
                      />
                      {customHealthCardErrors.age && <p className="text-red-500 text-xs font-bold">{customHealthCardErrors.age.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Gender</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-750 focus:outline-none bg-white cursor-pointer transition-all"
                        {...regCustomHealthCard('gender')}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Blood</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-750 focus:outline-none bg-white cursor-pointer transition-all"
                        {...regCustomHealthCard('bloodGroup')}
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
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  2. Residential Address
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Village</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomHealthCard('village', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Panchayat</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomHealthCard('panchayat', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Block</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomHealthCard('block', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">District</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomHealthCard('district', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">State</label>
                    <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase" {...regCustomHealthCard('state', { required: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pin Code</label>
                    <input type="text" maxLength={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all" {...regCustomHealthCard('pincode', { required: true, pattern: /^\d{6}$/ })} />
                  </div>
                </div>
              </div>

              {/* Family Members Section */}
              {watchCustomHealthCard('cardType') === 'Family' && (
                <div className="space-y-6">
                  <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                    3. Family Members Details
                  </h3>

                  <div className="space-y-6">
                    {customFamilyMembers.map((member, index) => (
                      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-xs font-black text-[#0B2C66] uppercase tracking-wide">
                            {index + 1}. {member.relationship} Details
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <input
                              type="text"
                              value={member.fullName}
                              onChange={(e) => {
                                const updated = [...customFamilyMembers];
                                updated[index].fullName = e.target.value;
                                setCustomFamilyMembers(updated);
                              }}
                              placeholder={`Enter Name`}
                              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs font-bold focus:outline-none focus:border-[#ED1C24] uppercase"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1.5 col-span-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                              <input
                                type="number"
                                value={member.age}
                                onChange={(e) => {
                                  const updated = [...customFamilyMembers];
                                  updated[index].age = e.target.value;
                                  setCustomFamilyMembers(updated);
                                }}
                                placeholder="Age"
                                className="w-full border border-slate-200 rounded-xl px-2 py-2 text-slate-850 text-xs font-bold focus:outline-none focus:border-[#ED1C24]"
                              />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                              <select
                                value={member.gender}
                                onChange={(e) => {
                                  const updated = [...customFamilyMembers];
                                  updated[index].gender = e.target.value;
                                  setCustomFamilyMembers(updated);
                                }}
                                className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-700 focus:outline-none bg-white cursor-pointer"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aadhar Number (12 Digits)</label>
                            <input
                              type="text"
                              maxLength={12}
                              value={member.aadhar}
                              onChange={(e) => {
                                const updated = [...customFamilyMembers];
                                updated[index].aadhar = e.target.value.replace(/\D/g, '');
                                setCustomFamilyMembers(updated);
                              }}
                              placeholder="0000 0000 0000"
                              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-[#ED1C24]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit error panel */}
              {customHealthCardError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-xs">
                  ❌ {customHealthCardError}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={customHealthCardSubmitting}
                  className="rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg text-base transition-all duration-300 w-full sm:w-auto disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {customHealthCardSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating Health Card...
                    </>
                  ) : (
                    'Generate Custom Health Card'
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {currentView === 'customSilayiYojana' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-10 space-y-8 max-w-[1200px] mx-auto text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-100 pb-6 gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Direct Silayi Yojana Registration</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Generate a successful sewing training admission & payment bypass</p>
              </div>

              {/* Photo Frame */}
              <div className="flex flex-col items-center space-y-1.5 shrink-0">
                <div className="h-32 w-28 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative bg-slate-50 group hover:border-[#ED1C24] transition-all">
                  {customSilayiPhotoPreview ? (
                    <img src={customSilayiPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PHOTO</span>
                  )}
                </div>
                <label className="cursor-pointer text-[10px] font-extrabold text-[#ED1C24] hover:underline uppercase tracking-wide">
                  Choose Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Photo size must be less than 5MB.');
                        return;
                      }
                      setCustomSilayiPhotoFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => setCustomSilayiPhotoPreview(event.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </div>

            <form onSubmit={handleCustomSilayiSubmit(async (data) => {
              if (parseInt(data.amount, 10) < 0) {
                alert('Fee cannot be negative');
                return;
              }
              if (!customSilayiPhotoFile) {
                alert('Please upload candidate photo before submitting registration.');
                return;
              }
              setCustomSilayiSubmitting(true);
              setCustomSilayiError('');

              const formData = new FormData();
              formData.append('name', data.name);
              formData.append('guardianName', data.guardianName);
              formData.append('address', data.address);
              formData.append('mobileNumber', data.mobileNumber);
              formData.append('gender', data.gender);
              formData.append('email', data.email || '');
              formData.append('aadharNumber', data.aadharNumber);
              formData.append('age', data.age || '');
              formData.append('caste', data.caste || '');
              formData.append('trainingName', data.trainingName);
              formData.append('existingSkills', data.existingSkills);
              formData.append('trainingDuration', data.trainingDuration);
              formData.append('trainingDate', data.trainingDate);
              formData.append('amount', data.amount);
              formData.append('photo', customSilayiPhotoFile);
              formData.append('registeredBy', user?.email || 'Admin');

              try {
                const response = await apiClient.post('/api/schemes/admin/create', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data && response.data.success) {
                  alert("Custom Silayi Yojana registration & invoice generated successfully!");
                  resetCustomSilayiForm();
                  setCustomSilayiPhotoFile(null);
                  setCustomSilayiPhotoPreview(null);
                  syncData();
                  setSelectedPayment({
                    beneficiaryName: response.data.data.name,
                    beneficiaryPhone: response.data.data.mobileNumber,
                    timestamp: response.data.data.createdAt || new Date(),
                    paymentId: response.data.data.paymentId,
                    orderId: response.data.data.orderId,
                    schemeType: 'Silayi Yojana',
                    amount: response.data.data.registrationFee || 799
                  });
                  setShowReceiptModal(true);
                } else {
                  setCustomSilayiError(response.data?.message || 'Direct creation failed.');
                }
              } catch (err) {
                console.error(err);
                setCustomSilayiError(err.response?.data?.message || 'Server connection error.');
              } finally {
                setCustomSilayiSubmitting(false);
              }
            })} className="space-y-8">
              
              {/* Payment Settings */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-[#0B2C66] tracking-wider border-l-4 border-[#0B2C66] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  Custom Registration & Fee Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Custom Fee / Registration Price (INR)</label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        if (Number(e.target.value) < 0) {
                          e.target.value = 0;
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 bg-white transition-all"
                      placeholder="e.g. 799"
                      {...regCustomSilayi('amount', { 
                        required: 'Fee is required', 
                        valueAsNumber: true,
                        min: { value: 0, message: 'Fee cannot be negative' } 
                      })}
                    />
                    {customSilayiErrors.amount && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.amount.message}</p>}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  1. Candidate Particulars
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Candidate Full Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Full Name"
                      {...regCustomSilayi('name', { required: 'Name is required' })}
                    />
                    {customSilayiErrors.name && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Father / Husband Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Enter Guardian/Husband Name"
                      {...regCustomSilayi('guardianName', { required: 'Guardian Name is required' })}
                    />
                    {customSilayiErrors.guardianName && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.guardianName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mobile Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="10-Digit Mobile Number"
                      {...regCustomSilayi('mobileNumber', {
                        required: 'Mobile is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Must be exactly 10 digits starting with 6-9' }
                      })}
                    />
                    {customSilayiErrors.mobileNumber && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.mobileNumber.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Aadhar Number (12 digits)</label>
                    <input
                      type="text"
                      maxLength={12}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="12-Digit Aadhar Number"
                      {...regCustomSilayi('aadharNumber', {
                        required: 'Aadhar is required',
                        pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' }
                      })}
                    />
                    {customSilayiErrors.aadharNumber && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.aadharNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Age</label>
                      <input
                        type="number"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                        placeholder="Age"
                        {...regCustomSilayi('age')}
                      />
                    </div>
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Gender</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl px-2 py-2.5 text-sm font-bold text-slate-700 focus:outline-none bg-white cursor-pointer transition-all"
                        {...regCustomSilayi('gender')}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Caste</label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                        placeholder="Caste"
                        {...regCustomSilayi('caste')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Address (Optional)</label>
                    <input
                      type="email"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="Email Address (Optional)"
                      {...regCustomSilayi('email')}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Complete Residential Address</label>
                    <textarea
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="Village, Panchayat, Block, District, State, Pincode"
                      {...regCustomSilayi('address', { required: 'Address is required' })}
                    />
                    {customSilayiErrors.address && <p className="text-red-500 text-xs font-bold">{customSilayiErrors.address.message}</p>}
                  </div>
                </div>
              </div>

              {/* Training and Skills */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold uppercase text-slate-800 tracking-wider border-l-4 border-[#ED1C24] pl-3 py-2 bg-slate-50 rounded-r-xl">
                  2. Training & Skills Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Training Name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="e.g. Sewing Machine Training"
                      {...regCustomSilayi('trainingName', { required: true })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Existing Skills</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="e.g. None or Basic Stitching"
                      {...regCustomSilayi('existingSkills', { required: true })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Training Duration</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all uppercase"
                      placeholder="e.g. 3 Months"
                      {...regCustomSilayi('trainingDuration', { required: true })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Training Start Date</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-sm font-bold focus:outline-none bg-slate-50/30 focus:bg-white focus:border-[#ED1C24] focus:ring-4 focus:ring-[#ED1C24]/10 transition-all"
                      placeholder="e.g. 01/07/2026"
                      {...regCustomSilayi('trainingDate', { required: true })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit error panel */}
              {customSilayiError && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-xs">
                  ❌ {customSilayiError}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={customSilayiSubmitting}
                  className="rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg text-base transition-all duration-300 w-full sm:w-auto disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {customSilayiSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Submitting Registration...
                    </>
                  ) : (
                    'Generate Custom Registration & Receipt'
                  )}
                </button>
              </div>

            </form>
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
                {selectedCardUser.isActive === false && (
                  <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[0.5px] z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                    <div className="rotate-[-35deg] text-red-600 border-4 border-red-600 rounded-xl px-4 py-2 text-xl font-black uppercase tracking-widest bg-white/95 shadow-2xl opacity-90 select-none">
                      INACTIVE
                    </div>
                  </div>
                )}
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
                    src={cardPhotoUrl}
                    alt="Photo"
                    className="w-20 h-20 rounded-full border-4 border-[#ED1C24] object-cover bg-white p-1"
                    crossOrigin="anonymous"
                    onError={handleImageError}
                  />
                </div>
                
                <div className="text-center px-4 mt-1 flex-grow">
                  <h4 className="text-[#000080] text-sm font-black uppercase truncate m-0">{selectedCardUser.fullName}</h4>
                  <p className="text-[#ED1C24] text-[9px] font-black tracking-wider uppercase m-0 mt-0.5">{selectedCardUser.roleApplied || 'NGO Employee'}</p>
                  {selectedCardUser.postPlace && (
                    <p className="text-[#000080] text-[8px] font-black uppercase m-0">{`Place: ${selectedCardUser.postPlace}`}</p>
                  )}
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-left text-[9px] leading-relaxed text-slate-700 mt-2 space-y-0.5">
                    {selectedCardUser.postPlace && <div><span className="text-[#000080] font-black inline-block w-14">Place:</span> <span className="uppercase">{selectedCardUser.postPlace}</span></div>}
                    <div><span className="text-[#000080] font-black inline-block w-14">DOJ:</span> {selectedCardUser.date ? new Date(selectedCardUser.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</div>
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

      {/* --- MODAL 6.5. RESET HOSPITAL PASSWORD --- */}
      {showResetPassModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <RotateCw className="h-4.5 w-4.5 text-[#fdd831]" /> Reset Password - {selectedHospital.businessName}
              </h3>
              <button onClick={() => setShowResetPassModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {resetPassError && (
                <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  {resetPassError}
                </div>
              )}
              
              <form onSubmit={handleResetPassSubmit(onResetPassSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500">Official Access Email</label>
                  <input
                    type="email"
                    value={selectedHospital.email || ''}
                    disabled
                    className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-400 bg-slate-50 text-xs outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500">Hospital Login ID</label>
                  <input
                    type="text"
                    value={selectedHospital.loginId || `HOSP-${selectedHospital.uniqueId}`}
                    disabled
                    className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-400 bg-slate-50 text-xs outline-none cursor-not-allowed font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 text-rose-600">New Password</label>
                  <input
                    type="password"
                    {...regResetPass('password', { 
                      required: 'New Password is required', 
                      minLength: { value: 6, message: 'Minimum 6 characters' } 
                    })}
                    className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]"
                    placeholder="Enter new password (min 6 chars)"
                  />
                  {resetPassErrors?.password && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{resetPassErrors.password.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 text-rose-600">Confirm Password</label>
                  <input
                    type="password"
                    {...regResetPass('confirmPassword', { 
                      required: 'Confirm Password is required', 
                      minLength: { value: 6, message: 'Minimum 6 characters' } 
                    })}
                    className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]"
                    placeholder="Re-enter new password"
                  />
                  {resetPassErrors?.confirmPassword && (
                    <span className="text-[10px] font-bold text-rose-500 mt-1 block">{resetPassErrors.confirmPassword.message}</span>
                  )}
                </div>

                <button type="submit" className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white mt-4 py-3 text-xs font-bold cursor-pointer transition-all">
                  Reset Password & Update Securely
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6.6. INDIVIDUAL HOSPITAL ACTIVITY REPORT & LOGS --- */}
      {showHospActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-emerald-500" /> Hospital Activity & Tracking
              </h3>
              <button onClick={() => setShowHospActivityModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {hospActivityLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ED1C24]"></div>
                  <span className="text-xs font-bold text-slate-500">Loading activity data...</span>
                </div>
              )}

              {hospActivityError && (
                <div className="rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 border border-rose-100">
                  {hospActivityError}
                </div>
              )}

              {!hospActivityLoading && !hospActivityError && hospActivityData && (
                <>
                  {/* Hospital Details Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Partner Details</h4>
                      <h2 className="text-base font-extrabold text-slate-900">{hospActivityData.hospital?.businessName}</h2>
                      <p className="text-[11px] text-indigo-500 font-bold mb-3">{hospActivityData.hospital?.specialization?.join(', ') || 'General Medicine'}</p>
                      
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600">
                        <div><strong className="text-slate-400 font-medium">Owner:</strong> {hospActivityData.hospital?.contact?.ownerName}</div>
                        <div><strong className="text-slate-400 font-medium">WhatsApp:</strong> {hospActivityData.hospital?.contact?.whatsappNumber}</div>
                        <div><strong className="text-slate-400 font-medium">Location:</strong> {hospActivityData.hospital?.address?.city}, {hospActivityData.hospital?.address?.state}</div>
                        <div><strong className="text-slate-400 font-medium">License No:</strong> {hospActivityData.hospital?.licenseNumber}</div>
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-600">Total Collection</span>
                        <span className="text-base font-black text-emerald-800">₹{hospActivityData.stats?.totalBilling}</span>
                      </div>
                      <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-blue-600">Bills Generated</span>
                        <span className="text-base font-black text-blue-800">{hospActivityData.stats?.totalBills}</span>
                      </div>
                      <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 flex flex-col justify-between col-span-2">
                        <span className="text-[9px] font-black uppercase text-purple-600">Booked Appointments</span>
                        <span className="text-base font-black text-purple-800">{hospActivityData.stats?.totalAppointments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Tab Section */}
                  <div className="space-y-6">
                    {/* Clinic Appointments */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Clinic Appointments ({hospActivityData.appointments?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Patient Name</th>
                              <th className="py-2 px-3">Health Card ID</th>
                              <th className="py-2 px-3">Type</th>
                              <th className="py-2 px-3">Department</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {hospActivityData.appointments?.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-6 text-slate-400 font-semibold">No appointments found.</td>
                              </tr>
                            ) : (
                              hospActivityData.appointments.map(a => (
                                <tr key={a._id} className="hover:bg-slate-50/20 transition-all">
                                  <td className="py-2.5 px-3 font-bold text-slate-400">{a.date}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">{a.name}</td>
                                  <td className="py-2.5 px-3 font-black text-rose-600">{a.healthId}</td>
                                  <td className="py-2.5 px-3 uppercase text-[9px] font-bold text-slate-500">{a.appointmentType?.replace('_', ' ')}</td>
                                  <td className="py-2.5 px-3 font-semibold text-indigo-500">{a.department}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                                      a.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                      a.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {a.status || 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Patient Bills */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide flex items-center justify-between">
                        <span>Billing & Treatment History ({hospActivityData.bills?.length || 0})</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Patient Invoices & Receipts</span>
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                              <th className="py-2 px-3">Bill ID</th>
                              <th className="py-2 px-3">Patient Name</th>
                              <th className="py-2 px-3">Health Card</th>
                              <th className="py-2 px-3">Details</th>
                              <th className="py-2 px-3 text-right">Amount</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3 text-center">Receipt Image</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {hospActivityData.bills?.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-6 text-slate-400 font-semibold">No bills generated.</td>
                              </tr>
                            ) : (
                              hospActivityData.bills.map(b => (
                                <tr key={b._id} className="hover:bg-slate-50/20 transition-all">
                                  <td className="py-2.5 px-3 font-bold text-slate-400">{b.billId}</td>
                                  <td className="py-2.5 px-3 font-bold text-slate-900">{b.patientName}</td>
                                  <td className="py-2.5 px-3 font-bold text-[#ED1C24]">{b.healthId || 'General'}</td>
                                  <td className="py-2.5 px-3 truncate max-w-[150px] text-slate-500">{b.treatmentDetails}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-slate-900">₹{b.billAmount}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                                      b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {b.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {b.billPhoto ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedBillReceipt(b);
                                          setShowBillReceiptModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 rounded px-2 py-1 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 font-bold text-[10px] cursor-pointer transition-all shadow-sm"
                                        title="View Patient Uploaded Bill Receipt"
                                      >
                                        <FileText className="h-3.5 w-3.5" /> View Receipt
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 font-semibold italic text-[10px]">No Photo</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Audit Logs */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Hospital Activity Logs & Audit Trails ({hospActivityData.logs?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                              <th className="py-2 px-3">Timestamp</th>
                              <th className="py-2 px-3">Action</th>
                              <th className="py-2 px-3">Status Code</th>
                              <th className="py-2 px-3">IP Address</th>
                              <th className="py-2 px-3">Agent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[10px]">
                            {hospActivityData.logs?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No logs registered for this hospital.</td>
                              </tr>
                            ) : (
                              hospActivityData.logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/20 transition-all">
                                  <td className="py-2 px-3 font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                  <td className="py-2 px-3 font-bold text-[#ED1C24]">{log.action}</td>
                                  <td className="py-2 px-3">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 font-bold uppercase ${
                                      log.statusCode >= 200 && log.statusCode < 300 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {log.statusCode}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{log.userAgent}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6.7. INDIVIDUAL EMPLOYEE ACTIVITY REPORT & LOGS --- */}
      {showEmpActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-emerald-500" /> Employee Performance & Activity Tracker
              </h3>
              <button onClick={() => setShowEmpActivityModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {empActivityLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ED1C24]"></div>
                  <span className="text-xs font-bold text-slate-500">Retrieving employee records...</span>
                </div>
              )}

              {empActivityError && (
                <div className="rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-600 border border-rose-100">
                  {empActivityError}
                </div>
              )}

              {!empActivityLoading && !empActivityError && empActivityData && (
                <>
                  {/* Profile Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Employee Details</h4>
                        <h2 className="text-lg font-black text-slate-900">{empActivityData.profile?.fullName}</h2>
                        <p className="text-xs text-indigo-600 font-extrabold mb-4">{empActivityData.profile?.role}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs text-slate-600">
                        <div><strong className="text-slate-400 font-medium">Email ID:</strong> {empActivityData.profile?.email}</div>
                        <div><strong className="text-slate-400 font-medium">Contact:</strong> {empActivityData.profile?.mobile}</div>
                        <div><strong className="text-slate-400 font-medium">Location:</strong> {empActivityData.profile?.blockOrPlace}, {empActivityData.profile?.district}, {empActivityData.profile?.state}</div>
                        <div><strong className="text-slate-400 font-medium">Panchayat:</strong> {empActivityData.profile?.panchayat || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Stats Metrics Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-600">Health Cards</span>
                        <span className="text-base font-black text-emerald-800">{empActivityData.stats?.healthCardsCount}</span>
                      </div>
                      <div className="bg-rose-50/50 rounded-2xl p-3 border border-rose-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-rose-600">Sewing Enrols</span>
                        <span className="text-base font-black text-rose-800">{empActivityData.stats?.silayiCount}</span>
                      </div>
                      <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-blue-600">Swarojgaar</span>
                        <span className="text-base font-black text-blue-800">{empActivityData.stats?.swarojgaarCount}</span>
                      </div>
                      <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase text-purple-600">Partners Logged</span>
                        <span className="text-base font-black text-purple-800">{empActivityData.stats?.swasthyaCount}</span>
                      </div>
                      <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100 flex flex-col justify-between col-span-2">
                        <span className="text-[9px] font-black uppercase text-amber-600 font-black">NGO Candidates Registered</span>
                        <span className="text-base font-black text-amber-800">{empActivityData.stats?.ngoCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* detailed activity lists */}
                  <div className="space-y-8 mt-6">
                    {/* NGO Candidates */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Registered Candidates & Applications ({empActivityData.activities?.ngoApplications?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                              <th className="py-2 px-3">Pravesh ID</th>
                              <th className="py-2 px-3">Candidate Name</th>
                              <th className="py-2 px-3">Role Applied</th>
                              <th className="py-2 px-3">Email ID</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {empActivityData.activities?.ngoApplications?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No candidates registered by this employee.</td>
                              </tr>
                            ) : (
                              empActivityData.activities.ngoApplications.map(a => (
                                <tr key={a._id} className="hover:bg-slate-50/20">
                                  <td className="py-2 px-3 font-bold text-slate-400">AF-{a.uniqueId}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">{a.fullName}</td>
                                  <td className="py-2 px-3 font-semibold text-indigo-500">{a.roleApplied}</td>
                                  <td className="py-2 px-3 text-slate-500">{a.email}</td>
                                  <td className="py-2 px-3">
                                    <span className="bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 text-[9px] font-black uppercase">
                                      {a.status || 'Success'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Health Cards */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Health Cards Issued ({empActivityData.activities?.healthCards?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                              <th className="py-2 px-3">Health ID</th>
                              <th className="py-2 px-3">Cardholder Name</th>
                              <th className="py-2 px-3">Mobile</th>
                              <th className="py-2 px-3">Location (City)</th>
                              <th className="py-2 px-3">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {empActivityData.activities?.healthCards?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No health cards registered by this employee.</td>
                              </tr>
                            ) : (
                              empActivityData.activities.healthCards.map(c => (
                                <tr key={c._id} className="hover:bg-slate-50/20">
                                  <td className="py-2 px-3 font-black text-rose-600">{c.healthId}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">{c.fullName}</td>
                                  <td className="py-2 px-3 text-slate-500">{c.mobile}</td>
                                  <td className="py-2 px-3 font-semibold text-slate-500">{c.address?.city || 'N/A'}</td>
                                  <td className="py-2 px-3 text-slate-400 font-medium">{new Date(c.createdAt || c.date).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sewing Yojana Beneficiaries */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Silayi Yojana Beneficiaries ({empActivityData.activities?.silayiBeneficiaries?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                              <th className="py-2 px-3">Reg ID</th>
                              <th className="py-2 px-3">Full Name</th>
                              <th className="py-2 px-3">Mobile</th>
                              <th className="py-2 px-3">Center Location</th>
                              <th className="py-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {empActivityData.activities?.silayiBeneficiaries?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No Silayi beneficiaries registered by this employee.</td>
                              </tr>
                            ) : (
                              empActivityData.activities.silayiBeneficiaries.map(b => (
                                <tr key={b._id} className="hover:bg-slate-50/20">
                                  <td className="py-2 px-3 font-bold text-slate-400">SIL-{b._id?.slice(-6).toUpperCase()}</td>
                                  <td className="py-2 px-3 font-bold text-slate-900">{b.fullName}</td>
                                  <td className="py-2 px-3 text-slate-500">{b.mobile}</td>
                                  <td className="py-2 px-3 font-semibold text-indigo-500">{b.trainingCenterLocation || 'General'}</td>
                                  <td className="py-2 px-3">
                                    <span className="bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 text-[9px] font-black uppercase">
                                      {b.paymentStatus || 'Paid'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Swarojgaar Groups */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Mahila Swarojgaar Groups ({empActivityData.activities?.swarojgaarGroups?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                              <th className="py-2 px-3">Group Name</th>
                              <th className="py-2 px-3">Leader Name</th>
                              <th className="py-2 px-3">Contact</th>
                              <th className="py-2 px-3">Total Members</th>
                              <th className="py-2 px-3">District</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                            {empActivityData.activities?.swarojgaarGroups?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No Swarojgaar groups managed by this employee.</td>
                              </tr>
                            ) : (
                              empActivityData.activities.swarojgaarGroups.map(g => (
                                <tr key={g._id} className="hover:bg-slate-50/20">
                                  <td className="py-2 px-3 font-bold text-slate-900">{g.groupName}</td>
                                  <td className="py-2 px-3 font-semibold text-indigo-500">{g.groupLeaderName}</td>
                                  <td className="py-2 px-3 text-slate-500">{g.groupLeaderPhone}</td>
                                  <td className="py-2 px-3 font-bold text-slate-800">{g.membersCount || g.members?.length || 5} Members</td>
                                  <td className="py-2 px-3 text-slate-400 font-medium">{g.location?.district || 'N/A'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Security logs & Audit Trails */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 mb-3 tracking-wide">
                        Employee Activity Logs & Audit Trails ({empActivityData.activities?.logs?.length || 0})
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-60 overflow-y-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 sticky top-0">
                              <th className="py-2 px-3">Timestamp</th>
                              <th className="py-2 px-3">Action</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3">IP Address</th>
                              <th className="py-2 px-3">Browser / Agent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 text-[10px]">
                            {empActivityData.activities?.logs?.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">No logs registered for this employee.</td>
                              </tr>
                            ) : (
                              empActivityData.activities.logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/20 transition-all">
                                  <td className="py-2 px-3 font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                  <td className="py-2 px-3 font-bold text-[#ED1C24]">{log.action}</td>
                                  <td className="py-2 px-3">
                                    <span className={`inline-flex rounded px-1.5 py-0.5 font-bold uppercase ${
                                      log.statusCode >= 200 && log.statusCode < 300 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {log.statusCode}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{log.userAgent}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                        <div className="text-right flex flex-col items-end justify-center">
                          <span className="inline-block bg-[#ed1c24] text-white text-[7px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase mb-1 leading-none">
                            {selectedHealthCard.cardType === 'Family' ? 'Family Card' : 'Single Card'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-300 tracking-wider block leading-none">HEALTH CARD</span>
                          <span className="text-sm font-extrabold text-[#ed1c24] block mt-0.5 leading-none">{selectedHealthCard.healthId}</span>
                        </div>
                      </div>

                      <div className="flex-grow flex p-4 bg-white items-center">
                        <div className="w-[90px] h-[115px] rounded-lg border-2 border-[#2e3192] bg-slate-50 overflow-hidden shrink-0 shadow-sm p-0.5">
                          <img
                            src={healthCardPhotoUrl}
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
                          {selectedHealthCard.cardType === 'Family' ? (
                            <div className="flex-grow flex flex-col justify-between text-[9px] text-left pr-3">
                              {/* Address summary */}
                              <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 mb-1.5 leading-tight">
                                <strong className="text-slate-500 uppercase text-[7px] block">Address:</strong>
                                <span className="text-slate-800 font-semibold uppercase">
                                  {selectedHealthCard.address?.village || selectedHealthCard.village}, {selectedHealthCard.address?.panchayat || selectedHealthCard.panchayat}, {selectedHealthCard.address?.block || selectedHealthCard.block}, {selectedHealthCard.address?.district || selectedHealthCard.district}, {selectedHealthCard.address?.state || selectedHealthCard.state} - {selectedHealthCard.address?.pincode || selectedHealthCard.pincode}
                                </span>
                              </div>

                              {/* Family table */}
                              <div className="border border-slate-200 rounded-xl overflow-hidden flex-grow bg-slate-50/50">
                                <table className="w-full text-left border-collapse text-[8px]">
                                  <thead>
                                    <tr className="bg-indigo-50/70 text-[#2e3192] font-black uppercase text-[7px] border-b border-slate-200">
                                      <th className="py-0.5 px-1.5">Relation</th>
                                      <th className="py-0.5 px-1.5">Name</th>
                                      <th className="py-0.5 px-1.5 text-center">Age/Sex</th>
                                      <th className="py-0.5 px-1.5">Aadhar</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedHealthCard.familyMembers && selectedHealthCard.familyMembers.map((m, idx) => (
                                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                                        <td className="py-0.5 px-1.5 font-black text-slate-500 uppercase text-[7px]">{m.relationship}</td>
                                        <td className="py-0.5 px-1.5 font-extrabold text-slate-800 uppercase truncate max-w-[100px]">{m.fullName}</td>
                                        <td className="py-0.5 px-1.5 font-bold text-slate-700 text-center">{m.age} / {m.gender?.[0]}</td>
                                        <td className="py-0.5 px-1.5 font-bold text-slate-700 font-mono">{m.aadhar?.replace(/(\d{4})/g, '$1 ').trim()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
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
                          )}

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
                  html2canvas(healthCardRef.current, { scale: 3, useCORS: true, allowTaint: true })
                    .then((canvas) => {
                      const link = document.createElement('a');
                      link.download = `HealthCard_MC_${selectedHealthCard.healthId}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    })
                    .catch((err) => {
                      console.error("Error generating health card canvas:", err);
                      alert("Failed to save image. Please try again.");
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

      {/* ========================================== */}
      {/*  MODAL 9.1: HEALTH CARD UNIFIED DOSSIER & EDITOR */}
      {/* ========================================== */}
      {showHealthCardDetailsModal && selectedHealthCardDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center font-sans animate-fade-in text-left">
          <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 my-auto">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#2e3192] to-[#1a1c54] px-4 py-3 sm:px-6 sm:py-4 text-white">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="rounded-xl bg-white/10 p-1.5 sm:p-2 border border-white/20 shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                    Health Card Details &amp; Management
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono font-bold mt-0.5 truncate">
                    Health ID: <span className="text-yellow-400 font-black">{selectedHealthCardDetails.healthId}</span> &bull; {selectedHealthCardDetails.fullName}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowHealthCardDetailsModal(false)} 
                className="rounded-xl p-1.5 sm:p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Unified Form (View all details + Edit in place) */}
            <form onSubmit={handleEditHealthCardSubmit(onSubmitEditHealthCard)} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 text-xs bg-slate-50/50 overscroll-contain">
                
                {/* Alert Messages */}
                {editHealthCardError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{editHealthCardError}</span>
                  </div>
                )}
                {editHealthCardSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{editHealthCardSuccess}</span>
                  </div>
                )}

                {/* Section 0: Payment & Registration Tracking Metadata (Audit View) */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-black text-[#2e3192] text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> Payment &amp; Enrollment Tracking
                    </h5>
                    <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 text-[8px] sm:text-[9px] font-black px-2 py-0.5 uppercase border border-emerald-200">
                      Paid Success
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Order ID</span>
                      <span className="font-bold text-slate-800 font-mono text-[9px] sm:text-[10px] break-all block">{selectedHealthCardDetails.orderId || 'N/A'}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Payment ID</span>
                      <span className="font-bold text-slate-800 font-mono text-[9px] sm:text-[10px] break-all block">{selectedHealthCardDetails.paymentId || 'N/A'}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Amount Paid</span>
                      <span className="font-extrabold text-emerald-700 text-xs block">₹{selectedHealthCardDetails.amount || (selectedHealthCardDetails.cardType === 'Family' ? 499 : 201)}.00</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Enrollment Date</span>
                      <span className="font-bold text-slate-700 text-[9px] sm:text-[10px] block">
                        {selectedHealthCardDetails.createdAt ? new Date(selectedHealthCardDetails.createdAt).toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Patient Photo & Card Settings */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  <div className="relative group shrink-0 flex flex-col items-center">
                    <img
                      src={editHealthCardPhotoPreview || '/logo.jpg'}
                      alt="Cardholder Photo"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-[#2e3192] object-cover shadow-sm bg-slate-50 p-0.5"
                      onError={handleImageError}
                    />
                    <label 
                      htmlFor="editUnifiedPhotoInput" 
                      className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[10px] font-bold gap-1"
                    >
                      <Camera className="h-5 w-5" /> Change
                    </label>
                  </div>

                  <div className="flex-grow space-y-2.5 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-xs">Patient Passport Photo (मरीज की फोटो)</h5>
                        <p className="text-[10px] text-slate-500">
                          Clear front-facing portrait. Auto-compressed &amp; optimized.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="editUnifiedPhotoInput"
                          accept="image/*"
                          onChange={handleEditPhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="editUnifiedPhotoInput"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-all"
                        >
                          <Camera className="h-3.5 w-3.5 text-[#2e3192]" /> Choose New Image
                        </label>
                        {selectedEditHealthCardPhoto && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-600 block sm:inline mt-1 sm:mt-0">
                            &bull; Selected ({Math.round(selectedEditHealthCardPhoto.size / 1024)} KB)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Card Type</label>
                        <select
                          {...regEditHealthCard('cardType')}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white focus:border-[#2e3192] focus:outline-none text-indigo-700"
                        >
                          <option value="Single">Single Health Card (₹201)</option>
                          <option value="Family">Family Health Card (₹499)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Expiry Date</label>
                        <input
                          type="date"
                          {...regEditHealthCard('expiryDate')}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:border-[#2e3192] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Registered By</label>
                        <input
                          type="text"
                          {...regEditHealthCard('registeredBy')}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:border-[#2e3192] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Details */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-[#2e3192] text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 1. Personal &amp; Identification Details
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Patient Full Name *</label>
                      <input
                        type="text"
                        {...regEditHealthCard('fullName', { required: 'Name is required' })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Mobile Number (10 Digits) *</label>
                      <input
                        type="text"
                        maxLength={10}
                        {...regEditHealthCard('mobile', { required: 'Mobile is required', pattern: /^\d{10}$/ })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#2e3192] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Aadhar Card (12 Digits) *</label>
                      <input
                        type="text"
                        maxLength={12}
                        {...regEditHealthCard('aadhar', { required: 'Aadhar is required', pattern: /^\d{12}$/ })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#2e3192] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Email Address</label>
                      <input
                        type="email"
                        {...regEditHealthCard('email')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Age (Years) *</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        {...regEditHealthCard('age', { required: 'Age is required' })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Gender *</label>
                      <select
                        {...regEditHealthCard('gender')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-[#2e3192] focus:outline-none"
                      >
                        <option value="Male">Male (पुरुष)</option>
                        <option value="Female">Female (महिला)</option>
                        <option value="Other">Other (अन्य)</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Blood Group *</label>
                      <select
                        {...regEditHealthCard('bloodGroup')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-[#2e3192] focus:outline-none text-rose-600"
                      >
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

                {/* Section 3: Residential Address */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-[#2e3192] text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 2. Residential Address Details
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Village / Ward</label>
                      <input
                        type="text"
                        {...regEditHealthCard('village')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Panchayat</label>
                      <input
                        type="text"
                        {...regEditHealthCard('panchayat')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Block</label>
                      <input
                        type="text"
                        {...regEditHealthCard('block')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">District *</label>
                      <input
                        type="text"
                        {...regEditHealthCard('district', { required: 'District is required' })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">State *</label>
                      <input
                        type="text"
                        {...regEditHealthCard('state', { required: 'State is required' })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-[#2e3192] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Pin Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        {...regEditHealthCard('pincode')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#2e3192] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Family Members Dynamic Editor (If Family Card) */}
                {editCardTypeWatch === 'Family' && (
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h5 className="font-black text-[#2e3192] text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 3. Family Members ({editFamilyMembers.length})
                      </h5>
                      <button
                        type="button"
                        onClick={handleAddEditFamilyMember}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] hover:bg-indigo-100 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Add Member
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {editFamilyMembers.map((member, idx) => (
                        <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-12 gap-2 items-center text-left">
                          <div className="col-span-1 sm:col-span-3">
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Relation</label>
                            <input
                              type="text"
                              value={member.relationship || ''}
                              onChange={(e) => handleEditFamilyMemberChange(idx, 'relationship', e.target.value)}
                              placeholder="e.g. Father, Mother"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold bg-white focus:outline-none uppercase"
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Full Name</label>
                            <input
                              type="text"
                              value={member.fullName || ''}
                              onChange={(e) => handleEditFamilyMemberChange(idx, 'fullName', e.target.value)}
                              placeholder="Member Name"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold bg-white focus:outline-none uppercase"
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Age</label>
                            <input
                              type="number"
                              value={member.age || ''}
                              onChange={(e) => handleEditFamilyMemberChange(idx, 'age', e.target.value)}
                              placeholder="Age"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold bg-white focus:outline-none"
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <label className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Aadhar (12 Digits)</label>
                            <input
                              type="text"
                              maxLength={12}
                              value={member.aadhar || ''}
                              onChange={(e) => handleEditFamilyMemberChange(idx, 'aadhar', e.target.value)}
                              placeholder="Aadhar No."
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono font-bold bg-white focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveEditFamilyMember(idx)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                              title="Remove Member"
                            >
                              <Trash2 className="h-4 w-4" /> <span className="sm:hidden">Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Form Footer (Responsive & Sticky) */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-2 p-3 sm:p-4 border-t border-slate-200 bg-white shadow-lg">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex-1">
                  <button
                    type="button"
                    onClick={() => setShowHealthCardDetailsModal(false)}
                    className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 px-3 text-xs font-bold text-slate-700 cursor-pointer text-center transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHealthCardDetailsModal(false);
                      setSelectedHealthCard(selectedHealthCardDetails);
                      setShowHealthCardModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-[#2e3192] hover:bg-[#1a1c54] text-white py-2.5 px-3 text-xs font-bold shadow-xs cursor-pointer text-center transition-all"
                  >
                    <Eye className="h-4 w-4 shrink-0" /> <span className="truncate">View Card</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={editHealthCardSubmitting}
                  className="w-full sm:flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-center transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{editHealthCardSubmitting ? 'Saving Changes...' : 'Save & Update Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 9. ISSUE TRAINING CERTIFICATE --- */}
      {showIssueCertModal && selectedCertBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-[#000080]" /> Issue Training Certificate
              </h3>
              <button onClick={() => setShowIssueCertModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCertFormSubmitting(true);
              setCertFormError('');
              try {
                const formData = new FormData(e.target);
                const payload = {
                  certificateNo: formData.get('certificateNo'),
                  certificateDate: formData.get('certificateDate'),
                  trainingStartDate: certStartDate,
                  trainingEndDate: certEndDate,
                  trainingDuration: certDuration,
                  trainingGrade: formData.get('trainingGrade'),
                  nameInHindi: certNameHindi,
                  guardianNameInHindi: certGuardianHindi
                };

                const res = await apiClient.put(`/api/schemes/admin/issue-certificate/${selectedCertBeneficiary._id}`, payload);
                if (res.data && res.data.success) {
                  alert("Certificate issued successfully!");
                  setShowIssueCertModal(false);
                  setSelectedCertBeneficiary(null);
                  syncData();
                } else {
                  setCertFormError(res.data?.message || "Failed to issue certificate.");
                }
              } catch (err) {
                console.error(err);
                setCertFormError(err.response?.data?.message || "Server error issuing certificate.");
              } finally {
                setCertFormSubmitting(false);
              }
            }} className="p-6 space-y-4">
              {certFormError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-xl">
                  {certFormError}
                </div>
              )}

              {/* Trainee Name English & Hindi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Trainee Name (English)</label>
                  <input
                    type="text"
                    value={certNameEng}
                    onChange={(e) => {
                      setCertNameEng(e.target.value);
                      setCertNameHindi(transliterateToHindi(e.target.value));
                    }}
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 uppercase">Candidate Name (हिंदी में)</label>
                  <input
                    type="text"
                    value={certNameHindi}
                    onChange={(e) => setCertNameHindi(e.target.value)}
                    placeholder="हिंदी नाम"
                    className="w-full border border-indigo-200 bg-indigo-50/50 font-bold text-indigo-950 rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
              </div>

              {/* Guardian Name English & Hindi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Father/Husband Name (English)</label>
                  <input
                    type="text"
                    value={certGuardianEng}
                    onChange={(e) => {
                      setCertGuardianEng(e.target.value);
                      setCertGuardianHindi(transliterateToHindi(e.target.value));
                    }}
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-700 uppercase">Father/Husband Name (हिंदी में)</label>
                  <input
                    type="text"
                    value={certGuardianHindi}
                    onChange={(e) => setCertGuardianHindi(e.target.value)}
                    placeholder="हिंदी में पति/पिता का नाम"
                    className="w-full border border-indigo-200 bg-indigo-50/50 font-bold text-indigo-950 rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate No.</label>
                <input
                  type="text"
                  name="certificateNo"
                  required
                  defaultValue={`MUZ/25-26/KUD/${selectedCertBeneficiary.serialNumber ? selectedCertBeneficiary.serialNumber.slice(-3) : '212'}`}
                  className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Training Start Date</label>
                  <input
                    type="date"
                    name="trainingStartDate"
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duration (Months/Days)</label>
                  <input
                    type="text"
                    name="trainingDuration"
                    value={certDuration}
                    onChange={(e) => setCertDuration(e.target.value)}
                    required
                    placeholder="e.g. 2 माह"
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Training End Date</label>
                  <input
                    type="date"
                    name="trainingEndDate"
                    value={certEndDate}
                    onChange={(e) => setCertEndDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Issue</label>
                  <input
                    type="date"
                    name="certificateDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Performance Grade</label>
                <select
                  name="trainingGrade"
                  required
                  defaultValue="उत्कृष्ट"
                  className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#000080] focus:outline-none bg-white"
                >
                  <option value="उत्कृष्ट">उत्कृष्ट (Excellent)</option>
                  <option value="सामान्य">सामान्य (Average)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowIssueCertModal(false)}
                  className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certFormSubmitting}
                  className="flex-1 rounded-xl bg-[#000080] hover:bg-slate-900 text-white py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {certFormSubmitting ? 'Saving...' : 'Generate & Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 10. TRAINING CERTIFICATE PREVIEW --- */}
      {showCertPreviewModal && selectedCertData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-[#000080]" /> Issued Training Certificate View
              </h3>
              <button onClick={() => setShowCertPreviewModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Name Editor Bar for Admin */}
            <div className="bg-amber-50/80 border-b border-amber-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  ✏️ Edit Candidate Names in Hindi (सर्टिफिकेट पर हिंदी नाम बदलें)
                </span>
                {certNameUpdateSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-fade-in">
                    {certNameUpdateSuccess}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Name (English)</label>
                  <input
                    type="text"
                    value={certNameEng}
                    onChange={(e) => {
                      setCertNameEng(e.target.value);
                      setCertNameHindi(transliterateToHindi(e.target.value));
                    }}
                    className="w-full border border-slate-300 font-bold rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-0.5">नाम (हिंदी में)</label>
                  <input
                    type="text"
                    value={certNameHindi}
                    onChange={(e) => setCertNameHindi(e.target.value)}
                    className="w-full border border-indigo-300 font-bold rounded-lg px-2.5 py-1.5 text-xs bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Guardian (English)</label>
                  <input
                    type="text"
                    value={certGuardianEng}
                    onChange={(e) => {
                      setCertGuardianEng(e.target.value);
                      setCertGuardianHindi(transliterateToHindi(e.target.value));
                    }}
                    className="w-full border border-slate-300 font-bold rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-0.5">पति/पिता का नाम (हिंदी में)</label>
                  <input
                    type="text"
                    value={certGuardianHindi}
                    onChange={(e) => setCertGuardianHindi(e.target.value)}
                    className="w-full border border-indigo-300 font-bold rounded-lg px-2.5 py-1.5 text-xs bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isUpdatingCertNames}
                  onClick={() => handleUpdateCertNames(selectedCertData._id)}
                  className="px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingCertNames ? 'Saving Changes...' : 'Save & Update Certificate Names'}
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-100 overflow-hidden flex justify-center items-center h-[240px] sm:h-[380px] md:h-[480px] lg:h-[610px]">
              <div className="origin-center scale-[0.38] sm:scale-[0.58] md:scale-[0.8] lg:scale-100 shrink-0">
                <div 
                  ref={certRef}
                  className="w-[842px] h-[595px] bg-white p-3 select-none relative font-sans text-slate-800 shrink-0 border-[3px] border-[#ff6600]"
                style={{ 
                  backgroundImage: 'radial-gradient(circle, #fdfcf9 0%, #ffffff 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                {/* Middle Blue Border */}
                <div className="w-full h-full border-[3px] border-[#000080] p-1 relative">
                  
                  {/* Innermost Orange Border */}
                  <div className="w-full h-full border-2 border-[#ff6600] p-4 flex flex-col justify-between relative bg-white/95">
                    
                    {/* Top Row: Reg details and logos */}
                    <div className="flex justify-between items-start w-full">
                      {/* Left: Reg No and Aagaj Logo */}
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-black text-[#ff6600] tracking-wide uppercase">
                          REG NO : 759445
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <img src="/logo.jpg" alt="Aagaj Logo" className="h-10 w-10 object-contain rounded-full" />
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-black text-[#000080] leading-none tracking-wide">AAGAJ</span>
                            <span className="text-[8px] font-bold text-slate-500 leading-none">FOUNDATION</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: NGO Darpan and Skill India Logo */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-[#ff6600] tracking-wide uppercase">
                          NGO DARPAN NO – BR/2020/0260968
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <img 
                            src="/skill_india.png" 
                            alt="Skill India Logo" 
                            className="h-10 object-contain" 
                            crossOrigin="anonymous"
                            onError={(e) => { e.target.src = '/logo.jpg'; }}
                          />
                          <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-[#000080] leading-none">Skill India</span>
                            <span className="text-[7px] font-bold text-[#ff6600] leading-none mt-0.5">कौशल भारत - कुशल भारत</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Content Group */}
                    <div className="flex flex-col items-center justify-center flex-grow py-2 text-center">
                      
                      {/* Main Hindi Title */}
                      <h1 className="text-4xl font-extrabold text-[#0056b3] tracking-wide font-serif mb-1.5" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}>
                        आगाज फाउंडेशन
                      </h1>

                      {/* Sub-header Orange Border Box */}
                      <div className="border-[3px] border-[#ffb900] bg-white rounded-xl px-8 py-1.5 shadow-sm mb-2 max-w-md">
                        <h2 className="text-xl font-extrabold text-[#800000] tracking-wider uppercase font-serif">
                          महिला सिलाई प्रशिक्षण केंद्र
                        </h2>
                      </div>

                      {/* Certificate Word Heading */}
                      <div className="relative mb-3 flex flex-col items-center">
                        <h3 className="text-2xl font-black text-[#0056b3] tracking-[0.2em] uppercase font-sans">
                          CERTIFICATE
                        </h3>
                        <div className="w-40 h-[3px] bg-[#0056b3] mt-1 relative">
                          <div className="absolute inset-x-0 -bottom-[3px] h-[1px] bg-[#0056b3]"></div>
                        </div>
                      </div>

                      {/* Certificate Number & Date Bar */}
                      <div className="flex justify-between items-center w-full px-6 mb-4 text-xs font-bold text-slate-800">
                        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl px-4 py-1.5 text-center shadow-sm">
                          प्रमाण पत्र संख्या : <span className="font-extrabold font-mono text-indigo-900 select-all">{selectedCertData.certificateNo}</span>
                        </div>
                        <div className="pr-4">
                          दिनांक : <span className="font-extrabold text-slate-900">{formatToIndianDate(selectedCertData.certificateDate)}</span>
                        </div>
                      </div>

                      {/* Hindi Certificate Details Paragraph */}
                      <div className="w-full px-8 text-center text-sm font-semibold text-slate-700 leading-relaxed space-y-2">
                        <p className="m-0 text-base">
                          प्रमाणित किया जाता हैं कि सुश्री/श्रीमती &nbsp;
                          <strong className="text-slate-950 text-lg font-black border-b border-dashed border-slate-650 px-2 py-0.5 select-all font-serif">
                            {certNameHindi || selectedCertData.nameInHindi || transliterateToHindi(selectedCertData.name)}
                          </strong>
                          &nbsp;&nbsp; पति/पिता - &nbsp;
                          <strong className="text-slate-900 font-extrabold select-all font-serif">
                            {certGuardianHindi || selectedCertData.guardianNameInHindi || transliterateToHindi(selectedCertData.guardianName || 'N/A')}
                          </strong>
                        </p>
                        
                        <p className="m-0">
                          इस संस्था द्वारा निर्धारित अवधि दिनांक
                        </p>

                        {/* Date duration badge */}
                        <div className="inline-block border border-indigo-200 bg-[#f4f7fc] text-[#000080] font-black rounded-xl px-6 py-1.5 shadow-sm text-sm my-1">
                          {formatToIndianDate(selectedCertData.trainingStartDate)} &nbsp; से &nbsp; {formatToIndianDate(selectedCertData.trainingEndDate)} &nbsp; ({selectedCertData.trainingDuration || '2 माह'}) माह / वर्ष के
                        </div>

                        <p className="m-0 text-slate-800">
                          महिला सिलाई प्रशिक्षण पाठ्यक्रम में संस्था के नियमानुसार सिलाई प्रशिक्षण प्राप्त किया हैं |
                        </p>
                        <p className="m-0 text-slate-800">
                          इनके द्वारा पाठ्यक्रम प्रशिक्षण के दौरान &nbsp;
                          <strong className="text-emerald-700 font-black text-base border-b border-dashed border-emerald-500 px-2">
                            {selectedCertData.trainingGrade || 'उत्कृष्ट'}
                          </strong>
                          &nbsp; प्रशिक्षण किया गया |
                        </p>
                      </div>

                    </div>

                    {/* Bottom Footer Section */}
                    <div className="flex justify-between items-end w-full pt-2 border-t border-slate-100">
                      
                      {/* Left Signature Block */}
                      <div className="text-center w-36 text-[10px] leading-tight font-semibold text-slate-500">
                        <div className="h-10"></div>
                        <div className="border-t border-slate-300 pt-1 uppercase">
                          <p className="font-bold text-slate-700 m-0 text-[9px]">Settler Cum Secretary</p>
                          <span className="text-[8px] text-slate-400">AAGAJ FOUNDATION</span>
                        </div>
                      </div>

                      {/* Middle-Left Signature Block */}
                      <div className="text-center w-36 text-[10px] leading-tight font-semibold text-slate-500">
                        <div className="h-10"></div>
                        <div className="border-t border-slate-300 pt-1 uppercase">
                          <p className="font-bold text-slate-700 m-0 text-[9px]">Settler Cum President</p>
                          <span className="text-[8px] text-slate-400">AAGAJ FOUNDATION</span>
                        </div>
                      </div>

                      {/* Coordinator Name & Stamp Overlay */}
                      <div className="text-center w-28 text-[10px] leading-tight font-semibold text-slate-600 relative">
                        {/* Aagaj Round Seal overlay */}
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 rotate-[-12deg] w-[70px] h-[70px] rounded-full border-2 border-indigo-600/60 flex flex-col items-center justify-center text-center opacity-85 select-none pointer-events-none bg-white/20">
                          <div className="absolute inset-0.5 rounded-full border border-dashed border-indigo-500/60"></div>
                          <span className="text-[5px] text-indigo-750 font-black uppercase leading-none tracking-tight">AAGAJ FOUNDATION</span>
                          <span className="text-[4px] text-indigo-600 leading-none mt-0.5">Reg. No.</span>
                          <span className="text-[5px] text-indigo-700 font-extrabold leading-none">759445/2020</span>
                          <span className="absolute text-[8px] text-indigo-500/35 font-bold italic rotate-[15deg]">Aagaj</span>
                        </div>

                        <div className="h-10"></div>
                        <div className="border-t border-slate-300 pt-1 uppercase">
                          <span className="font-black text-slate-800 text-[10px]">समन्वयक</span>
                        </div>
                      </div>

                      {/* Right: QR Code and ISO stamp */}
                      <div className="flex items-center gap-3 pr-2 select-none">
                        
                        {/* Dynamic QR Code */}
                        <div className="flex flex-col items-center p-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=55x55&data=AAGAJ-CERT:${selectedCertData.certificateNo}%0ANAME:${encodeURIComponent(selectedCertData.name)}`}
                            alt="Verification QR"
                            className="h-12 w-12 object-contain"
                            crossOrigin="anonymous"
                          />
                          <span className="text-[5px] font-black text-slate-400 mt-0.5">SCAN VERIFY</span>
                        </div>

                        {/* Gold ISO 9001 Seal */}
                        <div className="w-14 h-14 rounded-full border-[3px] border-yellow-500 bg-[#0056b3] text-white flex flex-col items-center justify-center text-center shadow relative shrink-0">
                          <div className="absolute inset-[0.5px] rounded-full border border-yellow-400 border-dashed"></div>
                          <span className="text-[5px] font-black text-yellow-300 uppercase leading-none tracking-widest">ISO</span>
                          <span className="text-[8px] font-black text-white leading-none my-0.5">9001:2015</span>
                          <span className="text-[4px] font-semibold text-yellow-300 leading-none">CERTIFIED</span>
                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

            <div className="flex gap-2 p-4 border-t border-slate-100 bg-slate-50 w-full">
              <button onClick={() => setShowCertPreviewModal(false)} className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                Close View
              </button>
              <button
                onClick={() => {
                  if (!certRef.current) return;
                  html2canvas(certRef.current, { scale: 3, useCORS: true, allowTaint: true })
                    .then((canvas) => {
                      const link = document.createElement('a');
                      link.download = `Certificate_${selectedCertData.certificateNo.replace(/\//g, '_')}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    })
                    .catch((err) => {
                      console.error("Error generating certificate canvas:", err);
                      alert("Failed to save image. Please try again.");
                    });
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Certificate
              </button>
              <button 
                onClick={() => {
                  // Copy all parent stylesheets (both links and style blocks) to preserve Tailwind CSS classes/variables
                  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
                    .map(style => style.outerHTML)
                    .join('\n');

                  const printable = certRef.current.outerHTML;
                  const win = window.open('', '_blank');
                  win.document.write(`
                    <html>
                      <head>
                        <title>Print Certificate</title>
                        <base href="${window.location.origin}/">
                        ${styles}
                        <style>
                          * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                          }
                          body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background-color: #fff;
                          }
                          @page {
                            size: A4 landscape;
                            margin: 0;
                          }
                          .cert-container {
                            width: 842px;
                            height: 595px;
                            box-sizing: border-box;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="cert-container">${printable}</div>
                        <script>
                          window.onload = function() {
                            setTimeout(function() {
                              window.print();
                              window.close();
                            }, 500);
                          };
                        </script>
                      </body>
                    </html>
                  `);
                  win.document.close();
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] text-white px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer animate-pulse"
              >
                <Printer className="h-4 w-4" /> Print Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- EDIT HEALTH CARD MODAL --- */}
      {showEditHealthCardModal && selectedEditHealthCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in my-8">
            <div className="flex items-center justify-between bg-slate-900 text-white p-4">
              <h3 className="text-sm font-extrabold uppercase tracking-tight flex items-center gap-1.5">
                <IdCard className="h-4.5 w-4.5 text-white" /> Edit Health Card Holder Details
              </h3>
              <button 
                onClick={() => { setShowEditHealthCardModal(false); setSelectedEditHealthCard(null); setSelectedEditHealthCardPhoto(null); }} 
                className="rounded-lg p-1 text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {editHealthCardError && (
                <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  ❌ {editHealthCardError}
                </div>
              )}
              
              <form onSubmit={handleEditHealthCardSubmit(onEditHealthCardSubmitHandler)} className="space-y-6">
                {/* Section 1: Personal Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Cardholder Personal Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Full Name</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('fullName', { required: 'Name is required' })} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                      {editHealthCardErrors.fullName && <p className="text-red-500 text-[10px] mt-0.5">{editHealthCardErrors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Mobile Number</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('mobile', { required: 'Mobile required', pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' } })} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                      {editHealthCardErrors.mobile && <p className="text-red-500 text-[10px] mt-0.5">{editHealthCardErrors.mobile.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        {...regEditHealthCard('email')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Aadhar Card Number</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('aadhar', { required: 'Aadhar number required', pattern: { value: /^\d{12}$/, message: 'Must be 12 digits' } })} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                      {editHealthCardErrors.aadhar && <p className="text-red-500 text-[10px] mt-0.5">{editHealthCardErrors.aadhar.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Age</label>
                      <input 
                        type="number" 
                        {...regEditHealthCard('age', { required: 'Age required' })} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Gender</label>
                      <select 
                        {...regEditHealthCard('gender')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs bg-white outline-none focus:border-[#ED1C24] cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Blood Group</label>
                      <select 
                        {...regEditHealthCard('bloodGroup')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs bg-white outline-none focus:border-[#ED1C24] cursor-pointer"
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

                {/* Section 2: Address */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Residential Address Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Village / Locality</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('village')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Panchayat Name</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('panchayat')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Block Name</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('block')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">District</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('district')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">State</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('state')} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Pincode</label>
                      <input 
                        type="text" 
                        {...regEditHealthCard('pincode', { pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' } })} 
                        className="block mt-1 w-full rounded-xl border border-slate-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Expiry Date */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Validity & Card Configurations</h4>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 text-rose-600">Expiry Date (YYYY-MM-DD)</label>
                    <input 
                      type="date" 
                      {...regEditHealthCard('expiryDate', { required: 'Expiry date is required' })} 
                      className="block mt-1 w-full rounded-xl border border-rose-200 py-2 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24]" 
                    />
                    {editHealthCardErrors.expiryDate && <p className="text-red-500 text-[10px] mt-0.5">{editHealthCardErrors.expiryDate.message}</p>}
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500">Update Profile Photo (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedEditHealthCardPhoto(e.target.files[0]);
                        }
                      }}
                      className="block mt-1 w-full rounded-xl border border-slate-200 py-1.5 px-3 text-slate-800 text-xs outline-none focus:border-[#ED1C24] cursor-pointer file:mr-4 file:py-1 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" 
                    />
                    <p className="text-[9px] text-slate-400 mt-1 font-semibold">Upload a formal passport-sized photo to overwrite the current cardholder image.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => { setShowEditHealthCardModal(false); setSelectedEditHealthCard(null); setSelectedEditHealthCardPhoto(null); }} 
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={editHealthCardSubmitting} 
                    className="flex-grow rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-2.5 text-xs font-bold shadow-md active:scale-95 transition-all duration-150 cursor-pointer"
                  >
                    {editHealthCardSubmitting ? 'Saving changes...' : 'Save Health Card Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 11. ISSUE / EDIT PARTNERSHIP CERTIFICATE --- */}
      {showIssuePartnershipCertModal && selectedPartnershipCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="text-xs font-black text-[#0D5C53] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4.5 w-4.5 text-[#8B1E4B]" /> {selectedPartnershipCert.certificateIssued ? 'Edit Partnership Certificate Details' : 'Issue Official Partnership Certificate'}
              </h3>
              <button onClick={() => setShowIssuePartnershipCertModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setPartnershipCertSubmitting(true);
              setPartnershipCertError('');
              try {
                const formData = new FormData(e.target);
                const payload = {
                  businessName: formData.get('businessName'),
                  certificateNo: formData.get('certificateNo'),
                  partnershipDate: formData.get('partnershipDate'),
                  validUntil: formData.get('validUntil'),
                  certificateLocation: formData.get('certificateLocation')
                };

                const res = await apiClient.put(`/api/hospital-admin-system/admin/issue-partnership-certificate/${selectedPartnershipCert.uniqueId}`, payload);
                if (res.data && res.data.success) {
                  alert("Official Partnership Certificate details saved successfully!");
                  setShowIssuePartnershipCertModal(false);
                  setSelectedPartnershipCert(res.data.data);
                  setShowPartnershipCertModal(true);
                  syncData();
                } else {
                  setPartnershipCertError(res.data?.message || "Failed to issue certificate.");
                }
              } catch (err) {
                console.error(err);
                setPartnershipCertError(err.response?.data?.message || "Server error issuing partnership certificate.");
              } finally {
                setPartnershipCertSubmitting(false);
              }
            }} className="p-6 space-y-4">
              {partnershipCertError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-xl">
                  {partnershipCertError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Partner Organization / Facility Name</label>
                <input
                  type="text"
                  name="businessName"
                  required
                  defaultValue={selectedPartnershipCert.businessName}
                  className="w-full border border-slate-200 bg-white text-slate-900 font-black rounded-xl px-3 py-2 text-xs focus:border-[#0D5C53] focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Certificate Number</label>
                <input
                  type="text"
                  name="certificateNo"
                  required
                  defaultValue={selectedPartnershipCert.certificateNo || `AF/PARTNER/${new Date().getFullYear()}/${selectedPartnershipCert.uniqueId}`}
                  className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#0D5C53] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Partnership Date</label>
                  <input
                    type="date"
                    name="partnershipDate"
                    required
                    defaultValue={selectedPartnershipCert.partnershipDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#0D5C53] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Valid Until</label>
                  <input
                    type="text"
                    name="validUntil"
                    required
                    defaultValue={selectedPartnershipCert.validUntil || 'Lifelong Partnership'}
                    placeholder="e.g. Lifelong / 2027-07-23"
                    className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#0D5C53] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Location (City, State)</label>
                <input
                  type="text"
                  name="certificateLocation"
                  required
                  defaultValue={selectedPartnershipCert.certificateLocation || `${selectedPartnershipCert.address?.city || 'Muzaffarpur'}, ${selectedPartnershipCert.address?.state || 'Bihar'}`}
                  className="w-full border border-slate-200 font-bold rounded-xl px-3 py-2 text-xs focus:border-[#0D5C53] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssuePartnershipCertModal(false)}
                  className="flex-1 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={partnershipCertSubmitting}
                  className="flex-1 rounded-xl bg-[#0D5C53] hover:bg-[#083e38] text-white py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {partnershipCertSubmitting ? 'Saving...' : 'Save & Update Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 12. PARTNERSHIP CERTIFICATE PREVIEW MODAL --- */}
      {showPartnershipCertModal && selectedPartnershipCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-2 sm:p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 p-2.5 sm:p-4 text-left relative space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-amber-50 border border-amber-200 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
              <span className="text-[11px] sm:text-xs font-bold text-amber-900 flex items-center gap-1.5">
                ✏️ Want to change certificate details or extend validity?
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPartnershipCertModal(false);
                  setShowIssuePartnershipCertModal(true);
                }}
                className="self-end sm:self-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Edit className="h-3.5 w-3.5" /> Certificate Details
              </button>
            </div>
            <PartnershipCertificate
              partner={selectedPartnershipCert}
              onClose={() => setShowPartnershipCertModal(false)}
            />
          </div>
        </div>
      )}

      {/* --- MODAL 13. MEMBERSHIP CERTIFICATE PREVIEW MODAL --- */}
      {showMembershipCertModal && selectedMembershipCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-2 sm:p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 p-3 sm:p-5 text-left relative space-y-4">
            <div className="flex justify-between items-center bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
                <Award className="h-4.5 w-4.5 text-rose-700" />
                <span>Official Membership Certificate - {selectedMembershipCert.fullName} ({selectedMembershipCert.membershipId})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMembershipCertModal(false);
                    handleOpenMemberDetails(selectedMembershipCert);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  title="View and Edit Full Member Details"
                >
                  <FileText className="h-3.5 w-3.5" /> Details &amp; Edit
                </button>
                <button
                  onClick={() => setShowMembershipCertModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <MembershipCertificate
              member={selectedMembershipCert}
              onClose={() => setShowMembershipCertModal(false)}
            />
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/*  MODAL 13.1: MEMBERSHIP UNIFIED DOSSIER & EDITOR */}
      {/* ========================================== */}
      {showMemberDetailsModal && selectedMemberDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center font-sans animate-fade-in text-left">
          <div className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 my-auto">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-rose-900 via-[#8B1E4B] to-rose-950 px-4 py-3 sm:px-6 sm:py-4 text-white">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="rounded-xl bg-white/10 p-1.5 sm:p-2 border border-white/20 shrink-0">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-[#fdd831]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                    Official Membership Dossier &amp; Management
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-rose-200 font-mono font-bold mt-0.5 truncate">
                    Member ID: <span className="text-[#fdd831] font-black">{selectedMemberDetails.membershipId}</span> &bull; {selectedMemberDetails.fullName}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowMemberDetailsModal(false)} 
                className="rounded-xl p-1.5 sm:p-2 text-rose-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Unified Form (View all details + Edit in place) */}
            <form onSubmit={handleEditMemberSubmit(onSubmitEditMember)} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 text-xs bg-slate-50/50 overscroll-contain">
                
                {/* Alert Messages */}
                {editMemberError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{editMemberError}</span>
                  </div>
                )}
                {editMemberSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl sm:rounded-2xl flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{editMemberSuccess}</span>
                  </div>
                )}

                {/* Section 0: Payment & Registration Tracking Metadata (Audit View) */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-black text-rose-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> Payment &amp; Enrollment Tracking
                    </h5>
                    <span className="inline-flex rounded-full bg-emerald-100 text-emerald-800 text-[8px] sm:text-[9px] font-black px-2 py-0.5 uppercase border border-emerald-200">
                      {selectedMemberDetails.paymentStatus || 'Paid'} Success
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Order ID</span>
                      <span className="font-bold text-slate-800 font-mono text-[9px] sm:text-[10px] break-all block">{selectedMemberDetails.orderId || 'N/A'}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Payment ID</span>
                      <span className="font-bold text-slate-800 font-mono text-[9px] sm:text-[10px] break-all block">{selectedMemberDetails.paymentId || 'N/A'}</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Amount Paid</span>
                      <span className="font-extrabold text-emerald-700 text-xs block">₹{selectedMemberDetails.paymentAmount || 100}.00</span>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase block">Registration Date</span>
                      <span className="font-bold text-slate-700 text-[9px] sm:text-[10px] block">
                        {selectedMemberDetails.createdAt ? new Date(selectedMemberDetails.createdAt).toLocaleString('en-IN') : selectedMemberDetails.joiningDate || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Passport Photo & Membership Configuration */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  <div className="relative group shrink-0 flex flex-col items-center">
                    <img
                      src={editMemberPhotoPreview || '/logo.jpg'}
                      alt="Member Photo"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-rose-800 object-cover shadow-sm bg-slate-50 p-0.5"
                      onError={handleImageError}
                    />
                    <label 
                      htmlFor="editMemberPhotoInput" 
                      className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[10px] font-bold gap-1"
                    >
                      <Camera className="h-5 w-5" /> Change
                    </label>
                  </div>

                  <div className="flex-grow space-y-2.5 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-xs">Member Passport Photo (सदस्य का फोटो)</h5>
                        <p className="text-[10px] text-slate-500">
                          Clear portrait for official NGO Certificate. Auto-compressed &amp; optimized.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="editMemberPhotoInput"
                          accept="image/*"
                          onChange={handleEditMemberPhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="editMemberPhotoInput"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer shadow-xs transition-all"
                        >
                          <Camera className="h-3.5 w-3.5 text-rose-700" /> Choose New Image
                        </label>
                        {selectedEditMemberPhoto && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-600 block sm:inline mt-1 sm:mt-0">
                            &bull; Selected ({Math.round(selectedEditMemberPhoto.size / 1024)} KB)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Membership Type</label>
                        <select
                          {...regEditMember('membershipType')}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white focus:border-rose-700 focus:outline-none text-rose-900"
                        >
                          <option value="General Member">General Member (₹100)</option>
                          <option value="Volunteer">Volunteer (₹100)</option>
                          <option value="Active Member">Active Member (₹500)</option>
                          <option value="Life Member">Life Member (₹1000)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Joining Date</label>
                        <input
                          type="date"
                          {...regEditMember('joiningDate')}
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:border-rose-700 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Certificate No</label>
                        <input
                          type="text"
                          {...regEditMember('certificateNo')}
                          placeholder="e.g. AF/MBR/2026/0101"
                          className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold font-mono focus:border-rose-700 focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Details */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-rose-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 1. Personal &amp; Identity Details (व्यक्तिगत विवरण)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Member Full Name (पूरा नाम) *</label>
                      <input
                        type="text"
                        {...regEditMember('fullName', { required: 'Full Name is required' })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Father / Husband's Name (पिता/पति का नाम)</label>
                      <input
                        type="text"
                        {...regEditMember('fatherOrHusbandName')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">DOB / Age (जन्म तिथि / आयु)</label>
                      <input
                        type="text"
                        {...regEditMember('dobOrAge')}
                        placeholder="e.g. 15/08/1995 or 28 Years"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Gender (लिंग) *</label>
                      <select
                        {...regEditMember('gender')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold bg-white focus:border-rose-700 focus:outline-none"
                      >
                        <option value="Female">Female (महिला)</option>
                        <option value="Male">Male (पुरुष)</option>
                        <option value="Other">Other (अन्य)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Mobile Number (10 Digits) *</label>
                      <input
                        type="text"
                        maxLength={10}
                        {...regEditMember('mobileNumber', { required: 'Mobile is required', pattern: /^\d{10}$/ })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Email Address</label>
                      <input
                        type="email"
                        {...regEditMember('email')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Identity Cards (Aadhaar & PAN) */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-rose-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 2. Identification Documents (पहचान पत्र)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Aadhaar Card (12 Digits)</label>
                      <input
                        type="text"
                        maxLength={12}
                        {...regEditMember('aadhaarNumber')}
                        placeholder="12 digit Aadhaar number"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">PAN Card Number (10 Characters)</label>
                      <input
                        type="text"
                        maxLength={10}
                        {...regEditMember('panNumber')}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Residential Address */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-rose-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 3. Residential Address (पूरा पता)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1 sm:col-span-2 md:col-span-3">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Street / Village Address (ग्राम / मोहल्ला)</label>
                      <input
                        type="text"
                        {...regEditMember('address')}
                        placeholder="Full street / village address"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">City / Town (शहर / कस्बा)</label>
                      <input
                        type="text"
                        {...regEditMember('city')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">District (जिला)</label>
                      <input
                        type="text"
                        {...regEditMember('district')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">State (राज्य)</label>
                      <input
                        type="text"
                        {...regEditMember('state')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Pin Code (पिन कोड)</label>
                      <input
                        type="text"
                        maxLength={6}
                        {...regEditMember('pincode')}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Professional & Background Info */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h5 className="font-black text-rose-900 text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ed1c24]" /> 4. Professional Background &amp; Interests
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Occupation (व्यवसाय)</label>
                      <input
                        type="text"
                        {...regEditMember('occupation')}
                        placeholder="e.g. Social Worker, Teacher, Student"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Organization / Institution</label>
                      <input
                        type="text"
                        {...regEditMember('organization')}
                        placeholder="e.g. Aagaj Foundation / Self"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase">Interest Areas (रुचि के क्षेत्र)</label>
                      <input
                        type="text"
                        {...regEditMember('interestAreas')}
                        placeholder="e.g. Women Empowerment, Health Care, Child Education"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-rose-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Footer (Responsive & Sticky) */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-2 p-3 sm:p-4 border-t border-slate-200 bg-white shadow-lg">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex-1">
                  <button
                    type="button"
                    onClick={() => setShowMemberDetailsModal(false)}
                    className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 px-3 text-xs font-bold text-slate-700 cursor-pointer text-center transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberDetailsModal(false);
                      setSelectedMembershipCert(selectedMemberDetails);
                      setShowMembershipCertModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-rose-800 hover:bg-rose-900 text-white py-2.5 px-3 text-xs font-bold shadow-xs cursor-pointer text-center transition-all"
                  >
                    <Award className="h-4 w-4 shrink-0" /> <span className="truncate">View Certificate</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={editMemberSubmitting}
                  className="w-full sm:flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 text-center transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{editMemberSubmitting ? 'Saving Changes...' : 'Save & Update Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 14. ADMIN PROFILE & SECURITY SETTINGS MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-sans">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-100 text-left relative flex flex-col">
            
            {/* Profile Header Header Banner */}
            <div className="bg-gradient-to-r from-[#051630] via-[#0b2854] to-[#051630] p-6 rounded-t-3xl text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                <ShieldCheck className="h-44 w-44 text-white" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#fdd831] text-[#051630] font-black flex items-center justify-center text-xl shadow-lg border-2 border-white/20">
                    AD
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">
                      {user?.fullName || 'Super Administrator'}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{user?.email || sessionStorage.getItem('adminEmail') || 'admin@aagajfoundation.com'}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-3 w-3" /> System Super Administrator
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-xl p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-white/10 relative z-10">
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('password')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    profileActiveTab === 'password'
                      ? 'bg-[#fdd831] text-[#051630] shadow-md'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" /> Security & Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    profileActiveTab === 'profile'
                      ? 'bg-[#fdd831] text-[#051630] shadow-md'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Profile Details
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 space-y-5">
              
              {/* TAB 1: SECURITY & CHANGE PASSWORD */}
              {profileActiveTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-rose-600" /> Change Account Password (पासवर्ड बदलें)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enter your current password and set a new secure password.
                    </p>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  {/* Current Password Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Current Password (वर्तमान पासवर्ड)</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your existing password"
                        className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-rose-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">New Password (नया पासवर्ड)</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-rose-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="pt-1.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-400 uppercase">Strength:</span>
                          <span className="text-slate-700">{getPasswordStrength(newPassword).label}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                            style={{ width: `${(getPasswordStrength(newPassword).score / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Confirm New Password (नए पासवर्ड की पुष्टि करें)</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full border rounded-xl pl-3 pr-10 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-all ${
                          confirmPassword && confirmPassword !== newPassword
                            ? 'border-rose-400 bg-rose-50/50'
                            : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-rose-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-[10px] font-bold text-rose-600 mt-0.5">⚠️ Passwords do not match</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordSubmitting}
                      className="flex-1 rounded-xl bg-[#051630] hover:bg-slate-900 text-[#fdd831] py-2.5 text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {passwordSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: PROFILE DETAILS */}
              {profileActiveTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-indigo-600" /> Super Admin Profile Details (एडमिन प्रोफ़ाइल)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Manage administrative identity and system notification email address.
                    </p>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Administrator Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Admin System Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-600 transition-all"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1 text-[11px] text-indigo-900 font-medium">
                    <p><strong className="font-bold">Role:</strong> Super Admin (Full Control)</p>
                    <p><strong className="font-bold">Status:</strong> Active System Administrator ✅</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(false)}
                      className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSubmitting}
                      className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {profileSubmitting ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- PATIENT BILL RECEIPT PHOTO VIEW MODAL (WITH MULTI-IMAGE CAROUSEL & AUTO-VIEWPORT FIT) --- */}
      {showBillReceiptModal && selectedBillReceipt && (() => {
        const photos = (selectedBillReceipt.billPhotos && selectedBillReceipt.billPhotos.length > 0)
          ? selectedBillReceipt.billPhotos
          : (selectedBillReceipt.billPhoto ? [selectedBillReceipt.billPhoto] : []);
        const activePhoto = photos[activeReceiptIndex] || photos[0] || selectedBillReceipt.billPhoto;

        return (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/75 p-2 sm:p-4 overflow-y-auto font-sans">
            <div className="w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 text-left relative my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-3.5 sm:p-4 shrink-0">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-rose-600" /> Patient Treatment Receipt / Invoice ({photos.length} {photos.length > 1 ? 'Files' : 'File'})
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Bill ID: <span className="font-mono text-slate-800">{selectedBillReceipt.billId}</span> | Patient: <span className="text-slate-900">{selectedBillReceipt.patientName}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBillReceiptModal(false);
                    setSelectedBillReceipt(null);
                    setActiveReceiptIndex(0);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
                {/* Patient & Bill Summary Info */}
                <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Patient Name</span>
                    <strong className="text-slate-900">{selectedBillReceipt.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Health Card ID</span>
                    <strong className="text-rose-600 font-mono">{selectedBillReceipt.healthId || 'General'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Treatment Details</span>
                    <span className="text-slate-700 font-medium truncate block">{selectedBillReceipt.treatmentDetails}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[9px] uppercase">Bill Amount & Status</span>
                    <strong className="text-slate-900">₹{selectedBillReceipt.billAmount}</strong>
                    <span className={`ml-2 inline-flex rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${
                      selectedBillReceipt.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedBillReceipt.status}
                    </span>
                  </div>
                </div>

                {/* Main Receipt Image Viewer Container */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 flex flex-col justify-center items-center relative min-h-[200px] max-h-[40vh] p-2 shadow-inner">
                  {activePhoto ? (
                    <>
                      <img
                        src={activePhoto}
                        alt={`Uploaded Patient Receipt ${activeReceiptIndex + 1}`}
                        className="max-h-[36vh] w-auto object-contain rounded-lg shadow-md transition-all duration-200"
                      />

                      {/* Next / Prev Controls for Multi-Photo */}
                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveReceiptIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white p-2 border border-slate-700 shadow-md cursor-pointer transition-all"
                            title="Previous Image"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveReceiptIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white p-2 border border-slate-700 shadow-md cursor-pointer transition-all"
                            title="Next Image"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute top-2 right-2 bg-slate-900/85 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700">
                            {activeReceiptIndex + 1} / {photos.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-wider">No Receipt Photo Uploaded</p>
                    </div>
                  )}
                </div>

                {/* Multiple Image Thumbnails Bar */}
                {photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {photos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveReceiptIndex(idx)}
                        className={`relative rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          idx === activeReceiptIndex ? 'border-rose-600 ring-2 ring-rose-200' : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p} alt={`Thumb ${idx + 1}`} className="h-12 w-12 object-cover" />
                        <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-[8px] px-1 font-mono">#{idx + 1}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Toolbar */}
              <div className="flex justify-end gap-2 p-3 sm:p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                {activePhoto && (
                  <a
                    href={activePhoto}
                    download={`Bill_${selectedBillReceipt.billId}_Receipt_${activeReceiptIndex + 1}.png`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
                  >
                    <Download className="h-4 w-4" /> Download Receipt (#{activeReceiptIndex + 1})
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowBillReceiptModal(false);
                    setSelectedBillReceipt(null);
                    setActiveReceiptIndex(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/*   EMPLOYEE ATTENDANCE DOSSIER MODAL                      */}
      {/* ======================================================== */}
      {showAttendanceDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#051630] text-white p-6 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#ED1C24] text-white font-black text-lg flex items-center justify-center shadow-lg">
                  {selectedEmployeeDossier?.employee?.fullName ? selectedEmployeeDossier.employee.fullName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    {selectedEmployeeDossier?.employee?.fullName || 'Employee Dossier'}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    {selectedEmployeeDossier?.employee?.email || ''} &bull; {selectedEmployeeDossier?.employee?.designation || 'Employee'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAttendanceDossierModal(false);
                  setSelectedEmployeeDossier(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {dossierLoading ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <RotateCw className="h-8 w-8 animate-spin text-[#ED1C24]" />
                  <p className="text-xs font-bold text-slate-600">Loading complete attendance dossier...</p>
                </div>
              ) : selectedEmployeeDossier ? (
                <>
                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Work Days</span>
                      <span className="text-xl font-black text-slate-800 mt-1 block">
                        {selectedEmployeeDossier.stats?.totalDaysTracked || 0}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Present Days</span>
                      <span className="text-xl font-black text-emerald-600 mt-1 block">
                        {selectedEmployeeDossier.stats?.presentDays || 0}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Hours</span>
                      <span className="text-xl font-black text-[#051630] mt-1 block">
                        {formatActiveSecondsToHM(selectedEmployeeDossier.stats?.totalActiveSeconds || 0)}
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Avg Active Daily</span>
                      <span className="text-xl font-black text-amber-700 mt-1 block">
                        {formatActiveSecondsToHM(selectedEmployeeDossier.stats?.averageActiveSecondsPerDay || 0)}
                      </span>
                    </div>
                  </div>

                  {/* History Logs Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Date-wise Attendance & Active Time Log</h4>
                      <span className="text-[11px] font-bold text-slate-400">Total Records: {selectedEmployeeDossier.history?.length || 0}</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Work Mode</th>
                            <th className="p-3">Punch-In</th>
                            <th className="p-3">Punch-Out</th>
                            <th className="p-3">Active Software Duration</th>
                            <th className="p-3">Shift Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {selectedEmployeeDossier.history && selectedEmployeeDossier.history.length > 0 ? (
                            selectedEmployeeDossier.history.map((log) => (
                              <tr key={log._id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-900">{log.date}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    log.status === 'Punched In' || log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                    log.status === 'Punched Out' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="p-3">{log.workMode || 'Office'}</td>
                                <td className="p-3 font-mono">{log.punchIn ? new Date(log.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                <td className="p-3 font-mono">{log.punchOut ? new Date(log.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                <td className="p-3 font-black text-[#051630]">
                                  {formatActiveSecondsToHM(log.totalActiveSeconds || 0)}
                                </td>
                                <td className="p-3 text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="p-6 text-center text-slate-400 font-bold">
                                No attendance records found for this employee.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Attendance Dossier
              </button>
              <button
                onClick={() => {
                  setShowAttendanceDossierModal(false);
                  setSelectedEmployeeDossier(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
