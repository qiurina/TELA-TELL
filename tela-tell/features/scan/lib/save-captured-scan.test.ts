/** @jest-environment node */
import type { ScanResult } from '@/data/scans/mock-data';
import { saveScan } from '@/db/scans';
import { optimizeScanImage } from './crop-to-guide';
import { deleteScanImages, persistScanImage } from './scan-image-storage';
import { saveCapturedScan } from './save-captured-scan';

jest.mock('@/db/scans', () => ({ saveScan: jest.fn() }));
jest.mock('./crop-to-guide', () => ({ optimizeScanImage: jest.fn() }));
jest.mock('./scan-image-storage', () => ({ persistScanImage: jest.fn(), deleteScanImages: jest.fn() }));

const result = { id: 'scan_a' } as ScanResult;
const preview = 'file:///cache/preview.jpg';
const optimized = 'file:///cache/optimized.jpg';
const permanent = 'file:///docs/scan-images/scan_a.jpg';

beforeEach(() => {
  jest.clearAllMocks();
  (optimizeScanImage as jest.Mock).mockResolvedValue(optimized);
  (persistScanImage as jest.Mock).mockResolvedValue(permanent);
  (saveScan as jest.Mock).mockResolvedValue(undefined);
  (deleteScanImages as jest.Mock).mockResolvedValue(undefined);
});

it('does not create a scan row when the permanent photo copy fails; the same preview can be retried', async () => {
  (persistScanImage as jest.Mock).mockRejectedValueOnce(new Error('Could not save the photo'));
  await expect(saveCapturedScan(result, preview, 'Good')).rejects.toThrow('Could not save the photo');
  expect(saveScan).not.toHaveBeenCalled();
  expect(deleteScanImages).not.toHaveBeenCalled();
  await saveCapturedScan(result, preview, 'Good');
  expect(saveScan).toHaveBeenCalledTimes(1);
  expect(saveScan).toHaveBeenCalledWith(result, { garmentCondition: 'Good', imageUri: permanent });
  expect(optimizeScanImage).toHaveBeenNthCalledWith(2, preview);
});

it('removes only the permanent copy after a database write failure and reports a retryable error', async () => {
  (saveScan as jest.Mock).mockRejectedValueOnce(new Error('SQLITE_FULL'));
  const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await expect(saveCapturedScan(result, preview, 'New')).rejects.toThrow('Your photo is still on screen');
    expect(deleteScanImages).toHaveBeenCalledWith([permanent]);
    expect(deleteScanImages).not.toHaveBeenCalledWith([preview]);
    expect(deleteScanImages).not.toHaveBeenCalledWith([optimized]);
    await saveCapturedScan(result, preview, 'New');
    expect(saveScan).toHaveBeenCalledTimes(2);
  } finally { log.mockRestore(); }
});

it('keeps an existing permanent preview on a database write failure', async () => {
  (optimizeScanImage as jest.Mock).mockResolvedValue(permanent);
  (saveScan as jest.Mock).mockRejectedValueOnce(new Error('SQLITE_FULL'));
  const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await expect(saveCapturedScan(result, permanent, 'New')).rejects.toThrow('Could not save this scan');
    expect(deleteScanImages).not.toHaveBeenCalled();
  } finally { log.mockRestore(); }
});
