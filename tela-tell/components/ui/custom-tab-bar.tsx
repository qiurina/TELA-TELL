import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { History, Home, ScanLine } from '@/components/ui/lucide-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/brand';
import { fabShadow } from '@/constants/shadows';

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        <View style={styles.slot}>
          <Pressable
            style={styles.sideButton}
            onPress={() => navigation.navigate('index')}
            accessibilityRole="button"
            accessibilityLabel="Home">
            <Home
              size={26}
              color={currentRoute === 'index' ? BrandColors.primary : BrandColors.textMuted}
              fill={currentRoute === 'index' ? BrandColors.primary : 'transparent'}
              strokeWidth={2}
            />
          </Pressable>
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

        <View style={styles.slot}>
          <Pressable
            style={styles.sideButton}
            onPress={() => navigation.navigate('history')}
            accessibilityRole="button"
            accessibilityLabel="History">
            <History
              size={26}
              color={currentRoute === 'history' ? BrandColors.primary : BrandColors.textMuted}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0EDF8',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    minHeight: 56,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
    marginTop: -28,
  },
  sideButton: {
    width: 48,
    height: 48,
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
