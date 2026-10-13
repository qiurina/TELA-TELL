import type { Image } from 'react-native-nitro-image';
import { Platform } from 'react-native';

import { preprocessRgbaForModel } from '@/features/scan/lib/ml/model-input';
import { WORKING_SIZE, imageToInputTensor } from '@/features/scan/lib/ml/preprocess';
import { rgbaPixels } from '@/features/scan/lib/preview-snapshot';

// Validated 2026-10-12: same accuracy as the JPEG path (McNemar p = 0.29).
type ImageFactory = { loadFromFileAsync(filePath: string): Promise<Image> };

function nitroImages(): ImageFactory {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-nitro-image').Images as ImageFactory;
}

export async function imageToInputTensorRaw(uri: string): Promise<Float32Array> {
  const image = await nitroImages().loadFromFileAsync(uri);
  const resized = await image.resizeAsync(WORKING_SIZE, WORKING_SIZE);
  const raw = await resized.toRawPixelDataAsync();
  const rgba = rgbaPixels(raw);
  if (!rgba || raw.width !== WORKING_SIZE || raw.height !== WORKING_SIZE) {
    throw new Error(`Unreadable raw pixels (${raw.pixelFormat}, ${raw.width}x${raw.height}).`);
  }
  return preprocessRgbaForModel(rgba, WORKING_SIZE, WORKING_SIZE);
}

export async function imageToModelInput(uri: string): Promise<Float32Array> {
  if (Platform.OS === 'android') {
    try {
      return await imageToInputTensorRaw(uri);
    } catch (error) {
      console.warn('[TELA-TELL] raw-pixel model input unavailable, using the JPEG method:', error);
    }
  }
  return imageToInputTensor(uri);
}
