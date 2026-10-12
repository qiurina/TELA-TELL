import type { Image } from 'react-native-nitro-image';
import { Platform } from 'react-native';

import { preprocessRgbaForModel } from '@/features/scan/lib/ml/model-input';
import { WORKING_SIZE, imageToInputTensor } from '@/features/scan/lib/ml/preprocess';
import { rgbaPixels } from '@/features/scan/lib/preview-snapshot';

// Model input from the saved photo's raw pixels: the file is decoded and resized natively and read
// directly, skipping imageToInputTensor's full-quality JPEG re-encode, base64 and JavaScript JPEG
// decoder (about 1.5-2 s per photo on the test phone). The colour steps are the same code.
//
// Adopted for Android scans on 2026-10-12 after an offline check on the 2,923 labelled test and
// validation images: accuracy 89.1% vs 88.8% (test) and 88.8% vs 88.8% (validation) for this and
// the JPEG method, exact McNemar p = 0.29 and 1.0, i.e. no measurable difference. The two inputs
// differ by about 1 (of 255) per value on average.
//
// The file is decoded with Android's BitmapFactory, which ignores EXIF rotation. Every file the
// model reads is one the app wrote itself without a rotation flag (snapshot crops, or crops the
// image manipulator re-saved upright), so this matches what imageToInputTensor sees.

type ImageFactory = { loadFromFileAsync(filePath: string): Promise<Image> };

function nitroImages(): ImageFactory {
  // Lazy require: keeps jest from loading the native module, like react-native-fast-tflite in model.ts.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-nitro-image').Images as ImageFactory;
}

/** Same working size, same native resize filter and same colour steps as imageToInputTensor. */
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

/**
 * The model input for one saved photo, as scans use it. Android reads the raw pixels and, if they
 * cannot be read (another pixel layout, or the image library is unavailable), falls back to the
 * JPEG method for that photo. iOS always uses the JPEG method.
 */
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
