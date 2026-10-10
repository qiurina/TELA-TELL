import jpeg from 'jpeg-js';

import { BLUR_REJECT_VARIANCE, judgeSharpness, measureRgbaSharpness } from '@/features/scan/lib/ml/sharpness';
import {
  checkCapture,
  checkCaptureSharpness,
} from '@/features/scan/lib/ml/measure-sharpness';

// The image libraries' native resize is replaced: each "photo" is a small in-memory JPEG chosen by
// its uri. What is checked is how checkCapture combines the two checks, not the phone's resizing.
const mockPhotos = new Map<string, string | null>();

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  manipulateAsync: jest.fn(async (uri: string) => {
    if (!mockPhotos.has(uri)) {
      throw new Error('cannot read photo');
    }
    return { base64: mockPhotos.get(uri) ?? undefined };
  }),
}));

function makeJpeg(size: number, pixel: (x: number, y: number) => [number, number, number]): string {
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = pixel(x, y);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return Buffer.from(jpeg.encode({ data, width: size, height: size }, 95).data).toString('base64');
}

// Fine pixel-level texture: sharp. A flat image: no detail at all.
const texture = (x: number, y: number): [number, number, number] => {
  const v = (Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663)) >>> 24;
  return [v, v, v];
};

beforeEach(() => {
  mockPhotos.clear();
});

describe('checkCapture', () => {
  it('gives the same blur verdict as checkCaptureSharpness, whatever the lighting', async () => {
    mockPhotos.set('sharp-bright', makeJpeg(96, (x, y) => texture(x, y).map((v) => Math.min(255, v + 120)) as [number, number, number]));
    mockPhotos.set('flat-gray', makeJpeg(96, () => [120, 120, 120]));

    for (const uris of [['sharp-bright'], ['flat-gray'], ['flat-gray', 'sharp-bright', 'flat-gray']]) {
      const both = await checkCapture(uris);
      const blurOnly = await checkCaptureSharpness(uris);
      expect(both.verdict).toEqual(blurOnly);
    }
    // And the verdicts themselves are what the cutoff of 100 says.
    expect((await checkCapture(['flat-gray'])).verdict.blurry).toBe(true);
    expect((await checkCapture(['sharp-bright'])).verdict.blurry).toBe(false);
    expect(BLUR_REJECT_VARIANCE).toBe(100);
  });

  it('reports each photo\'s own sharpness and lighting, in capture order', async () => {
    mockPhotos.set('dark', makeJpeg(96, () => [8, 8, 8]));
    mockPhotos.set('white', makeJpeg(96, () => [255, 255, 255]));
    mockPhotos.set('mid', makeJpeg(96, () => [128, 128, 128]));

    const { verdict, lighting } = await checkCapture(['dark', 'white', 'mid']);

    expect(verdict.readings).toHaveLength(3);
    expect(lighting.perPhoto).toHaveLength(3);
    expect(lighting.perPhoto[0]?.meanLuma).toBeLessThan(15);
    expect(lighting.perPhoto[1]?.clippedShare).toBeGreaterThan(0.95);
    expect(lighting.perPhoto[2]?.meanLuma).toBeGreaterThan(120);
    // Sharpness readings agree with measuring the same decoded pixels directly.
    const direct = measureRgbaSharpness(
      jpeg.decode(Buffer.from(mockPhotos.get('mid')!, 'base64'), { useTArray: true }).data,
      96,
      96,
    );
    expect(verdict.readings[2]).toBeCloseTo(direct, 6);
  });

  it('raises the advisory notices from the lighting readings without touching the blur verdict', async () => {
    mockPhotos.set('very-dark', makeJpeg(96, (x, y) => texture(x, y).map((v) => Math.floor(v / 20)) as [number, number, number]));
    mockPhotos.set('blown', makeJpeg(96, () => [255, 255, 255]));

    expect((await checkCapture(['very-dark'])).lighting.warnings).toEqual(['very_dark']);
    expect((await checkCapture(['blown'])).lighting.warnings).toEqual(['bright_areas']);
  });

  it('never fails a capture because a photo cannot be read: that photo has no readings and nothing blocks', async () => {
    mockPhotos.set('ok', makeJpeg(96, texture));
    mockPhotos.set('empty', null);

    const result = await checkCapture(['missing-file', 'empty', 'ok']);

    expect(result.verdict.readings[0]).toBeNull();
    expect(result.verdict.readings[1]).toBeNull();
    expect(typeof result.verdict.readings[2]).toBe('number');
    expect(result.lighting.perPhoto.slice(0, 2)).toEqual([null, null]);
    expect(result.lighting.perPhoto[2]).not.toBeNull();
    expect(judgeSharpness(result.verdict.readings).measured).toBe(true);

    const none = await checkCapture(['missing-file']);
    expect(none.verdict).toMatchObject({ measured: false, blurry: false, sharpest: null });
    expect(none.lighting).toEqual({ perPhoto: [null], warnings: [] });
  });
});
