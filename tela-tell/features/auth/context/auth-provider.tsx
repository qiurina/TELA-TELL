import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearStoredSession,
  getOnboardingComplete,
  getStoredSession,
  setOnboardingComplete,
  setStoredSession,
  type AuthSession,
} from '@/features/auth/lib/auth-session';

type AuthContextValue = {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  session: AuthSession | null;
  isSignedIn: boolean;
  continueWithoutAccount: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
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

  const continueWithoutAccount = useCallback(async () => {
    await setOnboardingComplete();
    setHasCompletedOnboarding(true);
  }, []);

  const signIn = useCallback(async (email: string) => {
    const trimmedEmail = email.trim();
    const nextSession = { email: trimmedEmail };
    await Promise.all([setOnboardingComplete(), setStoredSession(nextSession)]);
    setHasCompletedOnboarding(true);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      hasCompletedOnboarding,
      session,
      isSignedIn: Boolean(session?.email),
      continueWithoutAccount,
      signIn,
      signOut,
    }),
    [continueWithoutAccount, hasCompletedOnboarding, isLoading, session, signIn, signOut],
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
