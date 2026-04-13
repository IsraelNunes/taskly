import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service';
import { clearAuthSession, loadAuthSession, saveAuthSession } from '../storage/auth-storage';
import { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const session = await loadAuthSession();

        if (!session.token) {
          return;
        }

        const remoteUser = await authService.me(session.token);
        setToken(session.token);
        setUser(remoteUser);
        await saveAuthSession(session.token, remoteUser);
      } catch {
        await clearAuthSession();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const signIn = async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setToken(result.accessToken);
    setUser(result.user);
    await saveAuthSession(result.accessToken, result.user);
  };

  const signUp = async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setToken(result.accessToken);
    setUser(result.user);
    await saveAuthSession(result.accessToken, result.user);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await clearAuthSession();
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    const remoteUser = await authService.me(token);
    setUser(remoteUser);
    await saveAuthSession(token, remoteUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};
