import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('freshmart_user') || 'null'));

  const syncUser = (nextUser) => {
    if (nextUser) {
      localStorage.setItem('freshmart_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('freshmart_user');
    }

    setUser(nextUser);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    syncUser(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    syncUser(data);
    return data;
  };

  const updateUser = (nextUser) => {
    syncUser(nextUser);
  };

  const logout = () => {
    syncUser(null);
  };

  const value = useMemo(() => ({ user, login, register, updateUser, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

