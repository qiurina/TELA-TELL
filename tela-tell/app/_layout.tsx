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
import 'react-native-reanimated';

import { AppSplash } from '@/components/splash/app-splash';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

const FADE_MS = 350;

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const splashOpacity = useState(() => new Animated.Value(1))[0];
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) {
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
  }, [fontsLoaded, splashOpacity]);

  return (
    <>
      {fontsLoaded ? (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="results" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
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
      ) : null}

      {showSplashOverlay ? (
        <Animated.View
          pointerEvents={fontsLoaded ? 'none' : 'auto'}
          style={[styles.splashOverlay, { opacity: splashOpacity }]}>
          <AppSplash fontsLoaded={fontsLoaded} />
        </Animated.View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
