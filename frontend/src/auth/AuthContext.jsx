import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { getMe } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthContextProvider({ children }) {
  const isAuthenticated = useIsAuthenticated();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | denied | error

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const me = await getMe();
      setProfile(me);
      setStatus('ready');
    } catch (err) {
      if (err.response?.status === 403) {
        setStatus('denied');
      } else {
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setProfile(null);
      setStatus('idle');
    }
  }, [isAuthenticated, load]);

  return (
    <AuthContext.Provider value={{ profile, status, isAdmin: profile?.role === 'admin', reload: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthProfile() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthProfile deve ser usado dentro de AuthContextProvider');
  return ctx;
}
