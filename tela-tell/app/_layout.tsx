import '@/lib/dev-console';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppSplash } from '@/components/splash/app-splash';
import { migrateDatabase } from '@/db/migrate';
import { AuthProvider } from '@/features/auth/context/auth-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

const SPLASH_MIN_MS = 2500;
const FADE_MS = 400;

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
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
    if (!fontsLoaded || !splashMinTimeElapsed) {
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
  }, [fontsLoaded, splashMinTimeElapsed, splashOpacity]);

  useEffect(() => {
    void migrateDatabase().catch((error: unknown) => {
      console.warn('[TELA-TELL] SQLite migration failed:', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {fontsLoaded ? (
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="welcome"
                options={{ headerShown: false, animation: 'fade', animationDuration: 280 }}
              />
              <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, animation: 'fade', animationDuration: 280 }}
              />
              <Stack.Screen name="results" options={{ headerShown: false }} />
              <Stack.Screen name="region-select" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
              <Stack.Screen
                name="user-preferences"
                options={{
                  headerShown: false,
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      ) : null}

      {showSplashOverlay ? (
        <Animated.View
          pointerEvents={fontsLoaded && splashMinTimeElapsed ? 'none' : 'auto'}
          style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <AppSplash fontsLoaded={fontsLoaded} />
        </Animated.View>
      ) : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
