import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SocialSidebar from './components/SocialSidebar';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Donate from './pages/Donate';
import DonationSuccess from './pages/DonationSuccess';
import DonationFailed from './pages/DonationFailed';
import NGOJobs from './pages/NGOJobs';
import GeneralJobs from './pages/GeneralJobs';
import HealthCard from './pages/HealthCard';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import SilayiYojnaDescription from './pages/SilayiYojnaDescription';
import SwarojgaarDescription from './pages/SwarojgaarDescription';
import SwarojgaarRegister from './pages/SwarojgaarRegister';
import SilayiRegister from './pages/SilayiRegister';
import SwasthyaSurakshaRegister from './pages/SwasthyaSurakshaRegister';
import Card from './pages/Card';
import Application from './pages/Application';
import VerifyHealthCard from './pages/VerifyHealthCard';
import MembershipRegister from './pages/MembershipRegister';

// Layout component to wrap pages that require standard Navbar and Footer
const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SocialSidebar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 1. PUBLIC ROUTING WITH LAYOUT (NAVBAR & FOOTER) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/careers/ngo-jobs" element={<NGOJobs />} />
            <Route path="/careers/general-jobs" element={<GeneralJobs />} />
            <Route path="/medical/healthcard" element={<HealthCard />} />
            <Route path="/medical/verify-healthcard" element={<VerifyHealthCard />} />
            <Route path="/medical/appointment" element={<Appointment />} />
            <Route path="/schemes/silayi" element={<SilayiYojnaDescription />} />
            <Route path="/silayi/description" element={<SilayiYojnaDescription />} />
            <Route path="/schemes/swarojgaar" element={<SwarojgaarDescription />} />
            <Route path="/swarojgaar/description" element={<SwarojgaarDescription />} />
            <Route path="/membership/register" element={<MembershipRegister />} />
            <Route path="/membership" element={<MembershipRegister />} />
          </Route>

          {/* 2. SPECIAL / PRINT-ORIENTED / CONSOLE PAGES (NO LAYOUT) */}
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Application />} />
          <Route path="/careers/apply" element={<Application />} />
          <Route path="/careers/id-card" element={<Card />} />
          <Route path="/swarojgaar/register" element={<SwarojgaarRegister />} />
          <Route path="/silayi/register" element={<SilayiRegister />} />
          <Route path="/donation/success" element={<DonationSuccess />} />
          <Route path="/donation/failed" element={<DonationFailed />} />

          {/* 3. PROTECTED ROUTES (DASHBOARDS & MANAGEMENT) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schemes/swasthya-suraksha"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <SwasthyaSurakshaRegister />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
