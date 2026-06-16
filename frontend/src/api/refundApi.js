import api from './client.js';

export const createRefundRequest = async (payload) => {
  const { data } = await api.post('/refunds', payload);
  return data;
};

export const fetchMyRefundRequests = async () => {
  const { data } = await api.get('/refunds/my');
  return data;
};