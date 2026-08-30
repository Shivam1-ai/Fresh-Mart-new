import api from './client.js';

export const validatePromoCode = async (code, subtotal) => {
  const { data } = await api.post('/promotions/validate', { code, subtotal });
  return data;
};
