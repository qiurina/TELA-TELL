import { labToRgb8u, rgbToLab8u } from '@/features/scan/lib/ml/color/color-space';

/**
 * CLAHE on the LAB luminance channel, matching ml-training/opencv_preprocess.py's
 * normalize_contrast() (cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))).
 * Real CLAHE, not naive per-tile equalization: tile histograms with clip +
 * redistribute, then bilinear interpolation between the 4 nearest tile LUTs per
 * pixel — the interpolation is what avoids visible tile-boundary artifacts.
 * O(pixels) throughout: one histogram pass, a fixed tiles*256 clip/LUT step, one
 * interpolation pass.
 */
export type ClaheOptions = {
  clipLimit?: number;
  tilesX?: number;
  tilesY?: number;
};

const HIST_BINS = 256;

export function applyClaheLuminance(
  rgba: Uint8Array,
  width: number,
  height: number,
  { clipLimit = 2.0, tilesX = 8, tilesY = 8 }: ClaheOptions = {},
): void {
  const numPixels = width * height;
  const L = new Uint8ClampedArray(numPixels);
  const A = new Uint8ClampedArray(numPixels);
  const B = new Uint8ClampedArray(numPixels);

  for (let p = 0, i = 0; p < numPixels; p++, i += 4) {
    const [l, a, b] = rgbToLab8u(rgba[i], rgba[i + 1], rgba[i + 2]);
    L[p] = l;
    A[p] = a;
    B[p] = b;
  }

  const tileW = Math.ceil(width / tilesX);
  const tileH = Math.ceil(height / tilesY);

  const hist = new Uint32Array(tilesY * tilesX * HIST_BINS);
  for (let y = 0; y < height; y++) {
    const ty = Math.min((y / tileH) | 0, tilesY - 1);
    for (let x = 0; x < width; x++) {
      const tx = Math.min((x / tileW) | 0, tilesX - 1);
      const tileIdx = ty * tilesX + tx;
      hist[tileIdx * HIST_BINS + L[y * width + x]]++;
    }
  }

  const luts = new Uint8ClampedArray(tilesY * tilesX * HIST_BINS);
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileIdx = ty * tilesX + tx;
      const base = tileIdx * HIST_BINS;
      const actualTileW = Math.min(tileW, width - tx * tileW);
      const actualTileH = Math.min(tileH, height - ty * tileH);
      const tilePixels = actualTileW * actualTileH;

      const clipAbs = Math.max(1, Math.round((clipLimit * tilePixels) / HIST_BINS));

      let clipped = 0;
      const tileHist = new Int32Array(HIST_BINS);
      for (let b = 0; b < HIST_BINS; b++) {
        const v = hist[base + b];
        if (v > clipAbs) {
          clipped += v - clipAbs;
          tileHist[b] = clipAbs;
        } else {
          tileHist[b] = v;
        }
      }

      const redistBatch = (clipped / HIST_BINS) | 0;
      let residual = clipped - redistBatch * HIST_BINS;
      for (let b = 0; b < HIST_BINS; b++) tileHist[b] += redistBatch;
      if (residual > 0) {
        const step = Math.max((HIST_BINS / residual) | 0, 1);
        for (let b = 0; b < HIST_BINS && residual > 0; b += step) {
          tileHist[b]++;
          residual--;
        }
      }

      let cumsum = 0;
      const scale = 255 / tilePixels;
      for (let b = 0; b < HIST_BINS; b++) {
        cumsum += tileHist[b];
        luts[base + b] = Math.round(cumsum * scale);
      }
    }
  }

  const newL = new Uint8ClampedArray(numPixels);
  for (let y = 0; y < height; y++) {
    const fy = (y - tileH / 2) / tileH;
    const ty0 = clampInt(Math.floor(fy), 0, tilesY - 1);
    const ty1 = clampInt(ty0 + 1, 0, tilesY - 1);
    const wy = clamp01(fy - Math.floor(fy));

    for (let x = 0; x < width; x++) {
      const fx = (x - tileW / 2) / tileW;
      const tx0 = clampInt(Math.floor(fx), 0, tilesX - 1);
      const tx1 = clampInt(tx0 + 1, 0, tilesX - 1);
      const wx = clamp01(fx - Math.floor(fx));

      const v = L[y * width + x];
      const lut00 = luts[(ty0 * tilesX + tx0) * HIST_BINS + v];
      const lut10 = luts[(ty0 * tilesX + tx1) * HIST_BINS + v];
      const lut01 = luts[(ty1 * tilesX + tx0) * HIST_BINS + v];
      const lut11 = luts[(ty1 * tilesX + tx1) * HIST_BINS + v];

      const top = lut00 * (1 - wx) + lut10 * wx;
      const bot = lut01 * (1 - wx) + lut11 * wx;
      newL[y * width + x] = Math.round(top * (1 - wy) + bot * wy);
    }
  }

  for (let p = 0, i = 0; p < numPixels; p++, i += 4) {
    const [r, g, b] = labToRgb8u(newL[p], A[p], B[p]);
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
  }
}

function clampInt(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}