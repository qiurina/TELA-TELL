import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearRememberedEmail,
  clearStoredSession,
  getStoredSession,
  setRememberedEmail,
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
  signIn: (email: string, password: string, options?: SignInOptions) => Promise<void>;
  signUp: (input: RegisterUserInput) => Promise<void>;
  signOut: () => Promise<void>;
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
    async (email: string, password: string, options?: SignInOptions) => {
      const rememberMe = options?.rememberMe ?? false;
      const user = await loginUser({ email, password });
      await startSession(user);

      if (rememberMe) {
        await setRememberedEmail(user.email);
      } else {
        await clearRememberedEmail();
      }
    },
    [startSession],
  );

  const signUp = useCallback(
    async (input: RegisterUserInput) => {
      const user = await registerUser(input);
      await startSession(user);
      await setRememberedEmail(user.email);
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
    }),
    [isLoading, session, signIn, signUp, signOut],
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
