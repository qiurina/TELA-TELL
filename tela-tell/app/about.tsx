import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { Leaf, ScanLine, Shield } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, heroCardShadow } from '@/constants/shadows';

const heroGradient = [BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark] as const;

function AboutSection({
  icon,
  iconBackground,
  title,
  body,
}: {
  icon: ReactNode;
  iconBackground: string;
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.card, faintCardShadow()]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>{icon}</View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ProfileScreenShell title="About TELA-TELL" showBack>
      <View style={styles.hero}>
        <LinearGradient
          colors={[...heroGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroBadge, heroCardShadow()]}>
          <ScanLine size={30} color={BrandColors.white} strokeWidth={2} />
        </LinearGradient>
        <Text style={styles.heroTitle}>TELA-TELL</Text>
        <Text style={styles.heroTagline}>Know your fabric before you buy it</Text>
      </View>

      <AboutSection
        icon={<ScanLine size={20} color={BrandColors.primaryDark} strokeWidth={2} />}
        iconBackground={BrandColors.lavenderCard}
        title="What it does"
        body="TELA-TELL helps you check what a fabric is really made of before you buy it. It's especially handy for thrifted and secondhand finds."
      />
      <AboutSection
        icon={<Leaf size={20} color="#16a34a" strokeWidth={2} />}
        iconBackground="#f0fdf4"
        title="How it works"
        body="Take a photo of the fabric with your camera, or upload one you already have. We'll compare it to common fabric types and show you eco-friendly tips and any mismatched labels."
      />
      <AboutSection
        icon={<Shield size={20} color="#2563eb" strokeWidth={2} />}
        iconBackground="#eff6ff"
        title="Good to know"
        body="For the best results, get your camera close enough to clearly see the fabric's threads. Your scans and settings are saved right on your phone, so you don't need an internet account to use the app."
      />

      <Text style={styles.version}>Version {version}</Text>
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 4,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.primaryDark,
    letterSpacing: 0.5,
  },
  heroTagline: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primaryDark,
  },
  cardBody: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.text,
  },
  version: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: BrandColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
