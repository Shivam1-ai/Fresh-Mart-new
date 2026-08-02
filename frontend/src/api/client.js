import axios from 'axios';
import { broadcastAuthChange, clearStoredSession } from '../utils/authSession.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('freshmart_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredSession();
      broadcastAuthChange(null);
    }

    return Promise.reject(error);
  }
);

export default api;

