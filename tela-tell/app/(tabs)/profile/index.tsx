import { Redirect, useFocusEffect, type Href } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/context/auth-provider';
import { ProfileScreenShell } from '@/features/profile/components/profile-screen-shell';
import { ProfileSignedInView } from '@/features/profile/components/profile-signed-in-view';
import { hydrateUserPreferences } from '@/features/profile/lib/user-preferences';
import { BrandColors } from '@/constants/brand';

export default function ProfileHubScreen() {
  const { isLoading, isSignedIn, session } = useAuth();

  useFocusEffect(
    useCallback(() => {
      void hydrateUserPreferences(session?.userId ?? null);
    }, [session?.userId]),
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href={'/login' as Href} />;
  }

  return (
    <ProfileScreenShell title="Profile">
      <ProfileSignedInView />
    </ProfileScreenShell>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
  },
});
