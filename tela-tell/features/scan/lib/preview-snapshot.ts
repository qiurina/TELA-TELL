import type { Image, RawPixelData } from 'react-native-nitro-image';
import type { CameraRef } from 'react-native-vision-camera';

import type { Size, ViewRect } from '@/features/scan/lib/crop-to-guide';
import { measureRgbaLighting, type LightingReading } from '@/features/scan/lib/ml/lighting';
import { SHARPNESS_ANALYSIS_SIZE, measureRgbaSharpness } from '@/features/scan/lib/ml/sharpness';

export type PixelRect = { startX: number; startY: number; endX: number; endY: number };

/** Same JPEG quality the photo crop saves at (SCAN_JPEG_QUALITY in crop-to-guide.ts). */
const SNAPSHOT_JPEG_QUALITY = 88;

/**
 * Lighting is read as averages over the image (mean brightness, dark and clipped shares, 3x3 block
 * means), so it is measured on a smaller copy than the blur check, which needs fine detail.
 */
export const LIGHTING_ANALYSIS_SIZE = 240;

/**
 * Maps the guide (view points) onto a snapshot of that view (pixels). A preview snapshot is the
 * view exactly as drawn, so this is a plain scale with no cover offset. Clamped so the native crop
 * cannot throw.
 */
export function guideToSnapshotRect(view: Size, snapshot: Size, guide: ViewRect): PixelRect {
  const scaleX = snapshot.width / view.width;
  const scaleY = snapshot.height / view.height;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const startX = clamp(Math.round(guide.x * scaleX), 0, snapshot.width - 1);
  const startY = clamp(Math.round(guide.y * scaleY), 0, snapshot.height - 1);
  const endX = clamp(Math.round((guide.x + guide.width) * scaleX), startX + 1, snapshot.width);
  const endY = clamp(Math.round((guide.y + guide.height) * scaleY), startY + 1, snapshot.height);
  return { startX, startY, endX, endY };
}

/**
 * The pixels of a raw image as tightly packed RGBA, which is what the blur and lighting measures
 * read. Null for any other layout, so the caller can fall back to the file-based check.
 */
export function rgbaPixels(raw: RawPixelData): Uint8Array | null {
  const expectedBytes = raw.width * raw.height * 4;
  if (raw.pixelFormat !== 'RGBA' || raw.buffer.byteLength !== expectedBytes) {
    return null;
  }
  return new Uint8Array(raw.buffer);
}

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

export type SnapshotShot = { uri: string; width: number; height: number; ms: number };

/** Blur and lighting readings of one shot; null where that shot could not be measured. */
export type SnapshotMeasurement = {
  sharpness: number | null;
  lighting: LightingReading | null;
};

export type SnapshotBurst = {
  shots: SnapshotShot[];
  /**
   * One per shot, taken from the snapshot in memory. Null when the pixels came back in a layout the
   * measures cannot read, in which case the caller measures the saved files instead.
   */
  measurements: SnapshotMeasurement[] | null;
  /** Message of the last failed shot, null when every shot succeeded. */
  error: string | null;
};

/**
 * Reads the blur and lighting measures from a shot's cropped image, at the same sizes the
 * file-based check (checkCapture) uses for blur, and at LIGHTING_ANALYSIS_SIZE for lighting.
 * Returns null if the pixel layout is not RGBA.
 */
async function measureShot(image: Image): Promise<SnapshotMeasurement | null> {
  const forSharpness = await image.resizeAsync(SHARPNESS_ANALYSIS_SIZE, SHARPNESS_ANALYSIS_SIZE);
  const sharpnessPixels = rgbaPixels(await forSharpness.toRawPixelDataAsync());
  const forLighting = await forSharpness.resizeAsync(
    LIGHTING_ANALYSIS_SIZE,
    LIGHTING_ANALYSIS_SIZE,
  );
  const lightingPixels = rgbaPixels(await forLighting.toRawPixelDataAsync());
  if (!sharpnessPixels || !lightingPixels) {
    return null;
  }

  let sharpness: number | null = null;
  let lighting: LightingReading | null = null;
  try {
    sharpness = measureRgbaSharpness(
      sharpnessPixels,
      SHARPNESS_ANALYSIS_SIZE,
      SHARPNESS_ANALYSIS_SIZE,
    );
  } catch (error) {
    console.warn('[TELA-TELL] sharpness measurement failed:', error);
  }
  try {
    lighting = measureRgbaLighting(lightingPixels, LIGHTING_ANALYSIS_SIZE, LIGHTING_ANALYSIS_SIZE);
  } catch (error) {
    console.warn('[TELA-TELL] lighting measurement failed:', error);
  }
  return { sharpness, lighting };
}

/**
 * Takes `count` snapshots of the live preview and saves each one's guide area as a JPEG. The crop
 * is the preview as displayed, so it shows exactly what was inside the guide, in the same
 * orientation. A failed shot is skipped, like a failed photo in the photo burst.
 *
 * All shots are taken first and measured afterwards, so the person holds still only for the
 * snapshots themselves.
 *
 * Android only: VisionCamera's takeSnapshot is not available on iOS.
 */
export async function captureGuideSnapshots(
  camera: CameraRef,
  view: Size,
  guide: ViewRect,
  count: number,
): Promise<SnapshotBurst> {
  const shots: SnapshotShot[] = [];
  const croppedImages: Image[] = [];
  let error: string | null = null;

  for (let shot = 0; shot < count; shot += 1) {
    const startedAt = Date.now();
    try {
      const snapshot = await camera.takeSnapshot();
      const rect = guideToSnapshotRect(view, snapshot, guide);
      const cropped = await snapshot.cropAsync(rect.startX, rect.startY, rect.endX, rect.endY);
      const path = await cropped.saveToTemporaryFileAsync('jpg', SNAPSHOT_JPEG_QUALITY);
      shots.push({
        uri: toFileUri(path),
        width: cropped.width,
        height: cropped.height,
        ms: Date.now() - startedAt,
      });
      croppedImages.push(cropped);
    } catch (shotError) {
      error = shotError instanceof Error ? shotError.message : String(shotError);
    }
  }

  let measurements: SnapshotMeasurement[] | null = [];
  for (const image of croppedImages) {
    let measurement: SnapshotMeasurement | null;
    try {
      measurement = await measureShot(image);
    } catch (measureError) {
      console.warn('[TELA-TELL] snapshot measurement failed:', measureError);
      measurement = { sharpness: null, lighting: null };
    }
    if (!measurement) {
      measurements = null;
      break;
    }
    measurements.push(measurement);
  }

  return { shots, measurements, error };
}
