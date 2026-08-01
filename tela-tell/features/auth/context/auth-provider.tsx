import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearStoredSession,
  getOnboardingComplete,
  getStoredSession,
  setOnboardingComplete,
  setStoredSession,
  type AuthSession,
} from '@/features/auth/lib/auth-session';
import {
  clearUserPreferences,
  hydrateUserPreferences,
} from '@/features/profile/lib/user-preferences';
import { loginUser, registerUser, type RegisterUserInput } from '@/db/users';

type AuthContextValue = {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  session: AuthSession | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterUserInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      const [onboardingDone, storedSession] = await Promise.all([
        getOnboardingComplete(),
        getStoredSession(),
      ]);

      if (storedSession?.userId) {
        await hydrateUserPreferences(storedSession.userId);
      }

      if (!active) {
        return;
      }

      setHasCompletedOnboarding(onboardingDone);
      setSession(storedSession);
      setIsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  /** Turns a DB user into the stored session, saves it, and updates state. */
  const startSession = useCallback(async (user: AuthSession) => {
    await hydrateUserPreferences(user.userId);
    await Promise.all([setOnboardingComplete(), setStoredSession(user)]);
    setHasCompletedOnboarding(true);
    setSession(user);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await loginUser({ email, password });
      await startSession(user);
    },
    [startSession],
  );

  const signUp = useCallback(
    async (input: RegisterUserInput) => {
      const user = await registerUser(input);
      await startSession(user);
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
      hasCompletedOnboarding,
      session,
      isSignedIn: Boolean(session?.userId),
      signIn,
      signUp,
      signOut,
    }),
    [hasCompletedOnboarding, isLoading, session, signIn, signUp, signOut],
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