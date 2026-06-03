import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-600 border-t-transparent"></div>
          <p className="font-semibold text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If Admin attempts to access Employee, or vice versa, redirect them to their respective dashboard
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'hospital') {
      return <Navigate to="/hospital/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
