import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';

export type Role = 'ROLE_GM' | 'ROLE_COACH' | 'ROLE_SCOUT';
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  org: string;
  username?: string;
  organization?: string;
}

export type Status = 'loading' | 'authed' | 'anon';

interface Ctx {
  user: User | null;
  status: Status;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, name: string, password: string, role?: string, org?: string) => Promise<any>;
  refreshUser?: () => Promise<void>;
}

const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

let inFlightSessionCheck: Promise<User | null> | null = null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  // Clear any legacy demo credentials from localStorage on mount
  useEffect(() => {
    localStorage.removeItem('gs_token');
    localStorage.removeItem('gs_user');
    localStorage.removeItem('gs_fallback_notifs');
  }, []);

  // ONLY call made before login: "who am I?" via httpOnly session cookie
  // Deduplicated with inFlightSessionCheck to prevent React StrictMode double invocation
  const checkSession = useCallback(async () => {
    if (inFlightSessionCheck) {
      const existing = await inFlightSessionCheck;
      if (existing) {
        setUser(existing);
        setStatus('authed');
      } else {
        setUser(null);
        setStatus('anon');
      }
      return;
    }

    inFlightSessionCheck = (async () => {
      try {
        const res = await api<any>('/api/auth/me');
        return (res?.user || res) as User;
      } catch {
        if ((import.meta as any).env?.DEV) {
          return {
            id: 'USR-001',
            name: 'Maya Lin',
            email: 'gm@goldensnitch.gg',
            role: 'ROLE_GM',
            org: 'Logic Legend Esports',
            username: 'maya',
            organization: 'Logic Legend Esports',
          };
        }
        return null;
      }
    })();

    try {
      const u = await inFlightSessionCheck;
      if (u) {
        setUser(u);
        setStatus('authed');
      } else {
        setUser(null);
        setStatus('anon');
      }
    } finally {
      inFlightSessionCheck = null;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setStatus('anon');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanId = email.trim();
    try {
      const res = await api<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: cleanId, email: cleanId, password }),
      });
      const authUser = (res?.user || res) as User;
      setUser(authUser);
      setStatus('authed');
    } catch (err) {
      if ((import.meta as any).env?.DEV) {
        const devUser: User = {
          id: 'USR-001',
          name: 'Maya Lin',
          email,
          role: 'ROLE_GM',
          org: 'Logic Legend Esports',
          username: 'maya',
          organization: 'Logic Legend Esports',
        };
        setUser(devUser);
        setStatus('authed');
        return;
      }
      throw err;
    }
  }, []);

  const register = useCallback(
    async (username: string, name: string, password: string, role = 'ROLE_SCOUT', org = 'Logic Legend Esports') => {
      const res = await api<any>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, name, password, role, organization: org }),
      });
      const authUser = (res?.user || res) as User;
      if (authUser?.id) {
        setUser(authUser);
        setStatus('authed');
      }
      return res;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setStatus('anon');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authed' && !!user,
      isLoading: status === 'loading',
      token: null,
      login,
      logout,
      register,
      refreshUser: checkSession,
    }),
    [user, status, login, logout, register, checkSession],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export default AuthProvider;
