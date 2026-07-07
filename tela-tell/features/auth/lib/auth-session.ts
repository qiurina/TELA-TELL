import AsyncStorage from '@react-native-async-storage/async-storage';

/** Prototype: always open Welcome on launch for demos. Set false when shipping auth. */
export const PROTOTYPE_ALWAYS_SHOW_WELCOME = false;

const ONBOARDING_KEY = '@tela-tell/onboarding-complete';
const SESSION_KEY = '@tela-tell/auth-session';

export type AuthSession = {
  email: string;
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
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed.email ? parsed : null;
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

/** Prototype helper — reset first-launch welcome during development. */
export async function clearOnboardingForDev(): Promise<void> {
  await AsyncStorage.multiRemove([ONBOARDING_KEY, SESSION_KEY]);
}
