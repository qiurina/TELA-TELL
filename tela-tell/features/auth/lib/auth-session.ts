import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@tela-tell/auth-session';
const REMEMBERED_EMAIL_KEY = '@tela-tell/remembered-email';

export type AuthSession = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
};

export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

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

export async function getRememberedEmail(): Promise<string | null> {
  return AsyncStorage.getItem(REMEMBERED_EMAIL_KEY);
}

export async function setRememberedEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
}

export async function clearRememberedEmail(): Promise<void> {
  await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
}
