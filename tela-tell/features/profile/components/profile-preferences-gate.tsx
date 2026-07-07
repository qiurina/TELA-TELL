import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/features/auth/context/auth-provider';
import { ProfileLockedNotice } from '@/features/profile/components/profile-locked-notice';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';

type ProfilePreferencesGateProps = {
  children: ReactNode;
};

export function ProfilePreferencesGate({ children }: ProfilePreferencesGateProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <>{children}</>;
  }

  return (
    <View style={styles.root}>
      <ProfileLockedNotice />
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={() => router.push('/login' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Log in">
          <Text style={styles.primaryText}>Log in</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() => router.push('/register' as Href)}
          accessibilityRole="button"
          accessibilityLabel="Register">
          <Text style={styles.secondaryText}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
  },
  primaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  secondaryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
});
