import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';

import { SplashLogo } from '@/constants/assets';
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
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image source={SplashLogo} style={styles.icon} resizeMode="contain" accessibilityLabel="" />
          <Text style={[styles.title, fontsLoaded && styles.titleFont]}>TELA-TELL</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: BrandColors.primaryDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 52,
    height: 52,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: BrandColors.white,
    letterSpacing: 1.2,
  },
  titleFont: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
});
