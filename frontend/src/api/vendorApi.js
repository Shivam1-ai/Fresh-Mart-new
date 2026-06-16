import api from './client.js';

export const registerVendor = async (payload) => {
  const { data } = await api.post('/auth/vendors/register', payload);
  return data;
};

export const fetchVendorProfile = async () => {
  const { data } = await api.get('/vendors/profile');
  return data;
};

export const updateVendorProfile = async (payload) => {
  const { data } = await api.put('/vendors/profile', payload);
  return data;
};

export const fetchVendorDashboard = async () => {
  const { data } = await api.get('/vendors/dashboard');
  return data;
};

export const fetchVendorProducts = async () => {
  const { data } = await api.get('/vendors/products');
  return data;
};

export const createVendorProduct = async (payload) => {
  const { data } = await api.post('/vendors/products', payload);
  return data;
};

export const updateVendorProduct = async (productId, payload) => {
  const { data } = await api.put(`/vendors/products/${productId}`, payload);
  return data;
};

export const deleteVendorProduct = async (productId) => {
  const { data } = await api.delete(`/vendors/products/${productId}`);
  return data;
};

export const fetchVendorOrders = async () => {
  const { data } = await api.get('/vendors/orders');
  return data;
};

export const updateVendorOrderStatus = async (orderId, payload) => {
  const { data } = await api.put(`/vendors/orders/${orderId}`, payload);
  return data;
};

export const fetchVendorEarnings = async () => {
  const { data } = await api.get('/vendors/earnings');
  return data;
};

export const fetchVendorInquiries = async () => {
  const { data } = await api.get('/vendors/inquiries');
  return data;
};

export const replyToInquiry = async (inquiryId, payload) => {
  const { data } = await api.patch(`/vendors/inquiries/${inquiryId}`, payload);
  return data;
};