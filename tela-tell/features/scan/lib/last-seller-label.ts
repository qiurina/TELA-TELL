import AsyncStorage from '@react-native-async-storage/async-storage';

/** Draft seller label for the next scan (and until a scan is saved with it). */
const STORAGE_KEY = 'tela_tell_last_seller_label';

let lastSellerLabel: string | null = null;
let hydrated = false;

/** Load any previously saved draft label into memory (call once on app start). */
export async function hydrateLastSellerLabel(): Promise<void> {
  if (hydrated) {
    return;
  }

  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    lastSellerLabel = value?.trim() || null;
  } catch {
    lastSellerLabel = null;
  }

  hydrated = true;
}

export function setLastSellerLabel(label: string) {
  lastSellerLabel = label.trim() || null;
  void persistDraft(lastSellerLabel);
}

export function getLastSellerLabel(): string | null {
  return lastSellerLabel;
}

export function clearLastSellerLabel() {
  lastSellerLabel = null;
  void persistDraft(null);
}

async function persistDraft(value: string | null) {
  try {
    if (value) {
      await AsyncStorage.setItem(STORAGE_KEY, value);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Offline draft persistence is best-effort.
  }
}
