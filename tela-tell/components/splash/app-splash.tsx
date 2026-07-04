import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const SPLASH_ICON = require('@/assets/images/appiconv2.png');

type AppSplashProps = {
  fontsLoaded?: boolean;
};

export function AppSplash({ fontsLoaded = true }: AppSplashProps) {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={[BrandColors.splashGradientTop, BrandColors.splashGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.content}>
        <Image source={SPLASH_ICON} style={styles.icon} contentFit="contain" />
        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Tela-Tell</Text>
        <Text style={[styles.tagline, fontsLoaded && styles.taglineFont]}>
          Scan it. Know it. Buy Right.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.splashTitle,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  titleFont: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  taglineFont: {
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
});
