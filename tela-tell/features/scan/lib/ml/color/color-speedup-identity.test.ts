import { applyClaheLuminance, claheChannel } from '@/features/scan/lib/ml/color/clahe';
import {
  referenceClaheChannel,
  referenceClaheLuminance,
  referencePreprocess,
  referenceWhiteBalance,
} from '@/features/scan/lib/ml/color/color-reference';
import { applyGrayWorldWhiteBalance } from '@/features/scan/lib/ml/color/white-balance';
import { preprocessRgbaForModel } from '@/features/scan/lib/ml/model-input';

import fixture from '../preprocess-parity.fixture.json';

/**
 * The speed-up of white balance and CLAHE must not change a single value the model receives. These
 * compare the current code with a frozen copy of the code before the speed-up (color-reference.ts)
 * and require exact equality, unlike the training-parity test, which allows small differences.
 */

/** Deterministic pseudo-random bytes (mulberry32), so a failure can be reproduced. */
function randomBytes(seed: number, length: number): Uint8Array {
  let state = seed >>> 0;
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    out[i] = ((t ^ (t >>> 14)) >>> 0) & 255;
  }
  return out;
}

function rgba(width: number, height: number, pixel: (x: number, y: number) => number[]): Uint8Array {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      const i = (y * width + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}

function noise(width: number, height: number, seed: number): Uint8Array {
  const bytes = randomBytes(seed, width * height * 4);
  for (let i = 3; i < bytes.length; i += 4) bytes[i] = 255;
  return bytes;
}

function fromFixture(base64: string): Uint8Array {
  const rgb = new Uint8Array(Buffer.from(base64, 'base64'));
  const out = new Uint8Array((rgb.length / 3) * 4);
  for (let p = 0, i = 0, o = 0; p < rgb.length / 3; p++, i += 3, o += 4) {
    out[o] = rgb[i];
    out[o + 1] = rgb[i + 1];
    out[o + 2] = rgb[i + 2];
    out[o + 3] = 255;
  }
  return out;
}

/** Index of the first difference, or -1 when the two are identical. */
function firstDifference(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length) return 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return i;
  }
  return -1;
}

type Case = { name: string; width: number; height: number; image: () => Uint8Array };

const fixtureCases: Case[] = (fixture as { cases: { name: string; size: number; input: string }[] }).cases.map(
  (testCase) => ({
    name: `${testCase.name} (real dataset image)`,
    width: testCase.size,
    height: testCase.size,
    image: () => fromFixture(testCase.input),
  }),
);

const syntheticCases: Case[] = [
  { name: 'random noise 448x448', width: 448, height: 448, image: () => noise(448, 448, 1) },
  { name: 'random noise 448x448, other seed', width: 448, height: 448, image: () => noise(448, 448, 7) },
  {
    name: 'colour gradient 448x448',
    width: 448,
    height: 448,
    image: () => rgba(448, 448, (x, y) => [x % 256, y % 256, (x + y) % 256]),
  },
  { name: 'all black', width: 64, height: 64, image: () => rgba(64, 64, () => [0, 0, 0]) },
  { name: 'all white', width: 64, height: 64, image: () => rgba(64, 64, () => [255, 255, 255]) },
  {
    name: 'dark, low-contrast fabric-like texture',
    width: 448,
    height: 448,
    image: () => rgba(448, 448, (x, y) => [20 + ((x * 7 + y * 3) % 9), 18 + ((x + y * 5) % 7), 15 + (x % 5)]),
  },
];

describe('white balance + CLAHE speed-up gives identical model input', () => {
  for (const testCase of [...fixtureCases, ...syntheticCases]) {
    if (testCase.width % 2 !== 0 || testCase.height % 2 !== 0) continue;
    it(`whole preprocessing: ${testCase.name}`, () => {
      const expected = referencePreprocess(testCase.image(), testCase.width, testCase.height);
      const actual = preprocessRgbaForModel(testCase.image(), testCase.width, testCase.height);
      expect(firstDifference(actual, expected)).toBe(-1);
    });
  }

  it('stays identical when photos are processed one after another, as in a burst', () => {
    // Same images again, in a different order, to catch any state carried between calls.
    for (const testCase of [...syntheticCases].reverse().concat(fixtureCases)) {
      const expected = referencePreprocess(testCase.image(), testCase.width, testCase.height);
      const actual = preprocessRgbaForModel(testCase.image(), testCase.width, testCase.height);
      expect({ name: testCase.name, at: firstDifference(actual, expected) }).toEqual({
        name: testCase.name,
        at: -1,
      });
    }
  });

  it('white balance alone, odd size', () => {
    const expected = noise(37, 23, 3);
    const actual = expected.slice();
    referenceWhiteBalance(expected, 37, 23);
    applyGrayWorldWhiteBalance(actual, 37, 23);
    expect(firstDifference(actual, expected)).toBe(-1);
  });

  it('CLAHE alone, odd size and uneven tiles', () => {
    const expected = noise(101, 77, 5);
    const actual = expected.slice();
    referenceClaheLuminance(expected, 101, 77);
    applyClaheLuminance(actual, 101, 77);
    expect(firstDifference(actual, expected)).toBe(-1);
  });

  it('CLAHE channel alone, with the default and other tile grids', () => {
    const luminance = randomBytes(11, 130 * 90);
    expect(firstDifference(claheChannel(luminance, 130, 90), referenceClaheChannel(luminance, 130, 90))).toBe(
      -1,
    );
    expect(
      firstDifference(
        claheChannel(luminance, 130, 90, { clipLimit: 3, tilesX: 5, tilesY: 3 }),
        referenceClaheChannel(luminance, 130, 90, 3, 5, 3),
      ),
    ).toBe(-1);
  });
});
