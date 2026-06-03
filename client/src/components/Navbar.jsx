import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, User, Heart, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [careersOpen, setCareersOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);

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
                    {user ? (
                      <>
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
                <div className="absolute right-0 top-full pt-2 w-48 origin-top-right z-50">
                  <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link 
                      to="/medical/healthcard" 
                      onClick={() => setMedicalOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                    >
                      Health Card
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
        <div className="lg:hidden border-t-2 border-rose-200 bg-white py-4 px-4 shadow-inner space-y-2">
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
            {user ? (
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
                {showSwasthya && (
                  <Link 
                    to="/schemes/swasthya-suraksha" 
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
                  >
                    Swasthya Suraksha Yojana
                  </Link>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#ED1C24]"
              >
                Employee Login
              </Link>
            )}
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
                Health Card
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
    </nav>
  );
};

export default Navbar;
