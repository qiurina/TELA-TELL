import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import { MODEL_VERSION } from '@/features/scan/lib/ml/constants';

describe('MODEL_VERSION', () => {
  it('ends with the first 8 hex digits of the bundled .tflite file MD5, so replacing the model forces a bump', () => {
    const file = readFileSync(
      join(__dirname, '../../../../assets/models/fabric_classifier.tflite'),
    );
    const md5 = createHash('md5').update(file).digest('hex');
    expect(MODEL_VERSION.endsWith(`-${md5.slice(0, 8)}`)).toBe(true);
  });
});
