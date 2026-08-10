import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { broadcastAuthChange, clearStoredSession, mergeStoredUser, persistStoredUser, readStoredUser, subscribeToAuthChanges } from '../utils/authSession.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  useEffect(() => subscribeToAuthChanges((nextUser) => setUser(nextUser)), []);

  const syncUser = (nextUser) => {
    const normalizedUser = mergeStoredUser(nextUser);

    if (normalizedUser) persistStoredUser(normalizedUser);
    else clearStoredSession();

    setUser(normalizedUser);
    broadcastAuthChange(normalizedUser);
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

