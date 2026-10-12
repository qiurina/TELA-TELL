import { Platform } from 'react-native';

import { imageToInputTensor } from '@/features/scan/lib/ml/preprocess';
import { imageToModelInput } from '@/features/scan/lib/ml/preprocess-raw';

// Which preparation a scan uses: raw pixels on Android, the JPEG method as the fallback and on iOS.
// The native image library and the JPEG method are replaced; the colour steps run for real on a
// small synthetic image only where the raw path succeeds.

jest.mock('@/features/scan/lib/ml/preprocess', () => ({
  WORKING_SIZE: 448,
  imageToInputTensor: jest.fn(async () => new Float32Array([1, 2, 3])),
}));

const mockLoad = jest.fn();
jest.mock('react-native-nitro-image', () => ({ Images: { loadFromFileAsync: (...args: unknown[]) => mockLoad(...args) } }), {
  virtual: true,
});

/** A fake native image whose resize returns 448x448 pixels in the given layout. */
function fakeImage(pixelFormat: string) {
  const bytes = new Uint8Array(448 * 448 * 4).fill(128);
  const resized = {
    toRawPixelDataAsync: async () => ({ buffer: bytes.buffer, width: 448, height: 448, pixelFormat }),
  };
  return { resizeAsync: async () => resized };
}

describe('imageToModelInput', () => {
  const originalOS = Platform.OS;
  afterEach(() => {
    jest.replaceProperty(Platform, 'OS', originalOS);
    jest.clearAllMocks();
  });

  it('uses the raw pixels on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockLoad.mockResolvedValue(fakeImage('RGBA'));
    const tensor = await imageToModelInput('file:///photo.jpg');
    expect(mockLoad).toHaveBeenCalledWith('file:///photo.jpg');
    expect(tensor).toHaveLength(224 * 224 * 3);
    expect(imageToInputTensor).not.toHaveBeenCalled();
  });

  it('falls back to the JPEG method on Android when the pixels are in another layout', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockLoad.mockResolvedValue(fakeImage('BGRA'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(imageToModelInput('file:///photo.jpg')).resolves.toEqual(new Float32Array([1, 2, 3]));
    expect(imageToInputTensor).toHaveBeenCalledWith('file:///photo.jpg');
  });

  it('falls back to the JPEG method on Android when the image cannot be loaded', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mockLoad.mockRejectedValue(new Error('Failed to load Image from file!'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(imageToModelInput('file:///photo.jpg')).resolves.toEqual(new Float32Array([1, 2, 3]));
    expect(imageToInputTensor).toHaveBeenCalledTimes(1);
  });

  it('keeps the JPEG method on iOS and never touches the raw path', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await expect(imageToModelInput('file:///photo.jpg')).resolves.toEqual(new Float32Array([1, 2, 3]));
    expect(mockLoad).not.toHaveBeenCalled();
  });
});
