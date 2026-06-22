import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type AppSplashProps = {
  fontsLoaded?: boolean;
};

export function AppSplash({ fontsLoaded = true }: AppSplashProps) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[BrandColors.splashGradientTop, BrandColors.splashGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.content}>
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
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: BrandColors.white,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  titleFont: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
  tagline: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  taglineFont: {
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
});
