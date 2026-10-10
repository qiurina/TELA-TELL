import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The person's own answer to "using a clip-on macro lens?" for the scan they are about to run.
 * The app cannot detect a lens, so this is only a record that is saved with each scan so results
 * can later be compared with and without one. It is remembered between scans and launches (a
 * shopper with a lens will usually keep using it) and is stored on the device only.
 */
const STORAGE_KEY = '@tela-tell/clip-on-lens';

let clipOnLens = false;
let hydrated = false;

export async function hydrateClipOnLens(): Promise<void> {
  if (hydrated) {
    return;
  }

  try {
    clipOnLens = (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
  } catch {
    // Best-effort: the worst case is that the toggle starts off.
  }

  hydrated = true;
}

export function getClipOnLens(): boolean {
  return clipOnLens;
}

export function setClipOnLens(value: boolean): void {
  clipOnLens = value;
  hydrated = true;
  void (value
    ? AsyncStorage.setItem(STORAGE_KEY, 'true')
    : AsyncStorage.removeItem(STORAGE_KEY)
  ).catch(() => {});
}
