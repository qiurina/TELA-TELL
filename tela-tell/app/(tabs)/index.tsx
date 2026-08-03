import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHistoryCard } from '@/features/history/components/scan-history-card';
import { ScanLine } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { heroCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { type RecentScanPreview } from '@/data/scans/mock-data';
import { getRecentScans } from '@/db/scans';
import { useAuth } from '@/features/auth/context/auth-provider';
import { useCallback, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { session } = useAuth();
  const [recentScans, setRecentScans] = useState<RecentScanPreview[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const list = await getRecentScans(5, { userId: session?.userId ?? null });
        if (!active) return;
        setRecentScans(list);
      })();
      return () => {
        active = false;
      };
    }, [session?.userId]),
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BrandColors.gradientStart, BrandColors.primary, BrandColors.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.page, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>Tela-Tell</Text>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={[styles.heroCard, heroCardShadow()]}>
              <View style={styles.heroContent}>
                <View style={styles.heroLeft}>
                  <Text style={styles.heroTitle}>Know what you are buying</Text>
                  <Text style={styles.heroTagline}>Scan it. Know it. Buy Right.</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.scanButtonWrap,
                      pressed && styles.scanButtonPressed,
                    ]}
                    onPress={() => router.push('/scan')}>
                    <LinearGradient
                      colors={[BrandColors.primaryLight, BrandColors.primary, BrandColors.primaryDark]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={[styles.scanButton, primaryButtonShadow()]}>
                      <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
                      <Text style={styles.scanButtonText} numberOfLines={1}>
                        Scan Now
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
                <Image
                  source={require('@/assets/images/clothes.svg')}
                  style={styles.heroImage}
                  contentFit="contain"
                />
              </View>
            </View>

            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Scans</Text>
              <Pressable onPress={() => router.push('/history')} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.recentList}>
              {recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <ScanHistoryCard
                    key={scan.id}
                    scan={scan}
                    onPress={() => router.push(`/results/${scan.id}` as Href)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No recent scans yet.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  brand: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  sheet: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  heroCard: {
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroLeft: {
    flex: 1,
    minWidth: 0,
    gap: 10,
    paddingRight: 4,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.primaryDark,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  heroTagline: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.textMuted,
  },
  heroImage: {
    width: '36%',
    maxWidth: 130,
    minWidth: 88,
    aspectRatio: 130 / 150,
    flexShrink: 0,
  },
  scanButtonWrap: {
    width: '100%',
    marginTop: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  scanButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scanButtonText: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    color: BrandColors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
  },
  recentTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
  },
  seeAll: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
  },
  recentList: {
    gap: 10,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
});
