import type { ScanResult } from '@/data/scans/mock-data';
import type { GarmentCondition } from '@/data/scans/garment-condition';
import { saveScan } from '@/db/scans';
import { optimizeScanImage } from './crop-to-guide';
import { deleteScanImages, persistScanImage } from './scan-image-storage';

export async function saveCapturedScan(
  result: ScanResult,
  photoUri: string,
  garmentCondition?: GarmentCondition,
): Promise<void> {
  const optimizedUri = await optimizeScanImage(photoUri);
  const storedImageUri = await persistScanImage(optimizedUri, result.id);
  try {
    await saveScan(result, { garmentCondition, imageUri: storedImageUri });
  } catch (error) {
    if (storedImageUri !== optimizedUri) await deleteScanImages([storedImageUri]);
    console.warn('[TELA-TELL] Could not save captured scan:', error);
    throw new Error('Could not save this scan. Your photo is still on screen. Free some space, then try Analyze again.');
  }
}
