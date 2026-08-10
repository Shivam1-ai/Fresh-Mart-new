const AUTH_STORAGE_KEY = 'freshmart_user';
const CART_STORAGE_PREFIX = 'freshmart_cart';
const AUTH_CHANGE_EVENT = 'freshmart-auth-change';

const isBrowser = () => typeof window !== 'undefined';

const removeStorageItem = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage errors so logout can still continue.
  }
};

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
      removeStorageItem(localStorage, AUTH_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    removeStorageItem(localStorage, AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearCachedCartState = () => {
  if (!isBrowser()) return;

  [localStorage, sessionStorage].forEach((storage) => {
    try {
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && key.startsWith(CART_STORAGE_PREFIX)) keys.push(key);
      }
      keys.forEach((key) => removeStorageItem(storage, key));
    } catch {
      // Ignore storage errors so logout can still continue.
    }
  });
};

export const clearStoredSession = () => {
  if (!isBrowser()) return;

  removeStorageItem(localStorage, AUTH_STORAGE_KEY);
  removeStorageItem(sessionStorage, AUTH_STORAGE_KEY);
  clearCachedCartState();
};

export const persistStoredUser = (user) => {
  if (!isBrowser()) return;

  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const mergeStoredUser = (nextUser) => {
  if (!isBrowser()) return nextUser;

  if (!nextUser) return null;

  const currentUser = readStoredUser();
  if (nextUser.token) return nextUser;

  return currentUser?.token ? { ...currentUser, ...nextUser, token: currentUser.token } : nextUser;
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
