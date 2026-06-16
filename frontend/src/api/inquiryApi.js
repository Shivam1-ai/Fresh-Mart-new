import api from './client.js';

export const createInquiry = async (payload) => {
  const { data } = await api.post('/inquiries', payload);
  return data;
};

export const fetchMyInquiries = async () => {
  const { data } = await api.get('/inquiries/my');
  return data;
};