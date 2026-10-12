import { labToRgb8u, rgbToLab8u } from '@/features/scan/lib/ml/color/color-space';
import { downscaleRgbaByTwo } from '@/features/scan/lib/ml/color/resample';

// FROZEN COPY of the colour preprocessing as it was before the speed-up (white-balance.ts and
// clahe.ts at commit ebf1220), used only by tests to prove the faster code gives byte-for-byte the
// same model input. Never import this from app code, and never "fix" it: it is the yardstick.

const HIST_BINS = 256;

function clampTrunc(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.trunc(value);
}

export function referenceWhiteBalance(rgba: Uint8Array, width: number, height: number): void {
  const numPixels = width * height;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    sumR += rgba[i];
    sumG += rgba[i + 1];
    sumB += rgba[i + 2];
  }
  const meanR = sumR / numPixels;
  const meanG = sumG / numPixels;
  const meanB = sumB / numPixels;
  const grayMean = (meanR + meanG + meanB) / 3;
  const scaleR = meanR > 0 ? grayMean / meanR : 1;
  const scaleG = meanG > 0 ? grayMean / meanG : 1;
  const scaleB = meanB > 0 ? grayMean / meanB : 1;
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = clampTrunc(rgba[i] * scaleR);
    rgba[i + 1] = clampTrunc(rgba[i + 1] * scaleG);
    rgba[i + 2] = clampTrunc(rgba[i + 2] * scaleB);
  }
}

export function referenceClaheChannel(
  L: ArrayLike<number>,
  width: number,
  height: number,
  clipLimit = 2.0,
  tilesX = 8,
  tilesY = 8,
): Uint8ClampedArray {
  const numPixels = width * height;
  const tileW = Math.ceil(width / tilesX);
  const tileH = Math.ceil(height / tilesY);
  const hist = new Uint32Array(tilesY * tilesX * HIST_BINS);
  for (let y = 0; y < height; y++) {
    const ty = Math.min((y / tileH) | 0, tilesY - 1);
    for (let x = 0; x < width; x++) {
      const tx = Math.min((x / tileW) | 0, tilesX - 1);
      hist[(ty * tilesX + tx) * HIST_BINS + L[y * width + x]]++;
    }
  }
  const luts = new Uint8ClampedArray(tilesY * tilesX * HIST_BINS);
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const base = (ty * tilesX + tx) * HIST_BINS;
      const tilePixels = Math.min(tileW, width - tx * tileW) * Math.min(tileH, height - ty * tileH);
      const clipAbs = Math.max(1, Math.trunc((clipLimit * tilePixels) / HIST_BINS));
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
    const fy = y / tileH - 0.5;
    const floorY = Math.floor(fy);
    const wy = fy - floorY;
    const ty0 = Math.max(floorY, 0);
    const ty1 = Math.min(floorY + 1, tilesY - 1);
    for (let x = 0; x < width; x++) {
      const fx = x / tileW - 0.5;
      const floorX = Math.floor(fx);
      const wx = fx - floorX;
      const tx0 = Math.max(floorX, 0);
      const tx1 = Math.min(floorX + 1, tilesX - 1);
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
  return newL;
}

export function referenceClaheLuminance(rgba: Uint8Array, width: number, height: number): void {
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
  const newL = referenceClaheChannel(L, width, height);
  for (let p = 0, i = 0; p < numPixels; p++, i += 4) {
    const [r, g, b] = labToRgb8u(newL[p], A[p], B[p]);
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
  }
}

/** preprocessRgbaForModel as it was: white balance, CLAHE, 2:1 downscale, pack to RGB floats. */
export function referencePreprocess(rgba: Uint8Array, width: number, height: number): Float32Array {
  referenceWhiteBalance(rgba, width, height);
  referenceClaheLuminance(rgba, width, height);
  const reduced = downscaleRgbaByTwo(rgba, width, height);
  const tensor = new Float32Array(reduced.width * reduced.height * 3);
  let t = 0;
  for (let i = 0; i < reduced.data.length; i += 4) {
    tensor[t++] = reduced.data[i];
    tensor[t++] = reduced.data[i + 1];
    tensor[t++] = reduced.data[i + 2];
  }
  return tensor;
}
