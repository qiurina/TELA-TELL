import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { showAlert } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { InfoSheet } from '@/components/ui/info-sheet';
import { Database, Download, Share2, Sparkles, Trash2 } from '@/components/ui/lucide-icons';
import { BrandColors } from '@/constants/brand';
import { Fonts } from '@/constants/fonts';
import { faintCardShadow } from '@/constants/shadows';
import {
  deleteAllScans,
  getDeletedScanCount,
  getScanPhotoUris,
  getScanStats,
  permanentlyDeleteAllDeletedScans,
} from '@/db/scans';
import { ProfileSectionLabel } from '@/features/profile/components/profile-section-label';
import {
  ProfileGroupedCard,
  ProfilePreferenceRow,
} from '@/features/profile/components/profile-preference-row';
import {
  exportUserData,
  importScans,
  pickAndParseExportFile,
} from '@/features/profile/lib/data-export';
import { ImportScansError, importSummary, type ImportReport } from '@/features/profile/lib/import-report';
import {
  clearTemporaryFiles,
  formatBytes,
  getFilesSize,
  getScanPhotoStorage,
  type ScanPhotoStorage,
} from '@/features/profile/lib/storage-usage';
import {
  importUserPreferences,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';
import { clearLastSellerLabel } from '@/features/scan/lib/last-seller-label';

type DataSummary = {
  /** null where there is no file system (web). */
  photoStorage: ScanPhotoStorage | null;
  scans: number;
  deleted: number;
  /** Photo bytes of active scans and of scans in Recently deleted. */
  scanBytes: number;
  deletedBytes: number;
};

// Keep operations exclusive even if the Data screen is closed and opened again mid-operation.
const dataOperationLock = {
  current: false,
  done: Promise.resolve(),
  release: () => {},
};

function beginDataOperation() {
  dataOperationLock.current = true;
  dataOperationLock.done = new Promise<void>((resolve) => { dataOperationLock.release = resolve; });
}

function endDataOperation() {
  dataOperationLock.current = false;
  dataOperationLock.release();
}

async function loadSummary(): Promise<DataSummary> {
  // The deleted count runs first: it also removes scans past the 30 days, so the sizes below agree.
  const deleted = await getDeletedScanCount();
  const [photoStorage, stats, uris] = await Promise.all([
    getScanPhotoStorage(),
    getScanStats(),
    getScanPhotoUris(),
  ]);
  const [scanBytes, deletedBytes] = photoStorage
    ? await Promise.all([getFilesSize(uris.active), getFilesSize(uris.deleted)])
    : [0, 0];
  return { photoStorage, scans: stats.total, deleted, scanBytes, deletedBytes };
}

const BAR_SCANS = BrandColors.primary;
const BAR_DELETED = '#F59E0B';
const BAR_OTHER = BrandColors.border;

function plural(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

/** Settings > Data: what is stored on this device, backup, clean-up and reset. */
export function DataSettingsView() {
  // undefined while measuring.
  const [summary, setSummary] = useState<DataSummary | undefined>(undefined);
  const [summaryError, setSummaryError] = useState(false);
  const summaryRequest = useRef(0);
  const mounted = useRef(true);
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [isClearingTemp, setIsClearingTemp] = useState(false);
  const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);
  const [isEmptyConfirmVisible, setIsEmptyConfirmVisible] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [showSpaceInfo, setShowSpaceInfo] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingImportedPreferences, setIsSavingImportedPreferences] = useState(false);
  const [importPreferencesError, setImportPreferencesError] = useState<string | null>(null);
  const backupBusy = dataOperationLock;
  const [pendingImport, setPendingImport] = useState<{
    report: ImportReport;
    preferences: UserPreferences;
  } | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  /** Reloads the summary and returns it, so a result message can say how much is used now. */
  const refreshSummary = useCallback(async (): Promise<DataSummary | null> => {
    const request = ++summaryRequest.current;
    try {
      const next = await loadSummary();
      if (request === summaryRequest.current) {
        setSummary(next);
        setSummaryError(false);
      }
      return next;
    } catch {
      if (request === summaryRequest.current) setSummaryError(true);
      return null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        while (backupBusy.current) await backupBusy.done;
        if (!active) return;
        // Measuring also purges expired trash, so it must not overlap a backup operation.
        beginDataOperation();
        try { await refreshSummary(); } finally { endDataOperation(); }
      })();
      return () => { active = false; summaryRequest.current += 1; };
    }, [refreshSummary]),
  );

  const nowUsing = (next: DataSummary | null) =>
    next?.photoStorage ? ` Now using ${formatBytes(next.photoStorage.bytes)}.` : '';

  const handleClearTemporaryFiles = async () => {
    setIsClearConfirmVisible(false);
    if (backupBusy.current || pendingImport) return;
    beginDataOperation();
    setIsClearingTemp(true);
    try {
      const uris = await getScanPhotoUris();
      const freed = await clearTemporaryFiles(Date.now(), [...uris.active, ...uris.deleted]);
      showAlert(
        freed > 0 ? 'Temporary files cleared' : 'Nothing to clear',
        freed > 0
          ? `Freed ${formatBytes(freed)}. Your saved scans were not touched.`
          : 'No unused temporary files are old enough to clear. Your saved scans were not touched.',
        'success',
      );
    } catch (error) {
      showAlert('Could not clear temporary files', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      endDataOperation();
      setIsClearingTemp(false);
    }
  };

  const handleEmptyRecentlyDeleted = async () => {
    setIsEmptyConfirmVisible(false);
    if (backupBusy.current || pendingImport) return;
    beginDataOperation();
    setIsEmptyingTrash(true);
    try {
      const before = await getScanPhotoStorage().catch(() => null);
      const removed = await permanentlyDeleteAllDeletedScans();
      const next = await refreshSummary();
      const freedBytes = before && next?.photoStorage
        ? Math.max(0, before.bytes - next.photoStorage.bytes)
        : 0;
      const freedText = freedBytes > 0 ? ` and freed ${formatBytes(freedBytes)}` : '';
      showAlert(
        'Recently deleted emptied',
        `Permanently deleted ${plural(removed, 'scan')}${freedText}.${nowUsing(next)}`,
        'success',
      );
    } catch {
      showAlert('Could not empty Recently deleted', 'Please try again.');
    } finally {
      endDataOperation();
      setIsEmptyingTrash(false);
    }
  };

  const handleExportData = async () => {
    if (backupBusy.current || pendingImport) {
      return;
    }

    beginDataOperation();
    setIsExporting(true);
    try {
      await exportUserData();
    } catch (error) {
      showAlert(
        'Could not export data',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      endDataOperation();
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (backupBusy.current || pendingImport) {
      return;
    }

    beginDataOperation();
    setIsImporting(true);
    try {
      const payload = await pickAndParseExportFile();
      if (!payload) {
        return;
      }

      const report = await importScans(payload.scans, payload.favoriteScanIds, payload.photos);
      const next = await refreshSummary();

      if (payload.preferences) {
        if (mounted.current) {
          setImportPreferencesError(null);
          setPendingImport({ report, preferences: payload.preferences });
        } else {
          showAlert('Scans imported', `${importSummary(report)} Preferences were not changed. Open Data and import again to restore them.`, 'info');
        }
      } else {
        showAlert(
          report.missingPhotoIds.length ? 'Import completed with missing photos' : 'Import complete',
          `${importSummary(report)}${nowUsing(next)}`,
          report.missingPhotoIds.length ? 'info' : 'success',
        );
      }
    } catch (error) {
      if (error instanceof ImportScansError) await refreshSummary();
      showAlert(
        error instanceof ImportScansError ? 'Import stopped' : 'Could not import data',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      endDataOperation();
      setIsImporting(false);
    }
  };

  const handleConfirmImportPreferences = async () => {
    if (!pendingImport || backupBusy.current) {
      return;
    }
    beginDataOperation();
    setImportPreferencesError(null);
    setIsSavingImportedPreferences(true);
    try {
      await importUserPreferences(pendingImport.preferences);
      setPendingImport(null);
      showAlert(
        'Import complete',
        `${importSummary(pendingImport.report)} Preferences were restored.`,
        pendingImport.report.missingPhotoIds.length ? 'info' : 'success',
      );
    } catch {
      setImportPreferencesError(`${importSummary(pendingImport.report)} Preferences could not be saved. Your current preferences were kept. Try Replace again, or choose Keep mine.`);
    } finally {
      endDataOperation();
      setIsSavingImportedPreferences(false);
    }
  };

  const handleConfirmReset = () => {
    if (backupBusy.current || pendingImport) return;
    beginDataOperation();
    setIsResetVisible(false);
    void (async () => {
      let scansCleared = false;
      try {
        await deleteAllScans();
        scansCleared = true;
        await importUserPreferences({
          skinTone: null,
          skinUndertone: null,
          colorSeason: null,
          sensitiveFabrics: [],
          preferredFabrics: [],
          dressingContexts: [],
        });
        clearLastSellerLabel();
        await refreshSummary();
        showAlert('Data reset', 'All scans and preferences were removed from this device.', 'success');
      } catch {
        await refreshSummary();
        showAlert('Could not reset data', scansCleared
          ? 'Scans were removed, but your preferences could not be reset. Your current preferences were kept. Please try again.'
          : 'Please try again.');
      } finally {
        endDataOperation();
      }
    })();
  };

  const photoStorage = summary?.photoStorage;
  const hasFileSystem = summary === undefined || photoStorage !== null;
  const otherBytes =
    summary && photoStorage
      ? Math.max(0, photoStorage.bytes - summary.scanBytes - summary.deletedBytes)
      : 0;
  const storageSegments = [
    {
      key: 'scans',
      label: `Scans (${summary?.scans ?? 0})`,
      bytes: summary?.scanBytes ?? 0,
      color: BAR_SCANS,
    },
    {
      key: 'deleted',
      label: `Recently deleted (${summary?.deleted ?? 0})`,
      bytes: summary?.deletedBytes ?? 0,
      color: BAR_DELETED,
    },
    { key: 'other', label: 'Other photos', bytes: otherBytes, color: BAR_OTHER },
  ];
  const hasDeleted = Boolean(summary && summary.deleted > 0);

  return (
    <>
      <View style={[styles.summaryCard, faintCardShadow()]}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Database size={16} color={BrandColors.primaryDark} strokeWidth={2.25} />
          </View>
          <Text style={styles.summaryTitle}>Storage on this device</Text>
        </View>

        {summaryError ? (
          <Text style={styles.summaryCounts}>Could not measure storage. Reopen this page to try again.</Text>
        ) : null}

        {hasFileSystem ? (
          <Text style={styles.summaryValue}>
            {photoStorage ? formatBytes(photoStorage.bytes) : '...'}
          </Text>
        ) : null}

        {summary && photoStorage ? (
          <>
            <View
              style={styles.bar}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              {storageSegments.map((segment) =>
                segment.bytes > 0 ? (
                  <View
                    key={segment.key}
                    style={{ flex: segment.bytes, backgroundColor: segment.color }}
                  />
                ) : null,
              )}
            </View>
            <View style={styles.legend}>
              {storageSegments
                .filter((segment) => segment.key !== 'other' || segment.bytes > 0)
                .map((segment) => (
                  <View key={segment.key} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                    <Text style={styles.legendLabel}>{segment.label}</Text>
                    <Text style={styles.legendValue}>{formatBytes(segment.bytes)}</Text>
                  </View>
                ))}
            </View>
          </>
        ) : (
          <Text style={styles.summaryCounts}>
            {summary
              ? `${plural(summary.scans, 'scan')} · ${summary.deleted} in Recently deleted`
              : summaryError ? 'Storage unavailable' : 'Counting...'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <ProfileSectionLabel title="Backup" />
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Export My Data"
            value={isExporting ? 'Preparing export...' : 'Includes photos'}
            icon={<Share2 size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => void handleExportData()}
          />
          <ProfilePreferenceRow
            title="Import My Data"
            value={isImporting ? 'Importing...' : undefined}
            icon={<Download size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
            onPress={() => void handleImportData()}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      {hasFileSystem ? (
        <View style={styles.section}>
          <ProfileSectionLabel
            title="Clean up"
            onInfoPress={() => setShowSpaceInfo(true)}
            infoAccessibilityLabel="How to free up space"
          />
          <ProfileGroupedCard>
            <ProfilePreferenceRow
              title="Clear temporary files"
              value={isClearingTemp ? 'Clearing...' : 'Never removes saved scans'}
              icon={<Sparkles size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
              onPress={() => {
                if (!backupBusy.current && !pendingImport) setIsClearConfirmVisible(true);
              }}
            />
            <ProfilePreferenceRow
              title="Empty Recently deleted"
              value={
                isEmptyingTrash
                  ? 'Deleting...'
                  : !summary
                    ? undefined
                    : hasDeleted
                      ? `${plural(summary.deleted, 'scan')} · ${formatBytes(summary.deletedBytes)}`
                      : 'Already empty'
              }
              icon={<Trash2 size={18} color={BrandColors.primaryDark} strokeWidth={2.25} />}
              onPress={() => {
                if (hasDeleted && !backupBusy.current && !pendingImport) setIsEmptyConfirmVisible(true);
              }}
              showChevron={hasDeleted}
              isLast
            />
          </ProfileGroupedCard>
        </View>
      ) : null}

      <View style={styles.section}>
        <ProfileGroupedCard>
          <ProfilePreferenceRow
            title="Reset My Data"
            value="Delete all scans and preferences"
            icon={<Trash2 size={18} color="#DC2626" strokeWidth={2.25} />}
            titleColor="#DC2626"
            onPress={() => {
              if (!backupBusy.current && !pendingImport) setIsResetVisible(true);
            }}
            isLast
          />
        </ProfileGroupedCard>
      </View>

      <InfoSheet
        visible={showSpaceInfo}
        title="Freeing up space"
        message="Permanently deleting scans frees their photos. Scans in Recently deleted keep using space for up to 30 days, or until you delete them there."
        onClose={() => setShowSpaceInfo(false)}
      />

      <ConfirmDialog
        visible={isClearConfirmVisible}
        title="Clear temporary files?"
        message="Removes leftover camera, crop and backup files older than an hour. Your saved scans and photos won't be touched."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={() => void handleClearTemporaryFiles()}
        onCancel={() => setIsClearConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={isEmptyConfirmVisible}
        title="Empty Recently deleted?"
        message={`This permanently deletes ${plural(summary?.deleted ?? 0, 'scan')} and their photos. This can't be undone.`}
        confirmLabel="Delete forever"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => void handleEmptyRecentlyDeleted()}
        onCancel={() => setIsEmptyConfirmVisible(false)}
      />

      <ConfirmDialog
        visible={isResetVisible}
        title="Reset all data?"
        message="This permanently deletes every scan (including favorites and Recently deleted) and clears your preferences on this device. Export first if you want a backup."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetVisible(false)}
      />

      <ConfirmDialog
        visible={pendingImport !== null}
        title={importPreferencesError ? 'Could not restore preferences' : 'Replace your preferences?'}
        message={
          pendingImport
            ? (importPreferencesError ?? `${importSummary(pendingImport.report)} This file also has saved preferences (sensitivities, preferred fabrics, weather, etc). Replace what's on this device with them?`)
            : ''
        }
        confirmLabel={isSavingImportedPreferences ? 'Saving...' : 'Replace'}
        cancelLabel="Keep mine"
        onConfirm={() => void handleConfirmImportPreferences()}
        onCancel={() => {
          if (backupBusy.current || !pendingImport) return;
          showAlert(
            'Import complete',
            `${importSummary(pendingImport.report)} Your current preferences were kept.`,
            pendingImport.report.missingPhotoIds.length ? 'info' : 'success',
          );
          setPendingImport(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 10,
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.lavenderCard,
  },
  summaryTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.textMuted,
  },
  summaryValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: BrandColors.primaryDark,
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    gap: 2,
    backgroundColor: BrandColors.inputBackground,
  },
  legend: {
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.text,
  },
  legendValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: BrandColors.text,
  },
  summaryCounts: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BrandColors.text,
  },
  section: {
    marginTop: 8,
  },
});
