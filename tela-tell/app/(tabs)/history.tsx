import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ScanHistoryCard } from '@/features/history/components/scan-history-card';
import { ScanHistoryFilters } from '@/features/history/components/scan-history-filters';
import { ScanPager } from '@/features/history/components/scan-pager';
import { getScanDateRange, type ScanDateFilter } from '@/features/history/lib/scan-date-filters';
import { useScanPages } from '@/features/history/lib/use-scan-pages';
import {
  Bookmark,
  ScanLine,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import type { RecentScanPreview } from '@/data/scans/mock-data';
import {
  deleteScan,
  getScansPage,
  getScanStats,
  SCAN_PAGE_SIZE,
  setScanFavorite,
  type ScanStats,
} from '@/db/scans';

const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_STATS: ScanStats = { total: 0, mislabeled: 0 };
const ALERT_RED = '#dc2626';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<RecentScanPreview>>(null);
  const [dateFilter, setDateFilter] = useState<ScanDateFilter>('all');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  // id -> isFavorite, so the Favorite/Unfavorite action still works for selections made on other pages.
  const [selected, setSelected] = useState<Map<string, boolean>>(new Map());
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState<ScanStats>(EMPTY_STATS);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const fetchPage = useCallback(
    (targetPage: number) =>
      getScansPage({
        page: targetPage,
        pageSize: SCAN_PAGE_SIZE,
        search,
        dateRange: getScanDateRange(dateFilter, customDate),
      }),
    [search, dateFilter, customDate],
  );
  const resetKey = `${dateFilter}|${customDate?.getTime() ?? ''}|${search}`;
  const { items, totalPages, page, loading, error, goToPage, reload } = useScanPages(
    fetchPage,
    resetKey,
  );

  const loadStats = useCallback(async () => {
    try {
      setStats(await getScanStats());
    } catch (statsError) {
      console.error('[TELA-TELL] Failed to load scan stats:', statsError);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const refresh = useCallback(async () => {
    await Promise.all([reload(), loadStats()]);
  }, [reload, loadStats]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelected(new Map());
  }, []);

  const isFiltered = search !== '' || dateFilter !== 'all';
  const allSelectedFavorited = selected.size > 0 && [...selected.values()].every(Boolean);

  const changePage = useCallback(
    (nextPage: number) => {
      goToPage(nextPage);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [goToPage],
  );

  const toggleSelect = (scan: RecentScanPreview) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(scan.id)) {
        next.delete(scan.id);
      } else {
        next.set(scan.id, Boolean(scan.isFavorite));
      }
      return next;
    });
  };

  const handlePress = (scan: RecentScanPreview) => {
    if (selectionMode) {
      toggleSelect(scan);
      return;
    }
    router.push(`/results/${scan.id}` as Href);
  };

  const handleLongPress = (scan: RecentScanPreview) => {
    setSelectionMode(true);
    setSelected(new Map([[scan.id, Boolean(scan.isFavorite)]]));
  };

  const handleFilterSelect = (filter: ScanDateFilter) => {
    exitSelectionMode();
    setDateFilter(filter);
  };

  const handleCustomDateChange = (date: Date | null) => {
    exitSelectionMode();
    setCustomDate(date);
  };

  const handleSearchChange = (text: string) => {
    if (selectionMode) {
      exitSelectionMode();
    }
    setSearchInput(text);
  };

  const handleToggleFavorite = () => {
    const ids = [...selected.keys()];
    if (ids.length === 0 || busy) {
      return;
    }

    const nextFavorite = !allSelectedFavorited;
    setBusy(true);
    void (async () => {
      try {
        await Promise.all(ids.map((id) => setScanFavorite(id, nextFavorite)));
        exitSelectionMode();
        await refresh();
      } catch {
        showAlert(
          nextFavorite ? 'Could not favorite' : 'Could not unfavorite',
          'Please try again.',
        );
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleDelete = () => {
    if (selected.size === 0 || busy) {
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    const ids = [...selected.keys()];
    setShowDeleteConfirm(false);
    if (ids.length === 0) {
      return;
    }

    setBusy(true);
    void (async () => {
      try {
        await Promise.all(ids.map((id) => deleteScan(id)));
        exitSelectionMode();
        await refresh();
      } catch {
        showAlert('Could not delete', 'Please try again.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const listHeader = (
      <View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, faintCardShadow()]}>
            <ScanLine size={18} color={BrandColors.primary} strokeWidth={2} />
            <Text style={[styles.statValue, styles.statValuePrimary]}>{stats.total}</Text>
            <Text style={styles.statLabel}>TOTAL SCANS</Text>
          </View>
          <View style={[styles.statCard, faintCardShadow()]}>
            <TriangleAlert size={18} color={ALERT_RED} strokeWidth={2} />
            <Text style={[styles.statValue, styles.statValueAlert]}>{stats.mislabeled}</Text>
            <Text style={styles.statLabel}>MISLABEL</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ALL SCANS</Text>

        <View style={styles.searchBox}>
          <Search size={16} color={BrandColors.textMuted} strokeWidth={2} />
          <TextInput
            value={searchInput}
            onChangeText={handleSearchChange}
            placeholder="Search fabric or seller"
            placeholderTextColor={BrandColors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search scans by fabric or seller"
          />
          {searchInput.length > 0 ? (
            <Pressable
              onPress={() => handleSearchChange('')}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search">
              <X size={16} color={BrandColors.textMuted} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>

        <ScanHistoryFilters
          selected={dateFilter}
          customDate={customDate}
          onSelect={handleFilterSelect}
          onCustomDateChange={handleCustomDateChange}
        />
      </View>
  );

  return (
    <View style={styles.root}>
      <ConfirmDialog
        visible={showDeleteConfirm}
        title={selected.size === 1 ? 'Delete scan?' : `Delete ${selected.size} scans?`}
        message="They’ll move to Recently Deleted and can be restored within 30 days."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

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
                ? selected.size > 0
                  ? `${selected.size} selected`
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
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.sheetContent,
              selectionMode && selected.size > 0 ? styles.sheetContentWithBar : null,
              totalPages > 1 ? styles.sheetContentWithPager : null,
            ]}
            ListHeaderComponent={listHeader}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item: scan }) => (
              <ScanHistoryCard
                scan={scan}
                selectionMode={selectionMode}
                selected={selected.has(scan.id)}
                onPress={() => handlePress(scan)}
                onLongPress={() => handleLongPress(scan)}
              />
            )}
            ListEmptyComponent={
              loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={BrandColors.primary} />
                </View>
              ) : error ? null : (
                <Text style={styles.emptyText}>
                  {isFiltered
                    ? 'No scans match your search or filter.'
                    : 'No scans yet. Analyze a fabric to start your history.'}
                </Text>
              )
            }
            ListFooterComponent={
              error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>Could not load your scans.</Text>
                  <Pressable
                    onPress={() => void reload()}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Try loading scans again">
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                </View>
              ) : null
            }
            initialNumToRender={SCAN_PAGE_SIZE}
            windowSize={7}
            maxToRenderPerBatch={SCAN_PAGE_SIZE}
            removeClippedSubviews
          />

          {totalPages > 1 ? (
            <ScanPager
              page={page}
              totalPages={totalPages}
              onPrev={() => changePage(page - 1)}
              onNext={() => changePage(page + 1)}
            />
          ) : null}

          {selectionMode && selected.size > 0 ? (
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
  sheetContentWithPager: {
    paddingBottom: 16,
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
    color: ALERT_RED,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: BrandColors.white,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: BrandColors.text,
  },
  separator: {
    height: 12,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: BrandColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
    marginTop: 12,
  },
  errorBox: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.primary,
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
