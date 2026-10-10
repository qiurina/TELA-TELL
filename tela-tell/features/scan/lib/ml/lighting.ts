/**
 * Lighting check for captured photos: measures brightness, blown highlights and shading from the
 * same decoded image the blur check uses (no extra decode), and turns two of those measures into
 * ADVISORY warnings. It never blocks a scan and says nothing about classification accuracy.
 *
 * Basis: ml-training/results/calibration/lighting_calibration_2026-10-10.txt, a study on 720 real
 * dataset images with SIMULATED lighting problems (darkening, over-exposure, shading, glare). That
 * is not the same as real stalls, flash glare or a phone's auto-exposure, so every threshold here
 * is PROVISIONAL and unvalidated on a device. What the study found:
 *  - The measures are reliable to compute: a 48x48 grid reproduces them (correlation >= 0.998).
 *  - Blown highlights (share of pixels at 250 or above) separate well: at 10% or more, 1.1% of
 *    unmodified images warn (7% of Linen, 29% of microscope-style images, which are bright), and
 *    58% to 89% of simulated over-exposure is caught. Small glare spots are not caught.
 *  - Very dark (mean luma under 30) catches only extreme darkness (about 60% of images darkened
 *    to a fifth of their brightness), and 2.2% of unmodified images warn, mostly dark fabrics
 *    (Leather 7%). A dark photo cannot be told apart from dark cloth in good light.
 *  - Shading (block-to-block unevenness) is confounded by fabric pattern (12% of unmodified
 *    images exceed 0.5), so it is recorded with each scan but never used for a warning.
 * The values recorded with each scan are meant for recalibration from real phone photos.
 */
export const LIGHTING_DARK_PIXEL = 30;
export const LIGHTING_CLIP_PIXEL = 250;

/** A photo whose mean brightness (0-255) is below this gets the "very dark" notice. Provisional. */
export const LIGHTING_WARN_MEAN_LUMA_BELOW = 30;
/** A photo with at least this share of blown-out pixels gets the "bright areas" notice. Provisional. */
export const LIGHTING_WARN_CLIPPED_SHARE_AT_LEAST = 0.1;

export type LightingReading = {
  /** Mean Rec. 601 brightness, 0 (black) to 255 (white). */
  meanLuma: number;
  /** Share of pixels darker than LIGHTING_DARK_PIXEL, 0 to 1. */
  darkShare: number;
  /** Share of pixels at or above LIGHTING_CLIP_PIXEL, 0 to 1. */
  clippedShare: number;
  /** (max - min of the 3x3 block mean brightnesses) / (overall mean + 1). Recorded only. */
  unevenness: number;
};

/** Measures an RGBA image (the same layout the blur check reads). */
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
      // Pixels in the remainder rows/columns (when a side is not divisible by 3) belong to no block.
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
  /** Each photo's own reading, in capture order (null where a photo could not be measured). */
  perPhoto: (LightingReading | null)[];
  /** Advisory notices for the capture as a whole. Empty means nothing to flag (or nothing measured). */
  warnings: LightingWarning[];
};

/**
 * Judges a capture from its photos' readings. The warning uses the AVERAGE of the measured photos
 * (a burst's photos are taken a moment apart in the same light), and a photo that could not be
 * measured is ignored. Shading is never used here.
 */
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

/** Rounds a reading for storage: brightness to 0.1, shares and shading to 0.001. */
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

/** Wording for the review-screen notice. Advisory: it never mentions accuracy or blocks anything. */
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
