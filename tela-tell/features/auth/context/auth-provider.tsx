import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearRememberedUsername,
  clearStoredSession,
  getStoredSession,
  setRememberedUsername,
  setStoredSession,
  type AuthSession,
} from '@/features/auth/lib/auth-session';
import {
  clearUserPreferences,
  hydrateUserPreferences,
} from '@/features/profile/lib/user-preferences';
import { loginUser, registerUser, type RegisterUserInput } from '@/db/users';

type SignInOptions = {
  rememberMe?: boolean;
};

type AuthContextValue = {
  isLoading: boolean;
  session: AuthSession | null;
  isSignedIn: boolean;
  signIn: (username: string, password: string, options?: SignInOptions) => Promise<void>;
  signUp: (input: RegisterUserInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: (user: AuthSession) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const storedSession = await getStoredSession();

      if (storedSession?.userId) {
        await hydrateUserPreferences(storedSession.userId);
      }

      if (!active) {
        return;
      }

      setSession(storedSession);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback(async (user: AuthSession) => {
    await hydrateUserPreferences(user.userId);
    await setStoredSession(user);
    setSession(user);
  }, []);

  const signIn = useCallback(
    async (username: string, password: string, options?: SignInOptions) => {
      const rememberMe = options?.rememberMe ?? false;
      const user = await loginUser({ username, password });
      await startSession(user);

      if (rememberMe) {
        await setRememberedUsername(user.username);
      } else {
        await clearRememberedUsername();
      }
    },
    [startSession],
  );

  const signUp = useCallback(
    async (input: RegisterUserInput) => {
      const user = await registerUser(input);
      await startSession(user);
      await setRememberedUsername(user.username);
    },
    [startSession],
  );

  const signOut = useCallback(async () => {
    await clearStoredSession();
    clearUserPreferences();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      isSignedIn: Boolean(session?.userId),
      signIn,
      signUp,
      signOut,
      refreshSession: startSession,
    }),
    [isLoading, session, signIn, signUp, signOut, startSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
