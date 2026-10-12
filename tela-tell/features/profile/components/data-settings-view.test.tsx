import type { ReactElement, ReactNode } from 'react';
import { Text } from 'react-native';

import { showAlert } from '@/components/ui/alert-dialog';
import { getPreferences, savePreferences } from '@/db/preferences';
import {
  deleteAllScans, getDeletedScanCount, getScanPhotoUris, getScanStats,
  permanentlyDeleteAllDeletedScans,
} from '@/db/scans';
import { exportUserData, importScans, pickAndParseExportFile } from '@/features/profile/lib/data-export';
import { ImportScansError } from '@/features/profile/lib/import-report';
import { clearTemporaryFiles, getFilesSize, getScanPhotoStorage } from '@/features/profile/lib/storage-usage';
import { getUserPreferences, setUserPreferences, type UserPreferences } from '@/features/profile/lib/user-preferences';
import { DataSettingsView } from './data-settings-view';

type TestInstance = {
  props: { title?: string; value?: string; children?: ReactNode; visible?: boolean; onPress?: () => void; onConfirm?: () => void };
  findAllByType: (type: unknown) => TestInstance[];
};
type TestRenderer = { root: TestInstance; unmount: () => void };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => void | Promise<void>) => Promise<void>;
  create: (element: ReactElement) => TestRenderer;
};

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react') as typeof import('react');
    React.useEffect(callback, [callback]);
  },
}));
jest.mock('@/components/ui/alert-dialog', () => ({ showAlert: jest.fn() }));
jest.mock('@/components/ui/confirm-dialog', () => ({ ConfirmDialog: 'ConfirmDialog' }));
jest.mock('@/components/ui/info-sheet', () => ({ InfoSheet: 'InfoSheet' }));
jest.mock('@/components/ui/lucide-icons', () => ({
  Database: () => null, Download: () => null, Share2: () => null, Sparkles: () => null, Trash2: () => null,
}));
jest.mock('@/features/profile/components/profile-section-label', () => ({ ProfileSectionLabel: 'SectionLabel' }));
jest.mock('@/features/profile/components/profile-preference-row', () => ({
  ProfileGroupedCard: 'GroupedCard', ProfilePreferenceRow: 'PreferenceRow',
}));
jest.mock('@/db/scans', () => ({
  deleteAllScans: jest.fn(), getDeletedScanCount: jest.fn(), getScanPhotoUris: jest.fn(),
  getScanStats: jest.fn(), permanentlyDeleteAllDeletedScans: jest.fn(),
}));
jest.mock('@/db/preferences', () => ({ getPreferences: jest.fn(), savePreferences: jest.fn() }));
jest.mock('@/features/profile/lib/data-export', () => ({
  exportUserData: jest.fn(), importScans: jest.fn(), pickAndParseExportFile: jest.fn(),
}));
jest.mock('@/features/profile/lib/storage-usage', () => ({
  ...jest.requireActual('@/features/profile/lib/storage-usage'),
  clearTemporaryFiles: jest.fn(), getFilesSize: jest.fn(), getScanPhotoStorage: jest.fn(),
}));
jest.mock('@/features/scan/lib/last-seller-label', () => ({ clearLastSellerLabel: jest.fn() }));

