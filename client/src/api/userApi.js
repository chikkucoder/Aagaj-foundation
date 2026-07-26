import apiClient from './apiClient';

// --- EMPLOYEE PROFILE ---
export const getEmployeeProfile = async (email) => {
  const response = await apiClient.get('/api/employee/profile', {
    params: { email },
  });
  return response.data;
};

// --- APPOINTMENTS ---
export const verifyHealthCardId = async (healthId) => {
  const response = await apiClient.get(`/api/appointment/verify-health/${healthId}`);
  return response.data;
};

export const editHealthCardDetails = async (id, data) => {
  const response = await apiClient.put(`/api/healthcard/admin/edit/${id}`, data);
  return response.data;
};

export const bookAppointment = async (formData) => {
  // Uses multipart/form-data for optionally uploading the health card file
  const response = await apiClient.post('/api/appointment/book', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const verifyAppointmentPayment = async (data) => {
  const response = await apiClient.post('/api/appointment/verify-payment', data);
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await apiClient.get('/api/appointment/all');
  return response.data;
};

// --- ADMIN SYSTEM (GENERAL & EMPLOYEES) ---
export const getAllApplicants = async () => {
  const response = await apiClient.get('/api/admin/get-all-applicants');
  return response.data;
};

export const getAllBeneficiaries = async () => {
  const response = await apiClient.get('/api/admin/get-all-beneficiaries');
  return response.data;
};

export const getEmployeeDetailedStats = async () => {
  const response = await apiClient.get('/api/admin/employee-detailed-stats');
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/api/admin/delete-employee/${id}`);
  return response.data;
};

// --- HOSPITAL ADMIN SYSTEM (SUPER ADMIN CONTROL) ---
export const getHospitalAdminStats = async () => {
  const response = await apiClient.get('/api/hospital-admin-system/admin/stats');
  return response.data;
};

export const getHospitalAdminHospitals = async () => {
  const response = await apiClient.get('/api/hospital-admin-system/admin/hospitals');
  return response.data;
};

export const registerHospital = async (data) => {
  const response = await apiClient.post('/api/hospital-admin-system/admin/register-hospital', data);
  return response.data;
};

export const editHospital = async (uniqueId, data) => {
  const response = await apiClient.put(`/api/hospital-admin-system/admin/edit-hospital/${uniqueId}`, data);
  return response.data;
};

export const toggleHospitalStatus = async (uniqueId) => {
  const response = await apiClient.patch(`/api/hospital-admin-system/admin/toggle-status/${uniqueId}`);
  return response.data;
};

export const deleteHospital = async (uniqueId) => {
  const response = await apiClient.delete(`/api/hospital-admin-system/admin/delete-hospital/${uniqueId}`);
  return response.data;
};

export const generateHospitalCredentials = async (data) => {
  const response = await apiClient.post('/api/hospital-admin-system/admin/generate-credentials', data);
  return response.data;
};

export const resetHospitalPassword = async (data) => {
  const response = await apiClient.post('/api/hospital-admin-system/admin/reset-hospital-password', data);
  return response.data;
};

export const getHospitalGlobalReports = async (params) => {
  const response = await apiClient.get('/api/hospital-admin-system/admin/global-reports', { params });
  return response.data;
};

export const getHospitalAuditLogs = async (params) => {
  const response = await apiClient.get('/api/hospital-admin-system/admin/audit-logs', { params });
  return response.data;
};

// --- HOSPITAL PARTNER SYSTEM (HOSPITAL SIDE) ---
export const getHospitalBills = async (hospitalId) => {
  const response = await apiClient.get('/api/hospital-admin-system/hospital/bills', {
    params: { hospitalId },
  });
  return response.data;
};

export const addHospitalBill = async (data) => {
  const response = await apiClient.post('/api/hospital-admin-system/hospital/add-bill', data);
  return response.data;
};

export const verifyHospitalPatient = async (healthId) => {
  const response = await apiClient.get(`/api/hospital-admin-system/hospital/verify-patient/${healthId}`);
  return response.data;
};

export const getHospitalAppointments = async (hospitalId) => {
  const response = await apiClient.get('/api/hospital-admin-system/hospital/appointments', {
    params: { hospitalId },
  });
  return response.data;
};

export const updateHospitalAppointmentStatus = async (data) => {
  const response = await apiClient.patch('/api/hospital-admin-system/hospital/update-appointment-status', data);
  return response.data;
};

export const getHospitalActivity = async (hospitalId) => {
  const response = await apiClient.get(`/api/hospital-admin-system/admin/hospital-activity/${hospitalId}`);
  return response.data;
};

export const getEmployeeActivity = async (email) => {
  const response = await apiClient.get('/api/hospital-admin-system/admin/employee-activity', {
    params: { email }
  });
  return response.data;
};

// --- SWASTHYA SURAKSHA PARTNERS ---
export const registerSwasthyaPartner = async (data) => {
  const response = await apiClient.post('/api/swasthya/register', data);
  return response.data;
};

export const getSwasthyaPartners = async () => {
  const response = await apiClient.get('/api/swasthya/partners');
  return response.data;
};

// --- TRANSACTIONS LOG ---
export const getAdminTransactions = async () => {
  const response = await apiClient.get('/api/admin/transactions');
  return response.data;
};

// --- MEMBERSHIPS ---
export const deleteMembership = async (id) => {
  const response = await apiClient.delete(`/api/membership/${id}`);
  return response.data;
};



