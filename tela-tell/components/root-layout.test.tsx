import type { ReactElement, ReactNode } from 'react';
import { Animated } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import RootLayout from '@/app/_layout';
import { migrateDatabase } from '@/db/migrate';
import type { MigrationReport } from '@/db/migration-report';
import { hydrateUserPreferences } from '@/features/profile/lib/user-preferences';
import { showAlert } from '@/components/ui/alert-dialog';

// jest-expo already supplies the matching renderer; only the API used here needs typing.
type TestInstance = {
  props: { onRetry?: () => void; retrying?: boolean };
  findByType: (type: string) => TestInstance;
  findAllByType: (type: string) => TestInstance[];
};
type TestRenderer = { root: TestInstance; update: (element: ReactElement) => void; unmount: () => void };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => void | Promise<void>) => Promise<void>;
  create: (element: ReactElement) => TestRenderer;
};

let mockFontsLoaded = true;
let mockFontError: Error | null = null;

jest.mock('@/lib/dev-console', () => ({}));
jest.mock('@expo-google-fonts/poppins', () => ({
  Poppins_400Regular: 1, Poppins_500Medium: 2, Poppins_600SemiBold: 3, Poppins_700Bold: 4,
  useFonts: () => [mockFontsLoaded, mockFontError],
}));
jest.mock('@react-navigation/native', () => ({
  DefaultTheme: { colors: {} }, ThemeProvider: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('expo-router', () => ({ Stack: Object.assign(jest.fn(() => null), { Screen: () => null }) }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => undefined), hideAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('react-native-reanimated', () => ({}));
jest.mock('@/components/app-error-boundary', () => ({ AppErrorFallback: 'AppErrorFallback' }));
jest.mock('@/components/splash/app-splash', () => ({ AppSplash: 'AppSplash' }));
jest.mock('@/components/startup-error', () => ({ StartupError: 'StartupError' }));
jest.mock('@/components/ui/alert-dialog', () => ({ AlertHost: () => null, showAlert: jest.fn() }));
jest.mock('@/db/migrate', () => ({ migrateDatabase: jest.fn() }));
jest.mock('@/features/profile/lib/user-preferences', () => ({ hydrateUserPreferences: jest.fn() }));
jest.mock('@/features/onboarding/lib/intro-state', () => ({ loadIntroState: jest.fn(async () => undefined) }));
jest.mock('@/features/scan/lib/clip-on-lens', () => ({ hydrateClipOnLens: jest.fn(async () => undefined) }));
jest.mock('@/features/scan/lib/last-seller-label', () => ({ hydrateLastSellerLabel: jest.fn(async () => undefined) }));

let renderer: TestRenderer;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockFontsLoaded = true;
  mockFontError = null;
  (migrateDatabase as jest.Mock).mockResolvedValue({ issues: [] });
  (hydrateUserPreferences as jest.Mock).mockResolvedValue(undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: (callback) => callback?.({ finished: true }), stop: () => {}, reset: () => {},
  }));
});

afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  jest.restoreAllMocks();
  jest.useRealTimers();
});

async function mount() {
  await act(async () => { renderer = create(<RootLayout />); });
  await act(async () => { jest.advanceTimersByTime(3000); });
}

it('keeps navigation unmounted while the database is still initializing', async () => {
  let finish!: (report: MigrationReport) => void;
  (migrateDatabase as jest.Mock).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  await mount();
  expect(Stack).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType('AppSplash')).toHaveLength(1);
  await act(async () => { finish({ issues: [] }); });
  expect(Stack).toHaveBeenCalled();
  expect(renderer.root.findAllByType('AppSplash')).toHaveLength(0);
});

it('continues past the splash after a font-loading error', async () => {
  mockFontsLoaded = false;
  await mount();
  expect(Stack).not.toHaveBeenCalled();
  mockFontError = new Error('Font asset unavailable');
  await act(async () => { renderer.update(<RootLayout />); });
  await act(async () => { jest.advanceTimersByTime(50); });
  expect(Stack).toHaveBeenCalled();
  expect(SplashScreen.hideAsync).toHaveBeenCalled();
  expect(renderer.root.findAllByType('AppSplash')).toHaveLength(0);
  expect(renderer.root.findAllByType('StartupError')).toHaveLength(0);
});

it('shows recovery after a fatal database failure and opens navigation only after Retry succeeds', async () => {
  (migrateDatabase as jest.Mock).mockRejectedValueOnce(new Error('Cannot open database'));
  await mount();
  expect(Stack).not.toHaveBeenCalled();
  expect(hydrateUserPreferences).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType('AppSplash')).toHaveLength(0);
  await act(async () => { renderer.root.findByType('StartupError').props.onRetry?.(); });
  expect(migrateDatabase).toHaveBeenLastCalledWith({ retry: true });
  expect(Stack).toHaveBeenCalled();
  expect(renderer.root.findAllByType('StartupError')).toHaveLength(0);
});

it('keeps recovery visible and prevents overlapping retries while an attempt is pending', async () => {
  let finish!: (report: MigrationReport) => void;
  (migrateDatabase as jest.Mock).mockRejectedValueOnce(new Error('Cannot open database'))
    .mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  await mount();
  const retry = renderer.root.findByType('StartupError').props.onRetry;
  await act(async () => { retry?.(); retry?.(); });
  expect(migrateDatabase).toHaveBeenCalledTimes(2);
  expect(renderer.root.findByType('StartupError').props.retrying).toBe(true);
  expect(Stack).not.toHaveBeenCalled();
  await act(async () => { renderer.root.findByType('StartupError').props.onRetry?.(); });
  expect(migrateDatabase).toHaveBeenCalledTimes(2);
  await act(async () => { finish({ issues: [] }); });
  expect(Stack).toHaveBeenCalled();
});

it('blocks screens when preferences cannot be read and allows the read to be retried', async () => {
  (hydrateUserPreferences as jest.Mock).mockRejectedValueOnce(new Error('Read failed'));
  await mount();
  expect(Stack).not.toHaveBeenCalled();
  await act(async () => { renderer.root.findByType('StartupError').props.onRetry?.(); });
  expect(hydrateUserPreferences).toHaveBeenCalledTimes(2);
  expect(Stack).toHaveBeenCalled();
});

it('blocks navigation when a required database column could not be added', async () => {
  (migrateDatabase as jest.Mock).mockResolvedValueOnce({
    issues: [{ step: 'ensureScanColumn:createdAt', status: 'failed', reason: 'disk full' }],
  });
  await mount();
  expect(Stack).not.toHaveBeenCalled();
  expect(hydrateUserPreferences).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType('StartupError')).toHaveLength(1);
});

it('allows optional cleanup failures and displays the existing update warning after the splash', async () => {
  (migrateDatabase as jest.Mock).mockResolvedValueOnce({
    issues: [{ step: 'persistLegacyScanImages', status: 'failed', reason: 'disk full' }],
  });
  await mount();
  expect(Stack).toHaveBeenCalled();
  expect(renderer.root.findAllByType('StartupError')).toHaveLength(0);
  expect(showAlert).toHaveBeenCalledWith('Update incomplete', expect.any(String), 'info');
});
