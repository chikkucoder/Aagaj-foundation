import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, User, Heart, Shield, Search, Scissors, ShieldCheck, Printer, RefreshCw, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

  // Silayi Verification Modal States
  const [isSilayiModalOpen, setIsSilayiModalOpen] = useState(false);
  const [silayiSearchQuery, setSilayiSearchQuery] = useState('');
  const [silayiVerifyResult, setSilayiVerifyResult] = useState(null);
  const [silayiVerifyError, setSilayiVerifyError] = useState('');
  const [silayiLoading, setSilayiLoading] = useState(false);

  const openSilayiModal = () => {
    setIsSilayiModalOpen(true);
    setSilayiSearchQuery('');
    setSilayiVerifyResult(null);
    setSilayiVerifyError('');
  };

  const closeSilayiModal = () => {
    setIsSilayiModalOpen(false);
  };

  // Clean print mode class from body after printing finishes
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-receipt');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleSilayiVerify = async (e) => {
    e.preventDefault();
    if (!silayiSearchQuery.trim()) {
      setSilayiVerifyError('कृपया आधार, मोबाइल या क्रमांक संख्या प्रविष्ट करें।');
      return;
    }

    setSilayiLoading(true);
    setSilayiVerifyResult(null);
    setSilayiVerifyError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/schemes/verify?query=${encodeURIComponent(silayiSearchQuery.trim())}`);
      const result = await response.json();
      if (result.success && result.data) {
        setSilayiVerifyResult(result.data);
      } else {
        setSilayiVerifyError(result.message || 'पंजीकरण रिकॉर्ड नहीं मिला। कृपया इनपुट की जांच करें।');
      }
    } catch (err) {
      console.error(err);
      setSilayiVerifyError('रिकॉर्ड सत्यापन विफलता।');
    } finally {
      setSilayiLoading(false);
    }
  };

  const handlePrintSilayi = () => {
    document.body.classList.add('printing-receipt');
    window.print();
  };

  const handleSilayiImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/logo.jpg';
  };

  const renderSilayiVirtualForm = (data) => {
    return (
      <div className="bg-white p-8 border border-slate-300 rounded-2xl max-w-2xl mx-auto shadow-md relative font-sans text-slate-800 text-left print:border-none print:shadow-none print:p-0">
        
        {/* Verification Success Tag for non-printed views */}
        <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-300 print:hidden flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> VERIFIED
        </div>

        {/* Est year & Reg No Row */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2 font-mono">
          <div>Reg. No- <span className="text-slate-900 font-black text-sm">{data.serialNumber}</span></div>
          <div>Est year: 2020</div>
        </div>

        {/* Logo and Foundation Name */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-red-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-red-600 tracking-wider">आगाज फाउंडेशन</span>
          </div>
          <div className="text-[11px] font-bold text-slate-500">पता – भूपतिपुर मोड़, सुरभी विहार पटना–20</div>
        </div>

        {/* Form title and fee */}
        <div className="text-center mt-4 mb-6 relative">
          <h2 className="text-xl font-extrabold text-red-600 underline underline-offset-4">प्रशिक्षण पंजीकरण फार्म</h2>
          <div className="text-right text-xs font-black text-red-600 mt-1">प्रशिक्षण शुल्क फॉर्म: RS 799</div>
        </div>

        {/* Form Details Grid with Photo Box */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Side: Fields */}
          <div className="md:col-span-3 space-y-3 font-semibold text-xs leading-loose">
            <div><span className="text-slate-500 font-bold">क्रमांक सं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.serialNumber}</span></div>
            <div><span className="text-slate-500 font-bold">नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.name}</span></div>
            <div><span className="text-slate-500 font-bold">पिता / पति का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.guardianName}</span></div>
            <div><span className="text-slate-500 font-bold">पता:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.address}</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">मो.नं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.mobileNumber}</span></div>
              <div><span className="text-slate-500 font-bold">लिंग:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.gender}</span></div>
            </div>
            <div><span className="text-slate-500 font-bold">Email Id:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.email || 'N/A'}</span></div>
            <div><span className="text-slate-500 font-bold">आधार नं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.aadharNumber}</span></div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">उम्र:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 font-mono">{data.age}</span></div>
              <div><span className="text-slate-500 font-bold">जाति:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.caste || 'N/A'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">प्रशिक्षण का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingName || 'N/A'}</span></div>
              <div><span className="text-slate-500 font-bold">मौजूदा कौशल:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.existingSkills || 'N/A'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500 font-bold">प्रशिक्षण अवधि:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingDuration || 'N/A'}</span></div>
              <div><span className="text-slate-500 font-bold">प्रशिक्षण का तारीख:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.trainingDate || 'N/A'}</span></div>
            </div>
          </div>

          {/* Right Side: Photo Box */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-28 h-36 border-2 border-slate-400 rounded overflow-hidden flex items-center justify-center bg-slate-50 shadow-inner">
              {data.photoUrl ? (
                <img 
                  src={data.photoUrl.startsWith('http') ? data.photoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${data.photoUrl}`} 
                  alt="Beneficiary Photo" 
                  className="w-full h-full object-cover" 
                  onError={handleSilayiImageError} 
                />
              ) : (
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">PHOTO</span>
              )}
            </div>
          </div>
        </div>

        {/* Signatures Row */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 mt-12 pt-4">
          <div>ऑफिस का हस्ताक्षर</div>
          <div>पंचायत कोर्डिनेटर हस्ताक्षर</div>
          <div>आवेदक का हस्ताक्षर</div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-dashed border-slate-500 my-8"></div>

        {/* bottom half: OFFICE USE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-800 tracking-wider">OFFICE USE</h3>
            <span className="text-xs font-black text-red-600 underline underline-offset-2">प्राप्ति रसीद</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold text-xs leading-loose">
            <div><span className="text-slate-500 font-bold">क्रमांक सं.:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900">{data.serialNumber}</span></div>
            <div><span className="text-slate-500 font-bold">नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.name}</span></div>
            <div className="md:col-span-2"><span className="text-slate-500 font-bold">पिता / पति का नाम:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">{data.guardianName}</span></div>
            <div className="md:col-span-2"><span className="text-slate-500 font-bold">पता:</span> <span className="border-b border-dashed border-slate-400 pb-0.5 px-2 font-black text-slate-900 uppercase">भूपतिपुर मोड़, पटना – 20</span></div>
          </div>

          {/* Contact details */}
          <div className="text-[10px] font-bold text-slate-600 mt-2 font-mono">
            ऑफिस मो.नं. 0612465270, 7361936198
          </div>

          {/* bottom Signatures */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700 mt-8">
            <div>ऑफिस का हस्ताक्षर</div>
            <div>पंचायत कोर्डिनेटर हस्ताक्षर</div>
            <div>आवेदक का हस्ताक्षर</div>
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const designation = sessionStorage.getItem('loggedInDesignation') || '';
  const isDistrictCoordinator = designation.toString().toLowerCase() === 'district coordinator';
  const showSwasthya = role === 'admin' || isDistrictCoordinator;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-rose-50 to-pink-50 shadow-md border-b border-rose-200">
      {/* Top accent strip */}
      <div className="h-1 bg-gradient-to-r from-[#ED1C24] via-[#fdd831] to-[#ED1C24]"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.jpeg" 
                alt="Aagaj Foundation Logo" 
                className="h-16 w-auto rounded-lg transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              About
            </NavLink>

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setServicesOpen(true);
                setCareersOpen(false);
                setMedicalOpen(false);
              }}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button 
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setCareersOpen(false);
                  setMedicalOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Services <ChevronDown className="h-4 w-4" />
              </button>
              {servicesOpen && (
                <div className="absolute right-0 top-full pt-2 w-64 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/schemes/silayi" 
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Mahila Silayi Prasikshan Yojana
                    </Link>
                    <Link 
                      to="/schemes/swarojgaar" 
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Mahila Swarojgaar Yojana
                    </Link>
                    <button 
                      onClick={() => {
                        setServicesOpen(false);
                        openSilayiModal();
                      }}
                      className="w-full text-left block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24] cursor-pointer"
                    >
                      Verify Silayi Registration
                    </button>
                    {user ? (
                      <>
                        {showSwasthya && (
                          <Link 
                            to="/schemes/swasthya-suraksha" 
                            onClick={() => setServicesOpen(false)}
                            className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                          >
                            Swasthya Suraksha Yojana
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link 
                        to="/login" 
                        onClick={() => setServicesOpen(false)}
                        className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                      >
                        Employee Login
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <NavLink 
              to="/gallery" 
              className={({ isActive }) => 
                `px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all duration-300 hover:text-[#ED1C24] hover:bg-rose-50 ${isActive ? 'text-[#ED1C24] bg-rose-50' : ''}`
              }
            >
              Gallery
            </NavLink>

            {/* Careers Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setCareersOpen(true);
                setServicesOpen(false);
                setMedicalOpen(false);
              }}
              onMouseLeave={() => setCareersOpen(false)}
            >
              <button 
                onClick={() => {
                  setCareersOpen(!careersOpen);
                  setServicesOpen(false);
                  setMedicalOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Careers <ChevronDown className="h-4 w-4" />
              </button>
              {careersOpen && (
                <div className="absolute right-0 top-full pt-2 w-48 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/careers/ngo-jobs" 
                      onClick={() => setCareersOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      NGO Jobs
                    </Link>
                    <Link 
                      to="/careers/general-jobs" 
                      onClick={() => setCareersOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      General Jobs
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setMedicalOpen(true);
                setServicesOpen(false);
                setCareersOpen(false);
              }}
              onMouseLeave={() => setMedicalOpen(false)}
            >
              <button 
                onClick={() => {
                  setMedicalOpen(!medicalOpen);
                  setServicesOpen(false);
                  setCareersOpen(false);
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-800 rounded-md transition-all hover:text-[#ED1C24] hover:bg-rose-50"
              >
                Medical Facility <ChevronDown className="h-4 w-4" />
              </button>
              {medicalOpen && (
                <div className="absolute right-0 top-full pt-2 w-56 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/medical/healthcard" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Health Card Registration
                    </Link>
                    <Link 
                      to="/medical/verify-healthcard" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Verify Health Card
                    </Link>
                    <Link 
                      to="/medical/appointment" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Appointment
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Donate Us Link */}
            <Link 
              to="/donate"
              className="ml-2 flex items-center gap-1.5 rounded-full bg-[#fdd831] px-5 py-2 text-sm font-extrabold text-slate-800 shadow-md hover:bg-amber-400 hover:shadow-lg transition-all active:scale-95 duration-200"
            >
              <Heart className="h-4 w-4 text-[#ED1C24] fill-[#ED1C24]" /> Donate Us
            </Link>

            {/* Admin / Portal Action Button */}
            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link 
                  to={
                    role === 'admin' 
                      ? '/admin/dashboard' 
                      : role === 'hospital' 
                      ? '/hospital/dashboard' 
                      : '/employee/dashboard'
                  }
                  className="flex items-center gap-1 rounded-full bg-[#ED1C24] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#b0151b] transition-all"
                >
                  <User className="h-4 w-4" /> {user.fullName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-800 rounded-full hover:bg-rose-50 hover:text-[#ED1C24] transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="ml-4 flex items-center gap-1 border-2 border-slate-800 rounded-full px-4 py-1.5 text-sm font-bold text-slate-800 hover:bg-[#ED1C24] hover:text-white hover:border-[#ED1C24] transition-all duration-300"
              >
                <Shield className="h-4 w-4" /> Portal Login
              </Link>
            )}

          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="lg:hidden border-t-2 border-rose-200 bg-white py-4 px-4 shadow-inner space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            About
          </Link>

          {/* Mobile Services */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Services</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/schemes/silayi" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Mahila Silayi Prasikshan Yojana
              </Link>
              <Link 
                to="/schemes/swarojgaar" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Mahila Swarojgaar Yojana
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  openSilayiModal();
                }}
                className="w-full text-left block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Verify Silayi Registration
              </button>
              {user ? (
                <>
                  {showSwasthya && (
                    <Link 
                      to="/schemes/swasthya-suraksha" 
                      onClick={() => setIsOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Swasthya Suraksha Yojana
                    </Link>
                  )}
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                >
                  Employee Login
                </Link>
              )}
            </div>
          </div>

          <Link 
            to="/gallery" 
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-bold text-slate-800 hover:bg-rose-50 hover:text-[#ED1C24]"
          >
            Gallery
          </Link>

          {/* Mobile Careers */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Careers</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/careers/ngo-jobs" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                NGO Jobs
              </Link>
              <Link 
                to="/careers/general-jobs" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                General Jobs
              </Link>
            </div>
          </div>

          {/* Mobile Medical */}
          <div>
            <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Medical Facility</p>
            <div className="pl-4 space-y-1">
              <Link 
                to="/medical/healthcard" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Health Card Registration
              </Link>
              <Link 
                to="/medical/verify-healthcard" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Verify Health Card
              </Link>
              <Link 
                to="/medical/appointment" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Appointment
              </Link>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Link 
              to="/donate" 
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#fdd831] py-2.5 text-base font-extrabold text-slate-800"
            >
              <Heart className="h-5 w-5 text-[#ED1C24] fill-[#ED1C24]" /> Donate Us
            </Link>

            {user ? (
              <>
                <Link 
                  to={
                    role === 'admin' 
                      ? '/admin/dashboard' 
                      : role === 'hospital' 
                      ? '/hospital/dashboard' 
                      : '/employee/dashboard'
                  }
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ED1C24] py-2.5 text-base font-bold text-white"
                >
                  <User className="h-5 w-5" /> {user.fullName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 py-2.5 text-base font-bold text-slate-700 hover:bg-rose-50"
                >
                  <LogOut className="h-5 w-5" /> Log Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-slate-800 py-2.5 text-base font-bold text-slate-800"
              >
                <Shield className="h-5 w-5" /> Portal Login
              </Link>
            )}
          </div>
        </div>
      )}
      {/* Silayi Verification Popup Modal */}
      {isSilayiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={closeSilayiModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 border-b border-slate-100 pb-4 mb-6">
              <div className="inline-flex items-center justify-center p-2.5 bg-red-50 text-[#ED1C24] rounded-2xl">
                <Scissors className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight Hindi-font">
                सिलाई प्रशिक्षण सत्यापन एवं रसीद
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                Verify Registration Status & Download Receipt Card
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner mb-6">
              <form onSubmit={handleSilayiVerify} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label htmlFor="modal_silayi_query" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    पंजीकरण संख्या, आधार संख्या या मोबाइल संख्या दर्ज करें (Enter Reg No, Aadhar, or Mobile)
                  </label>
                  <div className="relative">
                    <input
                      id="modal_silayi_query"
                      type="text"
                      value={silayiSearchQuery}
                      onChange={(e) => setSilayiSearchQuery(e.target.value)}
                      placeholder="e.g. 2600001, 12-digit Aadhar, 10-digit Mobile"
                      className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] transition-all font-bold text-sm"
                      disabled={silayiLoading}
                      required
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#ED1C24] hover:bg-[#b0151b] text-white font-black uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                  disabled={silayiLoading}
                >
                  {silayiLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5" />
                      सत्यापन हो रहा है (Verifying...)
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      सत्यापन एवं रसीद खोजें (Verify & Search Receipt)
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {silayiVerifyError && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-bold flex items-center gap-3 text-left">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    {silayiVerifyError}
                  </div>
                </div>
              )}
            </div>

            {/* Results Display inside Modal */}
            {silayiVerifyResult && (
              <div className="space-y-6">
                
                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm">सत्यापित (Verified!)</h4>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-semibold">Reg Serial: {silayiVerifyResult.serialNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handlePrintSilayi}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-4 py-2.5 shadow transition-all active:scale-95 text-xs cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> रसीद प्रिंट करें
                    </button>
                    <button
                      onClick={() => {
                        setSilayiVerifyResult(null);
                        setSilayiSearchQuery('');
                        setSilayiVerifyError('');
                      }}
                      className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-4 py-2.5 transition-all text-xs cursor-pointer"
                    >
                      रीसेट
                    </button>
                  </div>
                </div>

                {/* Inline preview for display inside the modal (hidden during print) */}
                <div className="border border-slate-200 rounded-3xl p-2 bg-slate-50/50 print:hidden">
                  {renderSilayiVirtualForm(silayiVerifyResult)}
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* React Portal for robust page-independent printing (attached directly to body) */}
      {silayiVerifyResult && createPortal(
        <div className="printable-receipt-container hidden print:block">
          {renderSilayiVirtualForm(silayiVerifyResult)}
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
