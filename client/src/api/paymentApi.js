import apiClient from './apiClient';

// Health Card
export const createHealthCardOrder = async (data) => {
  const response = await apiClient.post('/api/healthcard/create-order', data);
  return response.data;
};

export const verifyHealthCardPayment = async (data) => {
  const response = await apiClient.post('/api/healthcard/verify-payment', data);
  return response.data;
};

export const checkHealthCardExists = async (params) => {
  const response = await apiClient.get('/api/healthcard/check-exists', { params });
  return response.data;
};

// Silayi Scheme
export const createSilayiOrder = async (data) => {
  const response = await apiClient.post('/api/schemes/create-order', data);
  return response.data;
};

export const verifySilayiPayment = async (data) => {
  const response = await apiClient.post('/api/schemes/verify-payment', data);
  return response.data;
};

// Swarojgaar Scheme
export const createSwarojgaarOrder = async (data) => {
  const response = await apiClient.post('/api/swarojgaar/create-order', data);
  return response.data;
};

export const verifySwarojgaarPayment = async (data) => {
  const response = await apiClient.post('/api/swarojgaar/verify-payment', data);
  return response.data;
};

// Donations
export const createDonationOrder = async (data) => {
  const response = await apiClient.post('/api/donation/create-donation-order', data);
  return response.data;
};

export const verifyDonationPayment = async (data) => {
  const response = await apiClient.post('/api/donation/verify-donation', data);
  return response.data;
};

// Career/Job Application
export const createApplicationOrder = async (data) => {
  const response = await apiClient.post('/api/application/create-order', data);
  return response.data;
};

export const verifyApplicationPayment = async (data) => {
  const response = await apiClient.post('/api/application/verify-payment', data);
  return response.data;
};
