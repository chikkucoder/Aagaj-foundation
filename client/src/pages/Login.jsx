import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { checkAdminExists, registerAdmin } from '../api/authApi';
import { KeyRound, Mail, User, ShieldAlert, HeartHandshake, Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [activeRole, setActiveRole] = useState('employee'); // 'employee', 'admin', 'hospital'
  const [isAdminRegisterTab, setIsAdminRegisterTab] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // React Hook Forms
  const { register: regLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm();
  const { register: regSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors }, reset: resetSignupForm } = useForm();

  // Check if Admin exists on mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await checkAdminExists();
        setAdminExists(res.exists);
      } catch (err) {
        console.error('Failed to check admin status', err);
      }
    };
    checkAdmin();
  }, []);

  const onLoginSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    const username = data.username;
    const res = await login(username, data.password, activeRole);
    if (res.success) {
      setSuccessMsg('Login Successful! Redirecting...');
      setTimeout(() => {
        if (res.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.role === 'hospital') {
          navigate('/hospital/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Invalid Credentials');
    }
  };

  const onSignupSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await registerAdmin({
        fullName: data.fullName,
        email: data.email,
        password: data.password
      });
      if (res.success) {
        setSuccessMsg('Admin account created successfully! You can now log in.');
        setAdminExists(true);
        setIsAdminRegisterTab(false);
        resetSignupForm();
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error during registration.');
    }
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setIsAdminRegisterTab(false);
    setErrorMsg('');
    setSuccessMsg('');
    resetLoginForm();
    resetSignupForm();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#fffdf5] px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-0 h-48 w-48 rounded-br-full bg-[#ED1C24]/5"></div>
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-tl-full bg-[#fdd831]/10"></div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-100 hover:text-[#ED1C24] transition-all hover:-translate-y-0.5 duration-200"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img
            src="/logo.jpg"
            alt="Aagaj Logo"
            className="h-20 w-auto rounded-2xl shadow-md border border-slate-100 object-contain p-1"
          />
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Aagaj Foundation
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500 font-medium">
            Internal Secure Access Portal
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => handleRoleChange('employee')}
            className={`rounded-xl py-2 px-1 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center text-center leading-tight min-h-[40px] cursor-pointer ${
              activeRole === 'employee'
                ? 'bg-[#ED1C24] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`rounded-xl py-2 px-1 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center text-center leading-tight min-h-[40px] cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-[#ED1C24] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('hospital')}
            className={`rounded-xl py-2 px-1 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center text-center leading-tight min-h-[40px] cursor-pointer ${
              activeRole === 'hospital'
                ? 'bg-[#ED1C24] text-white shadow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Hospital Partner
          </button>
        </div>

        {/* Card Main Wrapper */}
        <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600 border border-rose-100 flex items-center gap-2 animate-shake">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-600 border border-emerald-100 flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ADMIN SIGNUP / LOGIN TABS */}
          {activeRole === 'admin' && !adminExists && (
            <div className="mb-6 flex space-x-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setIsAdminRegisterTab(false)}
                className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                  !isAdminRegisterTab
                    ? 'border-[#ED1C24] text-[#ED1C24]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setIsAdminRegisterTab(true)}
                className={`pb-1 text-sm font-bold border-b-2 transition-all ${
                  isAdminRegisterTab
                    ? 'border-[#ED1C24] text-[#ED1C24]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* --- ADMIN SIGNUP FORM --- */}
          {activeRole === 'admin' && isAdminRegisterTab && !adminExists ? (
            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    {...regSignup('fullName', { required: 'Full Name is required' })}
                    placeholder="Enter Name"
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] sm:text-sm transition-all"
                  />
                </div>
                {signupErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{signupErrors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    {...regSignup('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    placeholder="name@example.com"
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] sm:text-sm transition-all"
                  />
                </div>
                {signupErrors.email && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{signupErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Create Password
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...regSignup('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] sm:text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{signupErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="flex w-full justify-center rounded-xl bg-[#fdd831] px-4 py-3 text-sm font-bold text-slate-900 shadow-md hover:bg-[#eec600] focus:outline-none focus:ring-2 focus:ring-[#fdd831] focus:ring-offset-2 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                CREATE ADMIN ACCOUNT
              </button>
            </form>
          ) : (
            /* --- LOGIN FORM (ALL ROLES) --- */
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
              {/* Consolidated Username/Email/ID Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {activeRole === 'admin' 
                    ? 'Admin Email Address' 
                    : activeRole === 'hospital' 
                    ? 'Hospital Email / User ID' 
                    : 'Employee ID / Email'}
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    {activeRole === 'admin' ? (
                      <Mail className="h-5 w-5" />
                    ) : activeRole === 'hospital' ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </span>
                  <input
                    type={activeRole === 'admin' ? 'email' : 'text'}
                    {...regLogin('username', { 
                      required: activeRole === 'admin' 
                        ? 'Admin Email is required' 
                        : activeRole === 'hospital' 
                        ? 'Hospital Email / User ID is required' 
                        : 'Employee ID or email is required',
                      pattern: activeRole === 'admin' 
                        ? { value: /^\S+@\S+$/i, message: 'Invalid email address' } 
                        : undefined
                    })}
                    placeholder={
                      activeRole === 'admin' 
                        ? 'admin@aagaj.com' 
                        : activeRole === 'hospital' 
                        ? 'hospital@foundation.com' 
                        : 'EMP1234 or name@aagaj.com'
                    }
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] sm:text-sm transition-all"
                  />
                </div>
                {loginErrors.username && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{loginErrors.username.message}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                  {activeRole === 'admin' && (
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-[#ED1C24] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...regLogin('password', { required: 'Password is required' })}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 outline-none focus:border-[#ED1C24] focus:ring-1 focus:ring-[#ED1C24] sm:text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{loginErrors.password.message}</p>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="flex w-full justify-center rounded-xl bg-[#ED1C24] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#b0151b] focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:ring-offset-2 transition-all hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                SECURE LOG IN
              </button>

              {/* Help & Contact Support */}
              <div className="text-center text-xs text-slate-500 font-medium">
                {activeRole === 'hospital' ? (
                  <span>For technical support, contact helpline: <b className="text-rose-600">9431430464</b></span>
                ) : activeRole === 'employee' ? (
                  <span>Having trouble logging in? <Link to="/contact" className="text-[#ED1C24] hover:underline font-bold">Contact IT Support</Link></span>
                ) : (
                  <span>Super Admin Portal Access. Authorized Personnel Only.</span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
