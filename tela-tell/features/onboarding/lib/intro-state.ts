import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/** Whether the intro slides have been completed or skipped. Stored on the device only. */
const STORAGE_KEY = '@tela-tell/intro-seen';

type IntroSnapshot = { loaded: boolean; introSeen: boolean };

let snapshot: IntroSnapshot = { loaded: false, introSeen: false };
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: IntroSnapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function loadIntroState(): Promise<void> {
  if (!loadPromise) {
    loadPromise = (async () => {
      let introSeen = false;
      try {
        introSeen = (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
      } catch {
        // Best-effort: the worst case is that the slides show again.
      }
      publish({ loaded: true, introSeen });
    })();
  }
  return loadPromise;
}

export function markIntroSeen(): void {
  publish({ loaded: true, introSeen: true });
  void AsyncStorage.setItem(STORAGE_KEY, 'true').catch(() => {});
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): IntroSnapshot {
  return snapshot;
}

export function useIntroState(): IntroSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
