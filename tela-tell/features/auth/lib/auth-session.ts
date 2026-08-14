import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@tela-tell/auth-session';
const REMEMBERED_USERNAME_KEY = '@tela-tell/remembered-username';

export type AuthSession = {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  middleInitial?: string | null;
  avatarUri?: string | null;
};

export async function getStoredSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    if (!parsed.userId || !parsed.username || !parsed.firstName || !parsed.lastName) {
      return null;
    }

    return {
      userId: parsed.userId,
      username: parsed.username,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      middleInitial: parsed.middleInitial ?? null,
      avatarUri: parsed.avatarUri ?? null,
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

export async function getRememberedUsername(): Promise<string | null> {
  return AsyncStorage.getItem(REMEMBERED_USERNAME_KEY);
}

export async function setRememberedUsername(username: string): Promise<void> {
  await AsyncStorage.setItem(REMEMBERED_USERNAME_KEY, username.trim());
}

export async function clearRememberedUsername(): Promise<void> {
  await AsyncStorage.removeItem(REMEMBERED_USERNAME_KEY);
}
