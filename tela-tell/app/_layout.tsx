import '@/lib/dev-console';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Appearance, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppErrorFallback } from '@/components/app-error-boundary';
import { AppSplash } from '@/components/splash/app-splash';
import { StartupError } from '@/components/startup-error';
import { AlertHost, showAlert } from '@/components/ui/alert-dialog';
import { BrandColors } from '@/constants/brand';
import { migrateDatabase } from '@/db/migrate';
import {
  migrationBlocksStartup,
  migrationHadIssues,
  migrationWarningFor,
  type MigrationWarning,
} from '@/db/migration-report';
import { loadIntroState } from '@/features/onboarding/lib/intro-state';
import { hydrateUserPreferences } from '@/features/profile/lib/user-preferences';
import { hydrateClipOnLens } from '@/features/scan/lib/clip-on-lens';
import { hydrateLastSellerLabel } from '@/features/scan/lib/last-seller-label';

SplashScreen.preventAutoHideAsync();

if (typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}

const SPLASH_MIN_MS = 2500;
const FADE_MS = 400;

/** Force light cards — OS dark mode otherwise paints React Navigation cards black mid-transition. */
const AppNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: BrandColors.white,
    card: BrandColors.white,
    border: BrandColors.borderLight,
  },
};

export const unstable_settings = {
  anchor: 'index',
};

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} retry={retry} />;
}

export default function RootLayout() {
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
  const [startupStatus, setStartupStatus] = useState<'loading' | 'ready' | 'failed' | 'retrying'>('loading');
  const [startupAttempt, setStartupAttempt] = useState(0);
  const [migrationWarning, setMigrationWarning] = useState<MigrationWarning | null>(null);
  const splashOpacity = useState(() => new Animated.Value(1))[0];
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  // React Native uses system fonts for unregistered families. A font error must not block entry.
  const fontsReady = fontsLoaded || fontError !== null;
  const startupSettled = startupStatus !== 'loading';

  useEffect(() => {
    const timer = setTimeout(() => setSplashMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fontsReady) {
      return;
    }

    requestAnimationFrame(() => {
      void SplashScreen.hideAsync().catch((error) => {
        console.warn('[TELA-TELL] Could not hide native splash:', error);
      });
    });
  }, [fontsReady]);

  useEffect(() => {
    if (fontError) console.warn('[TELA-TELL] Fonts unavailable; continuing with system fonts:', fontError);
  }, [fontError]);

  useEffect(() => {
    if (!fontsReady || !splashMinTimeElapsed || !startupSettled || !showSplashOverlay) {
      return;
    }

    const animation = Animated.timing(splashOpacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setShowSplashOverlay(false);
      }
    });
    return () => animation.stop();
  }, [fontsReady, splashMinTimeElapsed, startupSettled, showSplashOverlay, splashOpacity]);

  // Shown once the splash has faded so the dialog isn't covered by it. Failed steps are only
  // logged; the user sees a plain message with no technical detail.
  useEffect(() => {
    if (migrationWarning && startupStatus === 'ready' && !showSplashOverlay) {
      showAlert(migrationWarning.title, migrationWarning.message, 'info');
    }
  }, [migrationWarning, startupStatus, showSplashOverlay]);

  // Screens read SQLite on mount; a fatal failure must keep them behind the recovery screen.
  useEffect(() => {
    let active = true;
    void migrateDatabase({ retry: startupAttempt > 0 })
      .then(async (report) => {
        if (!active) return;
        if (migrationBlocksStartup(report)) throw new Error('Required database update did not complete.');
        await hydrateUserPreferences();
        if (!active) return;
        setMigrationWarning(migrationHadIssues(report) ? migrationWarningFor(report) : null);
        setStartupStatus('ready');
      })
      .catch((error: unknown) => {
        console.warn('[TELA-TELL] Database startup failed:', error);
        if (active) setStartupStatus('failed');
      });
    return () => {
      active = false;
    };
  }, [startupAttempt]);

  useEffect(() => {
    void hydrateLastSellerLabel();
    void hydrateClipOnLens();
    void loadIntroState();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {fontsReady && startupStatus === 'ready' ? (
        <>
          <ThemeProvider value={AppNavigationTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: BrandColors.white },
                headerStyle: { backgroundColor: BrandColors.white },
              }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false, animation: 'fade', animationDuration: 280 }}
              />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, animation: 'fade', animationDuration: 280 }}
              />
              <Stack.Screen
                name="skin-tone"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="fabric-allergies"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="preferred-fabrics"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="weather"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="occasion"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="about"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="data"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="why-synthetics-shed"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="favorite-scans"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="deleted-scans"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="results"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: BrandColors.white },
                }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'fade',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
              <Stack.Screen
                name="user-preferences"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'fade',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </>
      ) : fontsReady && (startupStatus === 'failed' || startupStatus === 'retrying') ? (
        <>
          <StartupError
            retrying={startupStatus === 'retrying'}
            onRetry={() => {
              if (startupStatus !== 'failed') return;
              setStartupStatus('retrying');
              setStartupAttempt(startupAttempt + 1);
            }}
          />
          <StatusBar style="dark" />
        </>
      ) : null}

      {showSplashOverlay ? (
        <Animated.View
          pointerEvents={fontsReady && splashMinTimeElapsed && startupSettled ? 'none' : 'auto'}
          style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <AppSplash fontsLoaded={fontsLoaded} />
        </Animated.View>
      ) : null}

      <AlertHost />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
