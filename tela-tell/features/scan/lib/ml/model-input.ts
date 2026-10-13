import { applyClaheLuminance } from '@/features/scan/lib/ml/color/clahe';
import { downscaleRgbaByTwo } from '@/features/scan/lib/ml/color/resample';
import { applyGrayWorldWhiteBalance } from '@/features/scan/lib/ml/color/white-balance';

// Same order as ml-training/common/opencv_preprocess.py; the model normalizes internally.
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
