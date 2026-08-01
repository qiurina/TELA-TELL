import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHistoryCard } from '@/features/history/components/scan-history-card';
import { ScanHistoryFilters } from '@/features/history/components/scan-history-filters';
import { filterScansByDate, type ScanDateFilter } from '@/features/history/lib/scan-date-filters';
import { Bookmark, Leaf, ScanLine, Trash2, TriangleAlert } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import { SUSTAINABILITY_DOT, type RecentScanPreview, type ScanResult } from '@/data/scans/mock-data';
import { deleteScan, getAllScans, getAllScanResults, setScanFavorite } from '@/db/scans';
import { useAuth } from '@/features/auth/context/auth-provider';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dateFilter, setDateFilter] = useState<ScanDateFilter>('all');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const { session } = useAuth();
  const [previews, setPreviews] = useState<RecentScanPreview[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  const reload = useCallback(async () => {
    const userId = session?.userId ?? null;
    const [previewList, resultList] = await Promise.all([
      getAllScans({ userId }),
      getAllScanResults({ userId }),
    ]);
    setPreviews(previewList);
    setScanResults(resultList);
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        const userId = session?.userId ?? null;
        const [previewList, resultList] = await Promise.all([
          getAllScans({ userId }),
          getAllScanResults({ userId }),
        ]);
        if (!active) {
          return;
        }
        setPreviews(previewList);
        setScanResults(resultList);
      })();

      return () => {
        active = false;
      };
    }, [session?.userId]),
  );

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const totalScans = scanResults.length;

  const mislabelingCount = useMemo(
    () => scanResults.filter((scan) => scan.mislabeling.detected).length,
    [scanResults],
  );

  const sustainableCount = useMemo(
    () =>
      scanResults.filter(
        (scan) =>
          scan.sustainability.rating === 'green' || scan.sustainability.rating === 'yellow',
      ).length,
    [scanResults],
  );

  const filteredScans = useMemo(
    () => filterScansByDate(previews, dateFilter, customDate),
    [previews, dateFilter, customDate],
  );

  const selectedScans = useMemo(
    () => filteredScans.filter((scan) => selectedIds.has(scan.id)),
    [filteredScans, selectedIds],
  );

  const allSelectedFavorited =
    selectedScans.length > 0 && selectedScans.every((scan) => Boolean(scan.isFavorite));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePress = (scan: RecentScanPreview) => {
    if (selectionMode) {
      toggleSelect(scan.id);
      return;
    }
    router.push(`/results/${scan.id}` as Href);
  };

  const handleLongPress = (scan: RecentScanPreview) => {
    setSelectionMode(true);
    setSelectedIds(new Set([scan.id]));
  };

  const handleFilterSelect = (filter: ScanDateFilter) => {
    exitSelectionMode();
    setDateFilter(filter);
  };

  const handleCustomDateChange = (date: Date | null) => {
    exitSelectionMode();
    setCustomDate(date);
  };

  const handleToggleFavorite = () => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) {
      return;
    }

    const nextFavorite = !allSelectedFavorited;
    setBusy(true);
    void (async () => {
      try {
        await Promise.all(ids.map((id) => setScanFavorite(id, nextFavorite)));
        exitSelectionMode();
        await reload();
      } catch {
        Alert.alert(
          nextFavorite ? 'Could not favorite' : 'Could not unfavorite',
          'Please try again.',
        );
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleDelete = () => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) {
      return;
    }

    const count = ids.length;
    Alert.alert(
      count === 1 ? 'Delete scan?' : `Delete ${count} scans?`,
      'They’ll move to Recently Deleted and can be restored within 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBusy(true);
            void (async () => {
              try {
                await Promise.all(ids.map((id) => deleteScan(id)));
                exitSelectionMode();
                await reload();
              } catch {
                Alert.alert('Could not delete', 'Please try again.');
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

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
            <Text style={styles.title}>
              {selectionMode
                ? selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : 'Select scans'
                : 'History'}
            </Text>
          </View>
          {selectionMode ? (
            <Pressable
              onPress={exitSelectionMode}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.sheetContent,
              selectionMode && selectedIds.size > 0 ? styles.sheetContentWithBar : null,
            ]}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, faintCardShadow()]}>
                <ScanLine size={18} color={BrandColors.primary} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValuePrimary]}>{totalScans}</Text>
                <Text style={styles.statLabel}>TOTAL SCANS</Text>
              </View>
              <View style={[styles.statCard, faintCardShadow()]}>
                <TriangleAlert size={18} color={SUSTAINABILITY_DOT.red} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValueAlert]}>{mislabelingCount}</Text>
                <Text style={styles.statLabel}>MISLABEL</Text>
              </View>
              <View style={[styles.statCard, faintCardShadow()]}>
                <Leaf size={18} color={SUSTAINABILITY_DOT.green} strokeWidth={2} />
                <Text style={[styles.statValue, styles.statValueSustainable]}>{sustainableCount}</Text>
                <Text style={styles.statLabel}>SUSTAINABLE</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>ALL SCANS</Text>

            <ScanHistoryFilters
              selected={dateFilter}
              customDate={customDate}
              onSelect={handleFilterSelect}
              onCustomDateChange={handleCustomDateChange}
            />

            <View style={styles.list}>
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <ScanHistoryCard
                    key={scan.id}
                    scan={scan}
                    selectionMode={selectionMode}
                    selected={selectedIds.has(scan.id)}
                    onPress={() => handlePress(scan)}
                    onLongPress={() => handleLongPress(scan)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No scans yet. Analyze a fabric to start your history.
                </Text>
              )}
            </View>
          </ScrollView>

          {selectionMode && selectedIds.size > 0 ? (
            <View style={styles.actionBar}>
              <Pressable
                onPress={handleToggleFavorite}
                disabled={busy}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.favoriteButton,
                  pressed && styles.actionPressed,
                  busy && styles.actionDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={allSelectedFavorited ? 'Unfavorite selected' : 'Favorite selected'}>
                <Bookmark
                  size={18}
                  color={allSelectedFavorited ? '#EAB308' : BrandColors.primaryDark}
                  fill={allSelectedFavorited ? '#EAB308' : 'transparent'}
                  strokeWidth={2.25}
                />
                <Text style={styles.favoriteButtonText}>
                  {allSelectedFavorited ? 'Unfavorite' : 'Favorite'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                disabled={busy}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.actionPressed,
                  busy && styles.actionDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Delete selected">
                <Trash2 size={18} color="#DC2626" strokeWidth={2.25} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
    minHeight: 28,
  },
  headerText: {
    gap: 2,
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: BrandColors.white,
    letterSpacing: -0.3,
  },
  cancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.white,
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
  sheetContentWithBar: {
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: BrandColors.white,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 26,
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
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: BrandColors.textMuted,
    marginBottom: 12,
  },
  list: {
    gap: 10,
    marginTop: 12,
    paddingTop: 8,
    overflow: 'visible',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: BrandColors.white,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  favoriteButton: {
    backgroundColor: BrandColors.lavender,
    borderColor: BrandColors.border,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  favoriteButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primaryDark,
  },
  deleteButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#DC2626',
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionDisabled: {
    opacity: 0.55,
  },
});
