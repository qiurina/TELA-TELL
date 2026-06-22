import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHistoryCard } from '@/components/history/scan-history-card';
import { ScanLine, Settings } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { heroCardShadow, primaryButtonShadow } from '@/constants/shadows';
import { RECENT_SCANS_PREVIEW } from '@/constants/mock-data';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <View style={styles.headerText}>
            <Text style={styles.brand}>Tela-Tell</Text>
            <Text style={styles.tagline}>Scan it. Know it. Buy Right.</Text>
          </View>
          <Pressable style={styles.settingsButton} hitSlop={8}>
            <Settings size={22} color={BrandColors.white} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={[styles.heroCard, heroCardShadow()]}>
              <View style={styles.heroTop}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroTitle}>Know what you are buying</Text>
                  <Text style={styles.heroDescription}>
                    Scan fabric with the camera, and get sustainable purchasing guidance — all from
                    your phone.
                  </Text>
                </View>
                <Image
                  source={require('@/assets/images/Fabric.svg')}
                  style={styles.fabricImage}
                  contentFit="contain"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.scanButton,
                  primaryButtonShadow(),
                  pressed && styles.scanButtonPressed,
                ]}
                onPress={() => router.push('/scan')}>
                <ScanLine size={18} color={BrandColors.white} strokeWidth={2.5} />
                <Text style={styles.scanButtonText}>Start Fabric Scan</Text>
              </Pressable>
            </View>

            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Scans</Text>
              <Pressable onPress={() => router.push('/history')} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.recentList}>
              {RECENT_SCANS_PREVIEW.map((scan) => (
                <ScanHistoryCard
                  key={scan.id}
                  scan={scan}
                  onPress={() => router.push(`/results/${scan.id}` as Href)}
                />
              ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerText: {
    gap: 2,
  },
  brand: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  tagline: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    gap: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTextBlock: {
    flex: 1,
    gap: 10,
    paddingRight: 4,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: BrandColors.text,
    lineHeight: 24,
  },
  heroDescription: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
  },
  fabricImage: {
    width: 100,
    height: 72,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 999,
  },
  scanButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scanButtonText: {
    fontFamily: Fonts.semiBold,
    color: BrandColors.white,
    fontSize: 15,
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
    gap: 12,
  },
});
