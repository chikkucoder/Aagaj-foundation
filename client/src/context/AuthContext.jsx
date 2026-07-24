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
      
      let uniqueId = localStorage.getItem('loggedInHospitalId') || sessionStorage.getItem('loggedInHospitalId') || null;
      if (!uniqueId && storedToken) {
        try {
          // Decode payload of JWT token to retrieve uniqueId
          const base64Url = storedToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          uniqueId = decoded.uniqueId || null;
        } catch (e) {
          console.error("Token decode error during hydration:", e);
        }
      }

      const adminEmail = sessionStorage.getItem('adminEmail');
      setUser({
        fullName: storedUserName,
        email: storedUserEmail || adminEmail || '',
        uniqueId: uniqueId
      });
    }
    setLoading(false);
  }, []);

  const updateUser = (updatedData) => {
    setUser(prev => {
      const newObj = { ...prev, ...updatedData };
      if (newObj.fullName) sessionStorage.setItem('loggedInUser', newObj.fullName);
      if (newObj.email) {
        if (role === 'admin') {
          sessionStorage.setItem('adminEmail', newObj.email);
        } else {
          sessionStorage.setItem('loggedInUserEmail', newObj.email);
        }
      }
      return newObj;
    });
  };

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
          localStorage.setItem('loggedInHospitalId', data.hospital.uniqueId);
          setToken(data.token);
          sessionStorage.setItem('loggedInUser', data.hospital.name);
          sessionStorage.setItem('loggedInRole', 'Hospital');
          sessionStorage.setItem('loggedInUserEmail', data.hospital.email);
          sessionStorage.setItem('loggedInHospitalId', data.hospital.uniqueId);
          authUser = { fullName: data.hospital.name, email: data.hospital.email, uniqueId: data.hospital.uniqueId };
          setUser(authUser);
          setRole('hospital');
        } else {
          // Store actual JWT token returned by backend, or fallback to mock token if old backend
          const tokenToStore = data.token || 'employee-session';
          localStorage.setItem('token', tokenToStore);
          setToken(tokenToStore);
          
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
    <AuthContext.Provider value={{ user, role, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
