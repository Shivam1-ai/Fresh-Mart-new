import axios from 'axios';
import { broadcastAuthChange, clearStoredSession, readStoredUser } from '../utils/authSession.js';

const apiBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : null);

if (!apiBaseURL) {
  throw new Error('VITE_API_URL is required in production');
}

const api = axios.create({
  baseURL: apiBaseURL
});

api.interceptors.request.use((config) => {
  const user = readStoredUser();
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
