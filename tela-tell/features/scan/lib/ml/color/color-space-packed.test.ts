import {
  labToRgb8u,
  labToRgbPacked,
  rgbToLab8u,
  rgbToLabPacked,
} from '@/features/scan/lib/ml/color/color-space';

/**
 * The packed conversions replace rgbToLab8u / labToRgb8u in the CLAHE loops for speed, so they must
 * agree on every possible input. Both take three 8-bit values, so all 16,777,216 inputs are checked.
 */

// Exhaustive over 16.7M inputs per direction; generous timeout for slow CI machines.
const EXHAUSTIVE_TIMEOUT_MS = 120_000;

function firstMismatch(
  packed: (x: number, y: number, z: number) => number,
  original: (x: number, y: number, z: number) => [number, number, number],
): string | null {
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      for (let z = 0; z < 256; z++) {
        const [p, q, r] = original(x, y, z);
        if (packed(x, y, z) !== ((p << 16) | (q << 8) | r)) {
          return `(${x}, ${y}, ${z}): packed ${packed(x, y, z)}, original ${p}/${q}/${r}`;
        }
      }
    }
  }
  return null;
}

describe('packed colour conversions match the originals on every input', () => {
  it(
    'rgbToLabPacked = rgbToLab8u for all 16.7M colours',
    () => {
      expect(firstMismatch(rgbToLabPacked, rgbToLab8u)).toBeNull();
    },
    EXHAUSTIVE_TIMEOUT_MS,
  );

  it(
    'labToRgbPacked = labToRgb8u for all 16.7M LAB triples',
    () => {
      expect(firstMismatch(labToRgbPacked, labToRgb8u)).toBeNull();
    },
    EXHAUSTIVE_TIMEOUT_MS,
  );
});
