import {
  BLUR_REJECT_VARIANCE,
  judgeSharpness,
  measureRgbaSharpness,
} from '@/features/scan/lib/ml/sharpness';

function makeRgba(
  width: number,
  height: number,
  pixel: (x: number, y: number) => [number, number, number],
): Uint8Array {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = pixel(x, y);
      const i = (y * width + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

/** Repeated 3x3 box blur: a crude stand-in for defocus. */
function boxBlur(rgba: Uint8Array, width: number, height: number, passes: number): Uint8Array {
  let current = rgba;
  for (let pass = 0; pass < passes; pass += 1) {
    const next = new Uint8Array(current.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        for (let c = 0; c < 3; c += 1) {
          let sum = 0;
          let count = 0;
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              const nx = Math.min(width - 1, Math.max(0, x + dx));
              const ny = Math.min(height - 1, Math.max(0, y + dy));
              sum += current[(ny * width + nx) * 4 + c];
              count += 1;
            }
          }
          next[(y * width + x) * 4 + c] = Math.round(sum / count);
        }
        next[(y * width + x) * 4 + 3] = 255;
      }
    }
    current = next;
  }
  return current;
}

describe('measureRgbaSharpness', () => {
  // Expected values come from the NumPy port in ml-training/scripts/evaluation/
  // sharpness_calibration.py (sharpness_signals), run on the same synthetic images. That port is
  // what the thresholds were studied with, so these two must agree.
  it('matches the NumPy port used to study the thresholds (square image)', () => {
    const rgba = makeRgba(96, 96, (x, y) => [(x * 7 + y * 13) % 256, ((x * 3) ^ (y * 5)) % 256, (x * y) % 256]);
    expect(measureRgbaSharpness(rgba, 96, 96)).toBeCloseTo(3326.9951677917097, 6);
  });

  it('matches the NumPy port used to study the thresholds (non-square image)', () => {
    const rgba = makeRgba(120, 72, (x, y) => [(x * 5 + y * 11) % 256, ((x * 9) ^ (y * 3)) % 256, (x * y + 7) % 256]);
    expect(measureRgbaSharpness(rgba, 120, 72)).toBeCloseTo(3730.658317580339, 6);
  });

  it('reads zero for a flat image', () => {
    const rgba = makeRgba(96, 96, () => [120, 120, 120]);
    expect(measureRgbaSharpness(rgba, 96, 96)).toBe(0);
  });

  it('reads lower for a blurred copy of the same image', () => {
    // Pixel-level pseudo-random texture. (A regular pattern would alias against the metric's
    // 48x48 sampling grid and read as flat.)
    const sharp = makeRgba(96, 96, (x, y) => {
      const v = (Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663)) >>> 24;
      return [v, v, v];
    });
    const blurred = boxBlur(sharp, 96, 96, 10);
    const sharpReading = measureRgbaSharpness(sharp, 96, 96);
    expect(sharpReading).toBeGreaterThan(BLUR_REJECT_VARIANCE);
    expect(measureRgbaSharpness(blurred, 96, 96)).toBeLessThan(sharpReading / 2);
  });

  it('reads from a view with a byte offset, not the whole backing buffer', () => {
    const rgba = makeRgba(96, 96, (x, y) => [(x * 7 + y * 13) % 256, ((x * 3) ^ (y * 5)) % 256, (x * y) % 256]);
    const backing = new Uint8Array(rgba.length + 64);
    backing.set(rgba, 64);
    const view = backing.subarray(64);
    expect(measureRgbaSharpness(view, 96, 96)).toBeCloseTo(3326.9951677917097, 6);
  });
});

describe('judgeSharpness', () => {
  it('passes a capture whose sharpest frame is at or above the threshold', () => {
    expect(judgeSharpness([BLUR_REJECT_VARIANCE])).toEqual({
      sharpest: BLUR_REJECT_VARIANCE,
      blurry: false,
      measured: true,
      readings: [BLUR_REJECT_VARIANCE],
    });
  });

  it('flags a capture whose sharpest frame is below the threshold', () => {
    expect(judgeSharpness([BLUR_REJECT_VARIANCE - 1, 3])).toEqual({
      sharpest: BLUR_REJECT_VARIANCE - 1,
      blurry: true,
      measured: true,
      readings: [BLUR_REJECT_VARIANCE - 1, 3],
    });
  });

  it('keeps the cutoff at 100', () => {
    expect(BLUR_REJECT_VARIANCE).toBe(100);
  });

  it('keeps every photo\'s own reading, in capture order, including ones that could not be measured', () => {
    const input = [812.4, null, 95.2];
    const verdict = judgeSharpness(input);
    expect(verdict.readings).toEqual([812.4, null, 95.2]);
    expect(verdict.sharpest).toBe(812.4);
    // A copy, so later changes to the input cannot alter what was judged.
    expect(verdict.readings).not.toBe(input);
  });

  it('does not change the verdict because per-photo readings are kept', () => {
    // One sharp frame still lets the burst pass; all-low still flags it.
    expect(judgeSharpness([20, 30, 5000]).blurry).toBe(false);
    expect(judgeSharpness([20, 30, 99.9]).blurry).toBe(true);
  });

  it('passes a burst when any one frame is sharp enough', () => {
    expect(judgeSharpness([5, 2400, 12]).blurry).toBe(false);
    expect(judgeSharpness([5, 2400, 12]).sharpest).toBe(2400);
  });

  it('never blocks a scan when nothing could be measured', () => {
    expect(judgeSharpness([null, null])).toEqual({
      sharpest: null,
      blurry: false,
      measured: false,
      readings: [null, null],
    });
    expect(judgeSharpness([])).toEqual({ sharpest: null, blurry: false, measured: false, readings: [] });
    expect(judgeSharpness([Number.NaN])).toMatchObject({ sharpest: null, blurry: false, measured: false });
  });

  it('ignores frames that failed to measure when judging the rest', () => {
    expect(judgeSharpness([null, 40])).toMatchObject({ blurry: true, sharpest: 40 });
    expect(judgeSharpness([null, 500])).toMatchObject({ blurry: false, sharpest: 500 });
  });

  it('accepts a custom threshold', () => {
    expect(judgeSharpness([150], 200).blurry).toBe(true);
    expect(judgeSharpness([150], 100).blurry).toBe(false);
  });
});
