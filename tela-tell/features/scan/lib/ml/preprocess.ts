import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { IMAGE_SIZE } from '@/features/scan/lib/ml/constants';
import { preprocessRgbaForModel } from '@/features/scan/lib/ml/model-input';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const byteLength = Math.floor((clean.length * 6) / 8);
  const bytes = new Uint8Array(byteLength);

  let byteIndex = 0;
  let buffer = 0;
  let bitsInBuffer = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const value = BASE64_CHARS.indexOf(clean[i]);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bitsInBuffer += 6;
    if (bitsInBuffer >= 8) {
      bitsInBuffer -= 8;
      bytes[byteIndex++] = (buffer >> bitsInBuffer) & 0xff;
    }
  }

  return bytes;
}

export const WORKING_SIZE = IMAGE_SIZE * 2;

export async function imageToInputTensor(uri: string): Promise<Float32Array> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: WORKING_SIZE, height: WORKING_SIZE } }],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );

  if (!resized.base64) {
    throw new Error('Failed to read resized image data for model input.');
  }

  const jpegBytes = base64ToUint8Array(resized.base64);
  const decoded = jpeg.decode(jpegBytes, { useTArray: true });

  if (decoded.width !== WORKING_SIZE || decoded.height !== WORKING_SIZE) {
    throw new Error(`Unexpected working image size ${decoded.width}x${decoded.height}.`);
  }

  return preprocessRgbaForModel(decoded.data, decoded.width, decoded.height);
}