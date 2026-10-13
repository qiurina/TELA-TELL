import { preprocessRgbaForModel } from '@/features/scan/lib/ml/model-input';

import fixture from './preprocess-parity.fixture.json';

type ParityCase = { name: string; size: number; input: string; expected: string };

function rgbToRgba(rgb: Uint8Array): Uint8Array {
  const rgba = new Uint8Array((rgb.length / 3) * 4);
  for (let p = 0, i = 0, o = 0; p < rgb.length / 3; p++, i += 3, o += 4) {
    rgba[o] = rgb[i];
    rgba[o + 1] = rgb[i + 1];
    rgba[o + 2] = rgb[i + 2];
    rgba[o + 3] = 255;
  }
  return rgba;
}

describe('app preprocessing matches the training pipeline', () => {
  for (const testCase of (fixture as { cases: ParityCase[] }).cases) {
    it(`${testCase.name}: white balance -> CLAHE -> 2:1 area downscale`, () => {
      const input = new Uint8Array(Buffer.from(testCase.input, 'base64'));
      const expected = new Uint8Array(Buffer.from(testCase.expected, 'base64'));
      const tensor = preprocessRgbaForModel(rgbToRgba(input), testCase.size, testCase.size);

      expect(tensor.length).toBe(expected.length);

      let sumAbs = 0;
      let maxAbs = 0;
      for (let i = 0; i < tensor.length; i++) {
        const diff = Math.abs(tensor[i] - expected[i]);
        sumAbs += diff;
        maxAbs = Math.max(maxAbs, diff);
      }

      expect(sumAbs / tensor.length).toBeLessThan(3);
      expect(maxAbs).toBeLessThan(12);
    });
  }
});
