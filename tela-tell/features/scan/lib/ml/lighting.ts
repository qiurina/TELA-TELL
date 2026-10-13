// Provisional, from lighting_calibration_2026-10-10.txt; not yet validated on a device.
export const LIGHTING_DARK_PIXEL = 30;
export const LIGHTING_CLIP_PIXEL = 250;

export const LIGHTING_WARN_MEAN_LUMA_BELOW = 30;
export const LIGHTING_WARN_CLIPPED_SHARE_AT_LEAST = 0.1;

export type LightingReading = {
  meanLuma: number;
  darkShare: number;
  clippedShare: number;
  unevenness: number;
};

export function measureRgbaLighting(rgba: Uint8Array, width: number, height: number): LightingReading {
  const pixels = width * height;
  const blockH = Math.floor(height / 3);
  const blockW = Math.floor(width / 3);
  const blockSums = new Float64Array(9);
  let sum = 0;
  let dark = 0;
  let clipped = 0;

  for (let y = 0; y < height; y += 1) {
    const blockRow = blockH > 0 ? Math.min(2, Math.floor(y / blockH)) : 0;
    const inRowBlocks = blockH > 0 && blockW > 0 && y < blockH * 3;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const luma = rgba[i] * 0.299 + rgba[i + 1] * 0.587 + rgba[i + 2] * 0.114;
      sum += luma;
      if (luma < LIGHTING_DARK_PIXEL) dark += 1;
      if (luma >= LIGHTING_CLIP_PIXEL) clipped += 1;
      if (inRowBlocks && x < blockW * 3) {
        blockSums[blockRow * 3 + Math.floor(x / blockW)] += luma;
      }
    }
  }

  const blockPixels = blockH * blockW;
  let blockMin = Infinity;
  let blockMax = -Infinity;
  for (let b = 0; b < 9; b += 1) {
    const mean = blockPixels > 0 ? blockSums[b] / blockPixels : 0;
    blockMin = Math.min(blockMin, mean);
    blockMax = Math.max(blockMax, mean);
  }

  const meanLuma = pixels > 0 ? sum / pixels : 0;
  return {
    meanLuma,
    darkShare: pixels > 0 ? dark / pixels : 0,
    clippedShare: pixels > 0 ? clipped / pixels : 0,
    unevenness: blockPixels > 0 ? (blockMax - blockMin) / (meanLuma + 1) : 0,
  };
}

export type LightingWarning = 'very_dark' | 'bright_areas';

export type LightingThresholds = {
  meanLumaBelow: number;
  clippedShareAtLeast: number;
};

export const DEFAULT_LIGHTING_THRESHOLDS: LightingThresholds = {
  meanLumaBelow: LIGHTING_WARN_MEAN_LUMA_BELOW,
  clippedShareAtLeast: LIGHTING_WARN_CLIPPED_SHARE_AT_LEAST,
};

export type LightingAssessment = {
  perPhoto: (LightingReading | null)[];
  warnings: LightingWarning[];
};

export function assessLighting(
  readings: (LightingReading | null)[],
  thresholds: LightingThresholds = DEFAULT_LIGHTING_THRESHOLDS,
): LightingAssessment {
  const measured = readings.filter((reading): reading is LightingReading => reading != null);
  const warnings: LightingWarning[] = [];

  if (measured.length > 0) {
    const meanLuma = measured.reduce((total, reading) => total + reading.meanLuma, 0) / measured.length;
    const clippedShare = measured.reduce((total, reading) => total + reading.clippedShare, 0) / measured.length;
    if (meanLuma < thresholds.meanLumaBelow) {
      warnings.push('very_dark');
    }
    if (clippedShare >= thresholds.clippedShareAtLeast) {
      warnings.push('bright_areas');
    }
  }

  return { perPhoto: [...readings], warnings };
}

export function roundLightingReading(reading: LightingReading | null): LightingReading | null {
  if (!reading) {
    return null;
  }
  const r1 = (value: number) => Math.round(value * 10) / 10;
  const r3 = (value: number) => Math.round(value * 1000) / 1000;
  return {
    meanLuma: r1(reading.meanLuma),
    darkShare: r3(reading.darkShare),
    clippedShare: r3(reading.clippedShare),
    unevenness: r3(reading.unevenness),
  };
}

export const LIGHTING_NOTICES: Record<LightingWarning, { title: string; message: string }> = {
  very_dark: {
    title: 'This photo looks very dark',
    message:
      'If the light is dim, try the fill light or move somewhere brighter. Dark fabric can also look this dark in good light, so ignore this if the light is fine.',
  },
  bright_areas: {
    title: 'This photo has very bright areas',
    message:
      'If there is glare, tilt the phone slightly or move out of direct light. White fabric can also look this bright in good light, so ignore this if the light is fine.',
  },
};
