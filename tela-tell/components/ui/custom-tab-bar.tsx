import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { History as HistoryIcon, Home, Layers, ScanLine, User } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { fabShadow } from '@/constants/shadows';

type TabRoute = 'index' | 'fabrics' | 'scan' | 'history' | 'profile';

function TabIconButton({
  route,
  currentRoute,
  onPress,
  label,
  children,
}: {
  route: TabRoute;
  currentRoute: string | undefined;
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  const active = currentRoute === route;

  return (
    <Pressable
      style={styles.sideButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}>
      {children}
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name;

  // Immersive Scan: hide tabs; Scan screen provides a back chevron.
  // Nested profile screens are root-stack routes, so the tab bar stays under them.
  if (currentRoute === 'scan') {
    return <View style={styles.hiddenStub} pointerEvents="none" />;
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        <View style={styles.sideGroup}>
          <TabIconButton
            route="index"
            currentRoute={currentRoute}
            onPress={() => navigation.navigate('index')}
            label="Home">
            <Home
              size={24}
              color={currentRoute === 'index' ? BrandColors.primary : BrandColors.textMuted}
              fill={currentRoute === 'index' ? BrandColors.primary : 'transparent'}
              strokeWidth={2}
            />
          </TabIconButton>
          <TabIconButton
            route="fabrics"
            currentRoute={currentRoute}
            onPress={() => navigation.navigate('fabrics')}
            label="Fibers">
            <Layers
              size={24}
              color={currentRoute === 'fabrics' ? BrandColors.primary : BrandColors.textMuted}
              strokeWidth={2}
            />
          </TabIconButton>
        </View>

        <View style={styles.centerSlot}>
          <Pressable
            onPress={() => navigation.navigate('scan')}
            accessibilityRole="button"
            accessibilityLabel="Scan fabric">
            <LinearGradient
              colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
              style={[styles.fab, fabShadow()]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <ScanLine size={28} color={BrandColors.white} strokeWidth={2.5} />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.sideGroup}>
          <TabIconButton
            route="history"
            currentRoute={currentRoute}
            onPress={() => navigation.navigate('history')}
            label="History">
            <HistoryIcon
              size={24}
              color={currentRoute === 'history' ? BrandColors.primary : BrandColors.textMuted}
              strokeWidth={2}
            />
          </TabIconButton>
          <TabIconButton
            route="profile"
            currentRoute={currentRoute}
            onPress={() =>
              navigation.navigate('profile', {
                screen: 'index',
              })
            }
            label="Profile">
            <User
              size={24}
              color={currentRoute === 'profile' ? BrandColors.primary : BrandColors.textMuted}
              strokeWidth={2}
            />
          </TabIconButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenStub: {
    height: 0,
    overflow: 'hidden',
    backgroundColor: BrandColors.white,
  },
  wrapper: {
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    minHeight: 56,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  centerSlot: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
    marginTop: -28,
  },
  sideButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
