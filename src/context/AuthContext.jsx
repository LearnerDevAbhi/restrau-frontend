import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_TOKEN_KEY } from '../services/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState(() => (localStorage.getItem(ADMIN_TOKEN_KEY) ? 'checking' : 'signedOut'));

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    if (status !== 'checking') return;
    authService
      .me()
      .then((me) => {
        setAdmin(me);
        setStatus('signedIn');
      })
      .catch(logout);
  }, [status, logout]);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { token, admin: me } = await authService.login(email, password);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setAdmin(me);
    setStatus('signedIn');
    return me;
  }, []);

  const value = useMemo(() => ({ admin, status, login, logout }), [admin, status, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
