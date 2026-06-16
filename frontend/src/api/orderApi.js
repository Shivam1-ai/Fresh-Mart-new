import api from './client.js';

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const fetchMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data;
};

export const fetchOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

export const fetchOrderTracking = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}/tracking`);
  return data;
};