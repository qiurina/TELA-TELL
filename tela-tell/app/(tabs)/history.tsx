import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHistoryCard } from '@/components/history/scan-history-card';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { RECENT_SCANS_PREVIEW, SCAN_RESULTS } from '@/constants/mock-data';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const totalScans = SCAN_RESULTS.length;
  const mislabelingCount = SCAN_RESULTS.filter((scan) => scan.mislabeling.detected).length;

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
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>Your past fabric scans</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={[styles.statsCard, faintCardShadow()]}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalScans}</Text>
                <Text style={styles.statLabel}>TOTAL SCANS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mislabelingCount}</Text>
                <Text style={styles.statLabel}>MISLABEL ALERTS</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>ALL SCANS</Text>

            <View style={styles.list}>
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
    height: 220,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
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
    paddingBottom: 32,
    flexGrow: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: BrandColors.lavenderCard,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0DBF0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: BrandColors.primary,
  },
  statLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0DBF0',
    marginVertical: 4,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    marginBottom: 14,
  },
  list: {
    gap: 12,
  },
});
