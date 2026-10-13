import {
  computeSharpnessSignals,
  getChannelLayout,
} from '@/features/scan/lib/ml/live/frame-signals';

export const SHARPNESS_ANALYSIS_SIZE = 480;

// Provisional, from sharpness_calibration_2026-10-10.txt; not yet validated on a device.
export const BLUR_REJECT_VARIANCE = 100;

export function measureRgbaSharpness(rgba: Uint8Array, width: number, height: number): number {
  const layout = getChannelLayout('rgb-rgba-8-bit');
  if (!layout) {
    throw new Error('RGBA channel layout is unavailable.');
  }
  const buffer = rgba.buffer.slice(
    rgba.byteOffset,
    rgba.byteOffset + rgba.byteLength,
  ) as ArrayBuffer;
  return computeSharpnessSignals(buffer, width * 4, layout, {
    originX: 0,
    originY: 0,
    width,
    height,
  }).variance;
}

export type SharpnessVerdict = {
  sharpest: number | null;
  blurry: boolean;
  measured: boolean;
  readings: (number | null)[];
};

export function judgeSharpness(
  readings: (number | null)[],
  threshold: number = BLUR_REJECT_VARIANCE,
): SharpnessVerdict {
  const values = readings.filter((value): value is number => value != null && Number.isFinite(value));
  if (values.length === 0) {
    return { sharpest: null, blurry: false, measured: false, readings: [...readings] };
  }
  const sharpest = Math.max(...values);
  return { sharpest, blurry: sharpest < threshold, measured: true, readings: [...readings] };
}

export function sharpestIndex(readings: (number | null)[]): number {
  let best = 0;
  let bestValue = -Infinity;
  readings.forEach((value, index) => {
    if (value != null && Number.isFinite(value) && value > bestValue) {
      best = index;
      bestValue = value;
    }
  });
  return best;
}