const PREFERENCES: UserPreferences = {
  skinTone: 'Medium', skinUndertone: 'Warm', colorSeason: null,
  sensitiveFabrics: [], preferredFabrics: ['Cotton'], dressingContexts: [],
};
const EMPTY_PREFERENCES: UserPreferences = {
  skinTone: null, skinUndertone: null, colorSeason: null,
  sensitiveFabrics: [], preferredFabrics: [], dressingContexts: [],
};
let renderer: TestRenderer | undefined;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  jest.clearAllMocks();
  setUserPreferences(PREFERENCES);
  (getPreferences as jest.Mock).mockResolvedValue(PREFERENCES);
  (savePreferences as jest.Mock).mockResolvedValue(undefined);
  (getDeletedScanCount as jest.Mock).mockResolvedValue(1);
  (getScanStats as jest.Mock).mockResolvedValue({ total: 2, mislabeled: 0, synthetic: 0 });
  (getScanPhotoUris as jest.Mock).mockResolvedValue({ active: ['active.jpg'], deleted: ['deleted.jpg'] });
  (getScanPhotoStorage as jest.Mock).mockResolvedValue({ bytes: 3000, photos: 3 });
  (getFilesSize as jest.Mock).mockResolvedValue(1000);
  (permanentlyDeleteAllDeletedScans as jest.Mock).mockResolvedValue(1);
  (deleteAllScans as jest.Mock).mockResolvedValue(undefined);
  (clearTemporaryFiles as jest.Mock).mockResolvedValue(0);
  (exportUserData as jest.Mock).mockResolvedValue(undefined);
  (pickAndParseExportFile as jest.Mock).mockResolvedValue({ scans: [], favoriteScanIds: [] });
  (importScans as jest.Mock).mockResolvedValue({ imported: 1, total: 1, missingPhotoIds: [] });
});

afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
});

async function mount() {
  await act(async () => { renderer = create(<DataSettingsView />); });
}

function node(type: string, title: string) {
  const found = renderer!.root.findAllByType(type).find((item) => item.props.title === title);
  if (!found) throw new Error(`Missing ${title}`);
  return found;
}

async function press(title: string) {
  await act(async () => node('PreferenceRow', title).props.onPress!());
}

async function confirm(title: string) {
  expect(node('ConfirmDialog', title).props.visible).toBe(true);
  await act(async () => node('ConfirmDialog', title).props.onConfirm!());
}

it('shows a storage failure without inventing zero scan counts or an empty trash', async () => {
  (getDeletedScanCount as jest.Mock).mockRejectedValueOnce(new Error('database unavailable'));
  await mount();
  expect(renderer!.root.findAllByType(Text).some((item) =>
    item.props.children === 'Could not measure storage. Reopen this page to try again.',
  )).toBe(true);
  expect(node('PreferenceRow', 'Empty Recently deleted').props.value).not.toBe('Already empty');
});

it('does not claim freed space when deleted photo files remain on disk', async () => {
  await mount();
  await press('Empty Recently deleted');
  await confirm('Empty Recently deleted?');
  const message = (showAlert as jest.Mock).mock.calls.at(-1)[1];
  expect(message).toContain('Permanently deleted 1 scan');
  expect(message).not.toContain('freed');
});

it('passes every saved and trashed photo path to cleanup so legacy cache photos survive', async () => {
  await mount();
  await press('Clear temporary files');
  await confirm('Clear temporary files?');
  expect(clearTemporaryFiles).toHaveBeenCalledWith(expect.any(Number), ['active.jpg', 'deleted.jpg']);
});

it('reports freed space from the measured change instead of the previous trash estimate', async () => {
  await mount();
  (getScanPhotoStorage as jest.Mock).mockResolvedValueOnce({ bytes: 3000, photos: 3 });
  (getScanPhotoStorage as jest.Mock).mockResolvedValueOnce({ bytes: 1000, photos: 1 });
  await press('Empty Recently deleted');
  await confirm('Empty Recently deleted?');
  expect((showAlert as jest.Mock).mock.calls.at(-1)[1]).toContain('freed 2 KB');
});

it('blocks import, export, cleanup and reset during trash deletion', async () => {
  const deletion = deferred<number>();
  (permanentlyDeleteAllDeletedScans as jest.Mock).mockReturnValueOnce(deletion.promise);
  await mount();
  await press('Empty Recently deleted');
  await confirm('Empty Recently deleted?');
  await press('Import My Data');
  await press('Export My Data');
  await press('Clear temporary files');
  await press('Reset My Data');
  expect(pickAndParseExportFile).not.toHaveBeenCalled();
  expect(exportUserData).not.toHaveBeenCalled();
  expect(node('ConfirmDialog', 'Clear temporary files?').props.visible).toBe(false);
  expect(node('ConfirmDialog', 'Reset all data?').props.visible).toBe(false);
  await act(async () => { deletion.resolve(1); });
  await press('Export My Data');
  expect(exportUserData).toHaveBeenCalledTimes(1);
});

