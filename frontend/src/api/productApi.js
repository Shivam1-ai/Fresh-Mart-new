import api from './client.js';

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const fetchProductById = async (productId) => {
  const { data } = await api.get(`/products/${productId}`);
  return data;
};

export const fetchProductReviews = async (productId) => {
  const { data } = await api.get(`/products/${productId}/reviews`);
  return data;
};

export const submitProductReview = async (productId, payload) => {
  const { data } = await api.post(`/products/${productId}/reviews`, payload);
  return data;
};