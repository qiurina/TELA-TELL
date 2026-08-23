/**
 * Gray World white balance — direct port of ml-training/opencv_preprocess.py's
 * white_balance_gray_world(), so on-device inference sees the same color-corrected
 * input the model was trained on. Scales each channel so its mean matches the
 * overall gray mean, correcting lighting color casts.
 */
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

  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = clampTrunc(rgba[i] * scaleR);
    rgba[i + 1] = clampTrunc(rgba[i + 1] * scaleG);
    rgba[i + 2] = clampTrunc(rgba[i + 2] * scaleB);
  }
}

/** Matches numpy's np.clip(...).astype(uint8), which truncates rather than rounds. */
function clampTrunc(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.trunc(value);
}