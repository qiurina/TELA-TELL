import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

const HERO_IMAGE = require('@/assets/images/clothes.svg');

type AuthWelcomeLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthWelcomeLayout({
  children,
  title = 'Welcome to Tela-Tell',
  subtitle = 'Scan it. Know it. Buy Right.',
}: AuthWelcomeLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.welcomeGradientTop, BrandColors.welcomeGradientBottom]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 },
        ]}>
        <View style={styles.heroBlock}>
          <Image source={HERO_IMAGE} style={styles.heroImage} contentFit="contain" />

          <View style={styles.copyBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.actions}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  heroBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingBottom: 16,
  },
  heroImage: {
    width: 220,
    height: 200,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    maxWidth: 300,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 34,
    color: BrandColors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
  },
});
