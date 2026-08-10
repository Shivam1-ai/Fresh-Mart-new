import api from './client.js';

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

export default { forgotPassword, resetPassword };
