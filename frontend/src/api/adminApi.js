import api from './client.js';

export const fetchAdminSummary = async () => {
  const { data } = await api.get('/admin/summary');
  return data;
};

export const fetchAdminAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data;
};

export const fetchAdminUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data;
};

export const fetchAdminVendors = async () => {
  const { data } = await api.get('/admin/vendors');
  return data;
};

export const approveVendor = async (vendorId) => {
  const { data } = await api.patch(`/admin/vendors/${vendorId}/approve`);
  return data;
};

export const rejectVendor = async (vendorId, payload = {}) => {
  const { data } = await api.patch(`/admin/vendors/${vendorId}/reject`, payload);
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get('/admin/categories');
  return data;
};

export const fetchPromotions = async () => {
  const { data } = await api.get('/admin/promotions');
  return data;
};

export const createPromotion = async (payload) => {
  const { data } = await api.post('/admin/promotions', payload);
  return data;
};

export const updatePromotion = async (promotionId, payload) => {
  const { data } = await api.put(`/admin/promotions/${promotionId}`, payload);
  return data;
};

export const deletePromotion = async (promotionId) => {
  const { data } = await api.delete(`/admin/promotions/${promotionId}`);
  return data;
};

export const fetchRefundRequests = async () => {
  const { data } = await api.get('/admin/refunds');
  return data;
};

export const resolveRefundRequest = async (refundId, payload) => {
  const { data } = await api.patch(`/admin/refunds/${refundId}`, payload);
  return data;
};

export const updateUserRole = async (userId, payload) => {
  const { data } = await api.patch(`/admin/users/${userId}/role`, payload);
  return data;
};

export const updateUserStatus = async (userId, payload) => {
  const { data } = await api.patch(`/admin/users/${userId}/status`, payload);
  return data;
};