import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FabricDistributionCard } from '@/features/history/components/fabric-distribution-card';
import { ScanHistoryCard } from '@/features/history/components/scan-history-card';
import { ScanHistoryFilters } from '@/features/history/components/scan-history-filters';
import { getFabricDistribution } from '@/features/history/lib/fabric-distribution';
import { filterScansByDate, type ScanDateFilter } from '@/features/history/lib/scan-date-filters';
import { Leaf, ScanLine, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { RECENT_SCANS_PREVIEW, SCAN_RESULTS, SUSTAINABILITY_DOT } from '@/data/scans/mock-data';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dateFilter, setDateFilter] = useState<ScanDateFilter>('all');
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const filteredScans = useMemo(
    () => filterScansByDate(RECENT_SCANS_PREVIEW, dateFilter, customDate),
    [dateFilter, customDate],
  );

  const fabricDistribution = useMemo(() => getFabricDistribution(SCAN_RESULTS), []);

  const totalScans = SCAN_RESULTS.length;
  const mislabelingCount = SCAN_RESULTS.filter((scan) => scan.mislabeling.detected).length;
  const sustainableCount = SCAN_RESULTS.filter(
    (scan) => scan.sustainability.rating === 'green' || scan.sustainability.rating === 'yellow',
  ).length;

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
          </View>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, faintCardShadow()]}>
                <ScanLine size={20} color={BrandColors.primary} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValuePrimary]}>{totalScans}</Text>
                <Text style={styles.statLabel}>TOTAL SCANS</Text>
              </View>
              <View style={[styles.statCard, faintCardShadow()]}>
                <TriangleAlert size={20} color={SUSTAINABILITY_DOT.red} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValueAlert]}>{mislabelingCount}</Text>
                <Text style={styles.statLabel}>MISLABEL ALERTS</Text>
              </View>
              <View style={[styles.statCard, faintCardShadow()]}>
                <Leaf size={20} color={SUSTAINABILITY_DOT.green} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValueSustainable]}>{sustainableCount}</Text>
                <Text style={styles.statLabel}>SUSTAINABLE</Text>
              </View>
            </View>

            <FabricDistributionCard distribution={fabricDistribution} />

            <Text style={styles.sectionLabel}>ALL SCANS</Text>

            <ScanHistoryFilters
              selected={dateFilter}
              customDate={customDate}
              onSelect={setDateFilter}
              onCustomDateChange={setCustomDate}
            />

            <View style={styles.list}>
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <ScanHistoryCard
                    key={scan.id}
                    scan={scan}
                    onPress={() => router.push(`/results/${scan.id}` as Href)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No scans found for this date range.</Text>
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
    height: 220,
  },
  page: {
    flex: 1,
  },
  topRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 24,
  },
  statValuePrimary: {
    color: BrandColors.primary,
  },
  statValueAlert: {
    color: SUSTAINABILITY_DOT.red,
  },
  statValueSustainable: {
    color: SUSTAINABILITY_DOT.green,
  },
  statLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    marginBottom: 12,
  },
  list: {
    gap: 12,
    marginTop: 12,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
