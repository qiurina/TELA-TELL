// Port of white_balance_gray_world() in opencv_preprocess.py.
export function applyGrayWorldWhiteBalance(rgba: Uint8Array, width: number, height: number): void {
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

  const lutR = channelLut(scaleR);
  const lutG = channelLut(scaleG);
  const lutB = channelLut(scaleB);
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = lutR[rgba[i]];
    rgba[i + 1] = lutG[rgba[i + 1]];
    rgba[i + 2] = lutB[rgba[i + 2]];
  }
}

function channelLut(scale: number): Uint8Array {
  const lut = new Uint8Array(256);
  for (let value = 0; value < 256; value++) {
    lut[value] = clampTrunc(value * scale);
  }
  return lut;
}

function clampTrunc(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.trunc(value);
}