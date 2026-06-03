import apiClient from './apiClient';

// Admin Auth
export const checkAdminExists = async () => {
  const response = await apiClient.get('/api/admin-register/check-admin-exists');
  return response.data;
};

export const registerAdmin = async (data) => {
  const response = await apiClient.post('/api/admin-register/register', data);
  return response.data;
};

export const loginAdmin = async (data) => {
  const response = await apiClient.post('/api/admin-register/login', data);
  return response.data;
};

export const forgotPasswordAdmin = async (data) => {
  const response = await apiClient.post('/api/admin-register/forgot-password', data);
  return response.data;
};

export const resetPasswordAdmin = async (data) => {
  const response = await apiClient.post('/api/admin-register/reset-password', data);
  return response.data;
};

// Employee/User Auth
export const loginEmployee = async (data) => {
  const response = await apiClient.post('/api/employee/login', data);
  return response.data;
};

// Hospital Partner Auth
export const loginHospital = async (data) => {
  const response = await apiClient.post('/api/hospital-admin-system/hospital/login', data);
  return response.data;
};
