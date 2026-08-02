const AUTH_STORAGE_KEY = 'freshmart_user';
const CART_STORAGE_PREFIX = 'freshmart_cart';
const AUTH_CHANGE_EVENT = 'freshmart-auth-change';

const isBrowser = () => typeof window !== 'undefined';

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return Boolean(decoded.exp && decoded.exp * 1000 <= Date.now());
  } catch {
    return true;
  }
};

export const readStoredUser = () => {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearCachedCartState = () => {
  if (!isBrowser()) return;

  [localStorage, sessionStorage].forEach((storage) => {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(CART_STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  });
};

export const clearStoredSession = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  clearCachedCartState();
};

export const persistStoredUser = (user) => {
  if (!isBrowser()) return;

  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const broadcastAuthChange = (user) => {
  if (!isBrowser()) return;

  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: user }));
};

export const subscribeToAuthChanges = (handler) => {
  if (!isBrowser()) return () => {};

  const onAuthChange = (event) => handler(event.detail ?? null);
  const onStorageChange = (event) => {
    if (event.key === AUTH_STORAGE_KEY) {
      handler(readStoredUser());
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
  window.addEventListener('storage', onStorageChange);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    window.removeEventListener('storage', onStorageChange);
  };
};