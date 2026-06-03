import apiClient from './apiClient';

export const getSilayiSchemeByOrder = async (orderId) => {
  const response = await apiClient.get(`/api/schemes/get-by-order/${orderId}`);
  return response.data;
};

export const getSwarojgaarSchemeByOrder = async (orderId) => {
  const response = await apiClient.get(`/api/swarojgaar/get-by-order/${orderId}`);
  return response.data;
};
