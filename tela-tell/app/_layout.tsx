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
import { AlertHost } from '@/components/ui/alert-dialog';
import { BrandColors } from '@/constants/brand';
import { migrateDatabase } from '@/db/migrate';
import { loadIntroState } from '@/features/onboarding/lib/intro-state';
import { hydrateUserPreferences } from '@/features/profile/lib/user-preferences';
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
  const [databaseReady, setDatabaseReady] = useState(false);
  const splashOpacity = useState(() => new Animated.Value(1))[0];
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const timer = setTimeout(() => setSplashMinTimeElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    requestAnimationFrame(() => {
      void SplashScreen.hideAsync();
    });
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || !splashMinTimeElapsed || !databaseReady) {
      return;
    }

    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowSplashOverlay(false);
      }
    });
  }, [fontsLoaded, splashMinTimeElapsed, databaseReady, splashOpacity]);

  // Screens read SQLite as soon as they mount, so nothing renders until the migration has settled.
  useEffect(() => {
    void migrateDatabase()
      .then(() => hydrateUserPreferences())
      .catch((error: unknown) => {
        console.warn('[TELA-TELL] SQLite migration failed:', error);
      })
      .finally(() => setDatabaseReady(true));
    void hydrateLastSellerLabel();
    void loadIntroState();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {fontsLoaded && databaseReady ? (
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
      ) : null}

      {showSplashOverlay ? (
        <Animated.View
          pointerEvents={fontsLoaded && splashMinTimeElapsed && databaseReady ? 'none' : 'auto'}
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
