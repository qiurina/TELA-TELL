/** @jest-environment node */
import * as FileSystem from 'expo-file-system/legacy';
import { persistScanImage, restoreScanImage, ScanImageSaveError } from './scan-image-storage';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  makeDirectoryAsync: jest.fn(async () => undefined),
  copyAsync: jest.fn(async () => undefined),
  writeAsStringAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
  EncodingType: { Base64: 'base64' },
}));

beforeEach(() => jest.clearAllMocks());

it('restores repeated imports to distinct paths without overwriting the existing photo', async () => {
  const first = await restoreScanImage('scan_a', 'QUJD');
  const second = await restoreScanImage('scan_a', 'REVG');
  expect(first).toMatch(/^file:\/\/\/docs\/scan-images\/scan_a-import-.*\.jpg$/);
  expect(second).not.toBe(first);
  expect(first).not.toBe('file:///docs/scan-images/scan_a.jpg');
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});

it('cleans up a partially written imported photo after a write failure', async () => {
  (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    expect(await restoreScanImage('scan_a', 'QUJD')).toBeNull();
    const [destination] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(destination, { idempotent: true });
  } finally { log.mockRestore(); }
});

it('returns a permanent path only after the captured photo copy succeeds', async () => {
  await expect(persistScanImage('file:///cache/preview.jpg', 'scan_a'))
    .resolves.toBe('file:///docs/scan-images/scan_a.jpg');
  expect(FileSystem.copyAsync).toHaveBeenCalledWith({
    from: 'file:///cache/preview.jpg', to: 'file:///docs/scan-images/scan_a.jpg',
  });
});

it('rejects a failed copy, cleans the partial destination and leaves the preview untouched', async () => {
  (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await expect(persistScanImage('file:///cache/preview.jpg', 'scan_a')).rejects.toBeInstanceOf(ScanImageSaveError);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///docs/scan-images/scan_a.jpg', { idempotent: true });
    expect(FileSystem.deleteAsync).not.toHaveBeenCalledWith('file:///cache/preview.jpg', expect.anything());
    await expect(persistScanImage('file:///cache/preview.jpg', 'scan_a'))
      .resolves.toBe('file:///docs/scan-images/scan_a.jpg');
  } finally { log.mockRestore(); }
});

it('does not copy or delete a photo that is already in permanent storage', async () => {
  await expect(persistScanImage('file:///docs/scan-images/existing.jpg', 'scan_a'))
    .resolves.toBe('file:///docs/scan-images/existing.jpg');
  expect(FileSystem.copyAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
});

it('rejects when the device has no permanent document directory', async () => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('expo-file-system/legacy');
  const previous = fs.documentDirectory;
  fs.documentDirectory = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const storage = require('./scan-image-storage');
    await expect(storage.persistScanImage('file:///cache/preview.jpg', 'scan_a')).rejects.toThrow('Could not save the photo');
  } finally { fs.documentDirectory = previous; }
});
