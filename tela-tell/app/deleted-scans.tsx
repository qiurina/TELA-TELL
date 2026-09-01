import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ResultsScreenHeader } from '@/features/results/components/results-screen-header';
import { ScanGalleryGrid } from '@/features/profile/components/scan-gallery-grid';
import { useAuth } from '@/features/auth/context/auth-provider';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import type { RecentScanPreview } from '@/data/scans/mock-data';
import {
  getDeletedScans,
  permanentlyDeleteAllDeletedScans,
  permanentlyDeleteScans,
  restoreScans,
} from '@/db/scans';

const DELETE_RED = '#DC2626';

export default function DeletedScansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [scans, setScans] = useState<RecentScanPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getDeletedScans({ userId: session?.userId ?? null });
      setScans(next);
      setSelectedIds((prev) => {
        const valid = new Set([...prev].filter((id) => next.some((scan) => scan.id === id)));
        return valid;
      });
    } finally {
      setLoading(false);
    }
  }, [session?.userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
    }
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

  const handleRestore = () => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) {
      return;
    }

    setBusy(true);
    void (async () => {
      try {
        await restoreScans(ids);
        exitSelectionMode();
        await load();
      } catch {
        showAlert('Could not restore', 'Please try again.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleDeleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length === 0 || busy) {
      return;
    }

    setConfirmDeleteSelected(false);
    setBusy(true);
    void (async () => {
      try {
        await permanentlyDeleteScans(ids);
        exitSelectionMode();
        await load();
      } catch {
        showAlert('Could not delete', 'Please try again.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleDeleteAll = () => {
    if (scans.length === 0 || busy) {
      return;
    }

    setConfirmDeleteAll(false);
    setBusy(true);
    void (async () => {
      try {
        await permanentlyDeleteAllDeletedScans({ userId: session?.userId ?? null });
        exitSelectionMode();
        await load();
      } catch {
        showAlert('Could not delete', 'Please try again.');
      } finally {
        setBusy(false);
      }
    })();
  };

  const headerTitle = selectionMode
    ? selectedIds.size > 0
      ? `${selectedIds.size} selected`
      : 'Select items'
    : 'Recently deleted';

  return (
    <View style={styles.root}>
      <ConfirmDialog
        visible={confirmDeleteSelected}
        title="Delete forever?"
        message={`Permanently delete ${selectedIds.size} scan${selectedIds.size === 1 ? '' : 's'}? This can’t be undone.`}
        confirmLabel="Delete forever"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteSelected}
        onCancel={() => setConfirmDeleteSelected(false)}
      />

      <ConfirmDialog
        visible={confirmDeleteAll}
        title="Delete all forever?"
        message="Permanently delete every scan in Recently Deleted? This can’t be undone."
        confirmLabel="Delete all"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
      />

      <ResultsScreenHeader
        title={headerTitle}
        onBack={selectionMode ? exitSelectionMode : () => router.back()}
        rightSlot={
          scans.length > 0 ? (
            selectionMode ? (
              <Pressable onPress={handleSelectAll} hitSlop={8} accessibilityRole="button">
                <Text style={styles.headerAction}>
                  {selectedIds.size === scans.length ? 'None' : 'All'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setConfirmDeleteAll(true)}
                hitSlop={8}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="Delete all">
                <Text style={styles.deleteAll}>Delete all</Text>
              </Pressable>
            )
          ) : null
        }
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={BrandColors.primary} />
        </View>
      ) : (
        <ScanGalleryGrid
          scans={scans}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onPressItem={handlePress}
          onLongPressItem={handleLongPress}
          showDaysRemaining
          emptyTitle="Trash is empty"
          emptyMessage="Deleted scans stay here for 30 days, then they’re removed automatically."
        />
      )}

      {selectionMode && selectedIds.size > 0 ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable
            style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
            onPress={handleRestore}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Restore selected">
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            onPress={() => setConfirmDeleteSelected(true)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Delete selected forever">
            <Text style={styles.deleteText}>Delete</Text>
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
  deleteAll: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: DELETE_RED,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.borderLight,
  },
  restoreButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
  },
  restoreText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: BrandColors.white,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: DELETE_RED,
  },
  pressed: {
    opacity: 0.88,
  },
});
