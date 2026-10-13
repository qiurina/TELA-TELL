import { labToRgbPacked, rgbToLabPacked } from '@/features/scan/lib/ml/color/color-space';

export type ClaheOptions = {
  clipLimit?: number;
  tilesX?: number;
  tilesY?: number;
};

const HIST_BINS = 256;

export function claheChannel(
  L: ArrayLike<number>,
  width: number,
  height: number,
  { clipLimit = 2.0, tilesX = 8, tilesY = 8 }: ClaheOptions = {},
): Uint8ClampedArray {
  const numPixels = width * height;
  const tileW = Math.ceil(width / tilesX);
  const tileH = Math.ceil(height / tilesY);

  const tileXOf = new Int32Array(width);
  for (let x = 0; x < width; x++) {
    tileXOf[x] = Math.min((x / tileW) | 0, tilesX - 1);
  }

  const hist = new Uint32Array(tilesY * tilesX * HIST_BINS);
  for (let y = 0; y < height; y++) {
    const ty = Math.min((y / tileH) | 0, tilesY - 1);
    const rowTile = ty * tilesX;
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      hist[(rowTile + tileXOf[x]) * HIST_BINS + L[rowStart + x]]++;
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
  const tx0Of = new Int32Array(width);
  const tx1Of = new Int32Array(width);
  const wxOf = new Float64Array(width);
  const oneMinusWxOf = new Float64Array(width);
  for (let x = 0; x < width; x++) {
    const fx = x / tileW - 0.5;
    const floorX = Math.floor(fx);
    const wx = fx - floorX;
    tx0Of[x] = Math.max(floorX, 0);
    tx1Of[x] = Math.min(floorX + 1, tilesX - 1);
    wxOf[x] = wx;
    oneMinusWxOf[x] = 1 - wx;
  }

  for (let y = 0; y < height; y++) {
    const fy = y / tileH - 0.5;
    const floorY = Math.floor(fy);
    const wy = fy - floorY;
    const oneMinusWy = 1 - wy;
    const row0 = Math.max(floorY, 0) * tilesX;
    const row1 = Math.min(floorY + 1, tilesY - 1) * tilesX;
    const rowStart = y * width;

    for (let x = 0; x < width; x++) {
      const v = L[rowStart + x];
      const tx0 = tx0Of[x];
      const tx1 = tx1Of[x];
      const lut00 = luts[(row0 + tx0) * HIST_BINS + v];
      const lut10 = luts[(row0 + tx1) * HIST_BINS + v];
      const lut01 = luts[(row1 + tx0) * HIST_BINS + v];
      const lut11 = luts[(row1 + tx1) * HIST_BINS + v];

      const wx = wxOf[x];
      const oneMinusWx = oneMinusWxOf[x];
      const top = lut00 * oneMinusWx + lut10 * wx;
      const bot = lut01 * oneMinusWx + lut11 * wx;
      newL[rowStart + x] = Math.round(top * oneMinusWy + bot * wy);
    }
  }

  return newL;
}

// Port of normalize_contrast() in opencv_preprocess.py.
export function applyClaheLuminance(
  rgba: Uint8Array,
  width: number,
  height: number,
  options: ClaheOptions = {},
): void {
  const numPixels = width * height;
  const L = new Uint8ClampedArray(numPixels);
  const A = new Uint8ClampedArray(numPixels);
  const B = new Uint8ClampedArray(numPixels);

  for (let p = 0, i = 0; p < numPixels; p++, i += 4) {
    const lab = rgbToLabPacked(rgba[i], rgba[i + 1], rgba[i + 2]);
    L[p] = lab >>> 16;
    A[p] = (lab >>> 8) & 255;
    B[p] = lab & 255;
  }

  const newL = claheChannel(L, width, height, options);

  for (let p = 0, i = 0; p < numPixels; p++, i += 4) {
    const rgb = labToRgbPacked(newL[p], A[p], B[p]);
    rgba[i] = rgb >>> 16;
    rgba[i + 1] = (rgb >>> 8) & 255;
    rgba[i + 2] = rgb & 255;
  }
}