it('keeps the operation guard after the Data screen is closed and opened again', async () => {
  const exporting = deferred<void>();
  (exportUserData as jest.Mock).mockReturnValueOnce(exporting.promise);
  await mount();
  await press('Export My Data');
  await act(async () => renderer!.unmount());
  await mount();
  await press('Import My Data');
  expect(pickAndParseExportFile).not.toHaveBeenCalled();
  // The new focus refresh must also wait, since it purges expired trash.
  expect(getDeletedScanCount).toHaveBeenCalledTimes(1);
  await act(async () => { exporting.resolve(); });
  expect(getDeletedScanCount).toHaveBeenCalledTimes(2);
  await press('Import My Data');
  expect(pickAndParseExportFile).toHaveBeenCalledTimes(1);
});

it('blocks data changes while the initial summary is purging expired trash', async () => {
  const count = deferred<number>();
  (getDeletedScanCount as jest.Mock).mockReturnValueOnce(count.promise);
  await mount();
  await press('Import My Data');
  expect(pickAndParseExportFile).not.toHaveBeenCalled();
  await act(async () => { count.resolve(0); });
  await press('Import My Data');
  expect(pickAndParseExportFile).toHaveBeenCalledTimes(1);
});

it('reports completed scans and unchanged preferences if Data closes during import', async () => {
  const importing = deferred<{ imported: number; total: number; missingPhotoIds: string[] }>();
  (pickAndParseExportFile as jest.Mock).mockResolvedValueOnce({
    scans: [], favoriteScanIds: [], preferences: PREFERENCES,
  });
  (importScans as jest.Mock).mockReturnValueOnce(importing.promise);
  await mount();
  await press('Import My Data');
  await act(async () => renderer!.unmount());
  renderer = undefined;
  await act(async () => { importing.resolve({ imported: 1, total: 1, missingPhotoIds: [] }); });
  expect(showAlert).toHaveBeenCalledWith('Scans imported', expect.stringContaining('Preferences were not changed'), 'info');
  expect(getUserPreferences()).toEqual(PREFERENCES);
});

it('refreshes the summary after a partially completed import', async () => {
  (importScans as jest.Mock).mockRejectedValueOnce(new ImportScansError({
    imported: 1, total: 2, missingPhotoIds: [],
  }));
  await mount();
  await press('Import My Data');
  expect(getDeletedScanCount).toHaveBeenCalledTimes(2);
  expect(showAlert).toHaveBeenCalledWith('Import stopped', expect.stringContaining('1 of 2'));
});

it('blocks cleanup and trash deletion until imported preferences have been reviewed', async () => {
  (pickAndParseExportFile as jest.Mock).mockResolvedValueOnce({
    scans: [], favoriteScanIds: [], preferences: PREFERENCES,
  });
  await mount();
  await press('Import My Data');
  expect(node('ConfirmDialog', 'Replace your preferences?').props.visible).toBe(true);
  await press('Clear temporary files');
  await press('Empty Recently deleted');
  expect(node('ConfirmDialog', 'Clear temporary files?').props.visible).toBe(false);
  expect(node('ConfirmDialog', 'Empty Recently deleted?').props.visible).toBe(false);
});

it('keeps preferences when their reset cannot be saved and refreshes the partially reset scans', async () => {
  (savePreferences as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await mount();
    await press('Reset My Data');
    await confirm('Reset all data?');
    expect(deleteAllScans).toHaveBeenCalledTimes(1);
    expect(getUserPreferences()).toEqual(PREFERENCES);
    expect(getDeletedScanCount).toHaveBeenCalledTimes(2);
    expect(showAlert).toHaveBeenCalledWith('Could not reset data', expect.stringContaining('Scans were removed'));
  } finally { log.mockRestore(); }
});

it('clears preferences after a successful reset save', async () => {
  await mount();
  await press('Reset My Data');
  await confirm('Reset all data?');
  expect(savePreferences).toHaveBeenCalledWith(EMPTY_PREFERENCES);
  expect(getUserPreferences()).toEqual(EMPTY_PREFERENCES);
  expect(showAlert).toHaveBeenCalledWith('Data reset', expect.any(String), 'success');
});
