import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginAdmin, loginEmployee, loginHospital } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate auth state from storage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = sessionStorage.getItem('loggedInRole');
    const storedUserName = sessionStorage.getItem('loggedInUser');
    const storedUserEmail = sessionStorage.getItem('loggedInUserEmail');

    if (storedRole) {
      setRole(storedRole.toLowerCase());
      setToken(storedToken);
      setUser({
        fullName: storedUserName,
        email: storedUserEmail,
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password, selectedRole) => {
    setLoading(true);
    try {
      let data;
      if (selectedRole === 'admin') {
        data = await loginAdmin({ email: username, password });
      } else if (selectedRole === 'hospital') {
        data = await loginHospital({ identifier: username, password });
      } else {
        // employee / district coordinator
        data = await loginEmployee({ username, password });
      }

      if (data && data.success) {
        let authUser = {};
        let userRole = selectedRole;

        if (selectedRole === 'admin') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          sessionStorage.setItem('loggedInUser', 'Admin');
          sessionStorage.setItem('loggedInRole', 'Admin');
          sessionStorage.setItem('adminEmail', data.admin.email);
          sessionStorage.removeItem('loggedInUserEmail');
          authUser = { fullName: data.admin.fullName, email: data.admin.email };
          setUser(authUser);
          setRole('admin');
        } else if (selectedRole === 'hospital') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          sessionStorage.setItem('loggedInUser', data.hospital.name);
          sessionStorage.setItem('loggedInRole', 'Hospital');
          sessionStorage.setItem('loggedInUserEmail', data.hospital.email);
          sessionStorage.setItem('loggedInHospitalId', data.hospital.uniqueId);
          authUser = { fullName: data.hospital.name, email: data.hospital.email, uniqueId: data.hospital.uniqueId };
          setUser(authUser);
          setRole('hospital');
        } else {
          // Employee login returns no token on backend
          // We can store a mock token or session token
          localStorage.setItem('token', 'employee-session');
          setToken('employee-session');
          
          const empDesignation = data.user.designation || data.user.roleApplied || data.user.applyForPost || 'Employee';
          sessionStorage.setItem('loggedInUser', data.user.fullName);
          sessionStorage.setItem('loggedInUserEmail', data.user.email || data.user.emp_username);
          sessionStorage.setItem('loggedInRole', 'Employee');
          sessionStorage.setItem('loggedInDesignation', empDesignation);
          sessionStorage.removeItem('adminEmail');
          
          authUser = { 
            fullName: data.user.fullName, 
            email: data.user.email || data.user.emp_username,
            designation: empDesignation,
            district: data.user.district,
            state: data.user.state
          };
          setUser(authUser);
          setRole('employee');
        }

        setLoading(false);
        return { success: true, role: userRole };
      } else {
        setLoading(false);
        return { success: false, message: data.message || 'Invalid Credentials' };
      }
    } catch (error) {
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Connection server error.' 
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
