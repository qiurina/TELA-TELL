import AsyncStorage from '@react-native-async-storage/async-storage';


const ONBOARDING_KEY = '@tela-tell/onboarding-complete';
const SESSION_KEY = '@tela-tell/auth-session';

export type AuthSession = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
};

export async function getOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    // Must have the fields from a real SQLite login/register.
    // Old sessions that only had { email } are treated as logged out.
    if (!parsed.userId || !parsed.email || !parsed.firstName || !parsed.lastName) {
      return null;
    }

    return {
      userId: parsed.userId,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      middleInitial: parsed.middleInitial ?? null,
    };
  } catch {
    return null;
  }
}

export async function setStoredSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/** Dev helper — clears welcome + session during testing. */
export async function clearOnboardingForDev(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDING_KEY, SESSION_KEY]);
}