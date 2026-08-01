import { Redirect, Tabs, type Href } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { BrandColors } from '@/constants/brand';
import { useAuth } from '@/features/auth/context/auth-provider';

export default function TabLayout() {
  const { isLoading, isSignedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href={'/welcome' as Href} />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: styles.scene,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="fabrics" options={{ title: 'Fibers' }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', href: null }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: '/profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
  },
  scene: {
    backgroundColor: BrandColors.white,
  },
});