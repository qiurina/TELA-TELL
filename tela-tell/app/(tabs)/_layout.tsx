import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { BrandColors } from '@/constants/brand';

export default function TabLayout() {
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
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: BrandColors.white,
  },
});