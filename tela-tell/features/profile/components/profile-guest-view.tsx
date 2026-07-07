import { useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Info, ScanLine, User } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { ProfileSectionLabel } from '@/features/profile/components/profile-section-label';
import {
  ProfileGroupedCard,
  ProfilePreferenceRow,
} from '@/features/profile/components/profile-preference-row';
import { ProfileLockedNotice } from '@/features/profile/components/profile-locked-notice';

const PROFILE_SCAN_SETTINGS_HREF = '/(tabs)/profile/scan-settings' as Href;

export function ProfileGuestView() {
  const router = useRouter();

  return (
    <>
      <View style={styles.identity}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <User size={32} color={BrandColors.textMuted} strokeWidth={1.75} />
          </View>
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.subtitle}>No account connected</Text>
      </View>

      <View style={[styles.ctaCard, faintCardShadow()]}>
        <Text style={styles.ctaText}>
          Create an account to save your preferences and scan history
        </Text>
        <View style={styles.ctaActions}>
          <Pressable
            style={({ pressed }) => [styles.registerWrap, pressed && styles.pressed]}
            onPress={() => router.push('/register' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Register">
            <LinearGradient
              colors={[BrandColors.primaryLight, BrandColors.primary, BrandColors.primaryDark]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.registerButton, primaryButtonShadow()]}>
              <Text style={styles.registerText}>Register</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            onPress={() => router.push('/login' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Log in">
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel title="Preferences" />
        <ProfileLockedNotice />
        <View style={styles.scanRowWrap}>
          <ProfileGroupedCard>
            <ProfilePreferenceRow
              title="Scan settings"
              icon={<ScanLine size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
              onPress={() => router.push(PROFILE_SCAN_SETTINGS_HREF)}
              isLast
            />
          </ProfileGroupedCard>
        </View>
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel title="App settings" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="About TELA-TELL"
            icon={<Info size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => router.push('/(tabs)/profile/about' as Href)}
            isLast
          />
        </ProfileGroupedCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavender,
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  ctaCard: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 14,
    marginBottom: 8,
  },
  ctaText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: BrandColors.primaryDark,
    textAlign: 'center',
  },
  ctaActions: {
    flexDirection: 'row',
    gap: 10,
  },
  registerWrap: {
    flex: 1,
  },
  registerButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  loginButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  loginText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  section: {
    marginTop: 8,
  },
  scanRowWrap: {
    marginTop: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});
