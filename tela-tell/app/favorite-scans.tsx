import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showAlert } from '@/components/ui/alert-dialog';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanGalleryGrid } from '@/features/profile/components/scan-gallery-grid';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { RecentScanPreview } from '@/data/scans/mock-data';
import { getFavoriteScansPage, SCAN_PAGE_SIZE, setScanFavorite } from '@/db/scans';
import { ScanPager } from '@/features/history/components/scan-pager';
import { useScanPages } from '@/features/history/lib/use-scan-pages';

const fetchFavoritePage = (page: number) => getFavoriteScansPage({ page, pageSize: SCAN_PAGE_SIZE });

export default function FavoriteScansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    items: scans,
    totalPages,
    page,
    loading,
    error,
    goToPage,
    reload,
  } = useScanPages(fetchFavoritePage, 'favorites');
  const [busy, setBusy] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleLongPress = (scan: RecentScanPreview) => {
    setSelectionMode(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(scan.id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === scans.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(scans.map((scan) => scan.id)));
  };

  const handleUnfavorite = () => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) {
      return;
    }

    setBusy(true);
    void (async () => {
      try {
        await Promise.all(ids.map((id) => setScanFavorite(id, false)));
        exitSelectionMode();
        await reload();
      } catch {
        showAlert('Could not unfavorite', 'Please try again.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const headerTitle = selectionMode
    ? selectedIds.size > 0
      ? `${selectedIds.size} selected`
      : 'Select items'
    : 'Favorite scans';

  return (
    <View style={styles.root}>
      <ResultsScreenHeader
        title={headerTitle}
        onBack={selectionMode ? exitSelectionMode : () => router.back()}
        rightSlot={
          selectionMode && scans.length > 0 ? (
            <Pressable onPress={handleSelectAll} hitSlop={8} accessibilityRole="button">
              <Text style={styles.headerAction}>
                {selectedIds.size === scans.length ? 'None' : 'All'}
              </Text>
            </Pressable>
          ) : null
        }
      />

      {loading && scans.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={BrandColors.primary} />
        </View>
      ) : error && scans.length === 0 ? (
        <View style={styles.loading}>
          <Text style={styles.errorText}>Could not load your scans.</Text>
          <Pressable
            onPress={() => void reload()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Try loading scans again">
            <Text style={styles.headerAction}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScanGalleryGrid
          scans={scans}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onPressItem={handlePress}
          onLongPressItem={handleLongPress}
          showFavoriteBadge
          emptyTitle="No favorite scans yet"
          emptyMessage="Tap the bookmark on a scan result to save it here."
        />
      )}

      {totalPages > 1 ? (
        <ScanPager
          page={page}
          totalPages={totalPages}
          onPrev={() => goToPage(page - 1)}
          onNext={() => goToPage(page + 1)}
        />
      ) : null}

      {selectionMode && selectedIds.size > 0 ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Text style={styles.selectedLabel}>{selectedIds.size} selected</Text>
          <Pressable
            onPress={handleUnfavorite}
            disabled={busy}
            style={({ pressed }) => [styles.bottomButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Unfavorite selected">
            <Text style={styles.bottomButtonText}>Unfavorite</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  headerAction: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: BrandColors.primary,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.textMuted,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.borderLight,
  },
  selectedLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  bottomButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
  },
  bottomButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  pressed: {
    opacity: 0.88,
  },
});
