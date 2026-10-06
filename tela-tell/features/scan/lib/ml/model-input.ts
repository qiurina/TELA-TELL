import { applyClaheLuminance } from '@/features/scan/lib/ml/color/clahe';
import { downscaleRgbaByTwo } from '@/features/scan/lib/ml/color/resample';
import { applyGrayWorldWhiteBalance } from '@/features/scan/lib/ml/color/white-balance';

/**
 * Colour preprocessing, in the same order as training (ml-training/common/opencv_preprocess.py):
 * Gray World white balance, then CLAHE, then the downscale to model size. Training does the
 * colour steps at the image's own (large) resolution and resizes last, so the caller passes a
 * working image at twice the model size and this reduces it with an exact 2:1 area average, the
 * same as cv2.resize(..., INTER_AREA). Doing white balance and CLAHE after shrinking to 224 (as
 * the app used to) changes the CLAHE tile statistics the model was trained on.
 *
 * Returns raw 0-255 RGB floats, HWC. The model normalizes inside its own graph.
 *
 * `rgba` is modified in place.
 */
export function preprocessRgbaForModel(
  rgba: Uint8Array,
  width: number,
  height: number,
): Float32Array {
  applyGrayWorldWhiteBalance(rgba, width, height);
  applyClaheLuminance(rgba, width, height, { clipLimit: 2.0, tilesX: 8, tilesY: 8 });
  const reduced = downscaleRgbaByTwo(rgba, width, height);

  const tensor = new Float32Array(reduced.width * reduced.height * 3);
  let tensorIndex = 0;
  for (let i = 0; i < reduced.data.length; i += 4) {
    tensor[tensorIndex++] = reduced.data[i];
    tensor[tensorIndex++] = reduced.data[i + 1];
    tensor[tensorIndex++] = reduced.data[i + 2];
  }
  return tensor;
}
