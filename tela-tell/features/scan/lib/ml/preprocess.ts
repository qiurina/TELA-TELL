import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { IMAGE_SIZE } from '@/features/scan/lib/ml/constants';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToUint8Array(base64: string): Uint8Array {
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

export async function imageToInputTensor(uri: string): Promise<Float32Array> {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } }],
    { base64: true, compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );

  if (!resized.base64) {
    throw new Error('Failed to read resized image data for model input.');
  }

  const jpegBytes = base64ToUint8Array(resized.base64);
  const decoded = jpeg.decode(jpegBytes, { useTArray: true });

  const tensor = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * 3);
  let tensorIndex = 0;
  for (let i = 0; i < decoded.data.length; i += 4) {
    tensor[tensorIndex++] = decoded.data[i] / 127.5 - 1;
    tensor[tensorIndex++] = decoded.data[i + 1] / 127.5 - 1;
    tensor[tensorIndex++] = decoded.data[i + 2] / 127.5 - 1;
  }

  return tensor;
}