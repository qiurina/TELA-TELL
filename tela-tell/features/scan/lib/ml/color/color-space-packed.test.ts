import {
  labToRgb8u,
  labToRgbPacked,
  rgbToLab8u,
  rgbToLabPacked,
} from '@/features/scan/lib/ml/color/color-space';

/**
 * The packed conversions replace rgbToLab8u / labToRgb8u in the CLAHE loops for speed, so they must
 * agree on every possible input.
 *
 * Normal runs check a fixed sample (about 2 s): edge values, the grey axis, full sweeps of each
 * channel, 300,000 fixed pseudo-random inputs, and complete blocks where the formulas switch
 * branches: every RGB colour with all channels in 0-31 (rgbToLab's dark branch), and every LAB input
 * with L in 0-15 (labToRgb's dark-output branch). A random sample alone is not enough there: a
 * deliberate 0.01% change to the dark-output branch altered only 22 of the 16.7M outputs, all with
 * L 3-15, and 300,000 random inputs would catch that only about one run in three.
 *
 * The full proof checks all 16,777,216 inputs per direction (about 40 s). Run it after any change to
 * color-space.ts:
 *   PowerShell:  $env:FULL_COLOR_TEST='1'; npx jest color-space-packed; Remove-Item Env:FULL_COLOR_TEST
 *   bash:        FULL_COLOR_TEST=1 npx jest color-space-packed
 */
const FULL = process.env.FULL_COLOR_TEST === '1';

type Triple = [number, number, number];
type Convert = (x: number, y: number, z: number) => number;
type Original = (x: number, y: number, z: number) => Triple;

function mismatch(packed: Convert, original: Original, x: number, y: number, z: number): string | null {
  const [p, q, r] = original(x, y, z);
  const got = packed(x, y, z);
  return got === ((p << 16) | (q << 8) | r) ? null : `(${x}, ${y}, ${z}): packed ${got}, original ${p}/${q}/${r}`;
}

function firstMismatchExhaustive(packed: Convert, original: Original): string | null {
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      for (let z = 0; z < 256; z++) {
        const found = mismatch(packed, original, x, y, z);
        if (found) return found;
      }
    }
  }
  return null;
}

/** The fixed sample used by normal runs; the same inputs every time, so failures reproduce. */
function sampleInputs(): Triple[] {
  const inputs: Triple[] = [];
  const edges = [0, 1, 2, 127, 128, 254, 255];
  for (const x of edges) for (const y of edges) for (const z of edges) inputs.push([x, y, z]);
  for (let v = 0; v < 256; v++) {
    inputs.push([v, v, v]);
    for (const a of [0, 128, 255]) {
      for (const b of [0, 128, 255]) {
        inputs.push([v, a, b], [a, v, b], [a, b, v]);
      }
    }
  }
  let state = 0x2545f491;
  for (let i = 0; i < 300_000; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    inputs.push([state >>> 24, (state >>> 16) & 255, (state >>> 8) & 255]);
  }
  return inputs;
}

/** Every input whose first value is below `firstBelow` and the other two below `restBelow`. */
function firstMismatchInBlock(
  packed: Convert,
  original: Original,
  firstBelow: number,
  restBelow: number,
): string | null {
  for (let x = 0; x < firstBelow; x++) {
    for (let y = 0; y < restBelow; y++) {
      for (let z = 0; z < restBelow; z++) {
        const found = mismatch(packed, original, x, y, z);
        if (found) return found;
      }
    }
  }
  return null;
}

function firstMismatchSample(packed: Convert, original: Original): string | null {
  for (const [x, y, z] of sampleInputs()) {
    const found = mismatch(packed, original, x, y, z);
    if (found) return found;
  }
  return null;
}

describe('packed colour conversions match the originals', () => {
  describe('fixed sample (every run)', () => {
    it('covers edges, the grey axis, channel sweeps and 300,000 fixed inputs', () => {
      const inputs = sampleInputs();
      expect(inputs.length).toBe(343 + 256 * 28 + 300_000);
      const distinct = new Set(inputs.map(([x, y, z]) => (x << 16) | (y << 8) | z));
      // The pseudo-random part spreads over the whole cube rather than repeating a few colours.
      expect(distinct.size).toBeGreaterThan(250_000);
    });

    it('rgbToLabPacked = rgbToLab8u', () => {
      expect(firstMismatchSample(rgbToLabPacked, rgbToLab8u)).toBeNull();
    });

    it('labToRgbPacked = labToRgb8u', () => {
      expect(firstMismatchSample(labToRgbPacked, labToRgb8u)).toBeNull();
    });

    it('rgbToLabPacked = rgbToLab8u for every colour with all channels in 0-31 (dark branch)', () => {
      expect(firstMismatchInBlock(rgbToLabPacked, rgbToLab8u, 32, 32)).toBeNull();
    });

    it('labToRgbPacked = labToRgb8u for every input with L in 0-15 (dark-output branch)', () => {
      expect(firstMismatchInBlock(labToRgbPacked, labToRgb8u, 16, 256)).toBeNull();
    });
  });

  // Exhaustive over 16.7M inputs per direction; only with FULL_COLOR_TEST=1.
  const exhaustive = FULL ? describe : describe.skip;
  const EXHAUSTIVE_TIMEOUT_MS = 120_000;
  exhaustive('every input (FULL_COLOR_TEST=1)', () => {
    it(
      'rgbToLabPacked = rgbToLab8u for all 16.7M colours',
      () => {
        expect(firstMismatchExhaustive(rgbToLabPacked, rgbToLab8u)).toBeNull();
      },
      EXHAUSTIVE_TIMEOUT_MS,
    );

    it(
      'labToRgbPacked = labToRgb8u for all 16.7M LAB triples',
      () => {
        expect(firstMismatchExhaustive(labToRgbPacked, labToRgb8u)).toBeNull();
      },
      EXHAUSTIVE_TIMEOUT_MS,
    );
  });
});
