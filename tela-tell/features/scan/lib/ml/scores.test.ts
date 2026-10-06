import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { scoresToCompositions } from '@/features/scan/lib/ml/scores';

import { readFileSync } from 'fs';
import { join } from 'path';

function onehot(length: number, index: number, top = 0.8): number[] {
  const rest = (1 - top) / (length - 1);
  return Array.from({ length }, (_, i) => (i === index ? top : rest));
}

describe('scoresToCompositions', () => {
  const labels = SUPPORTED_FABRICS;

  it('labels outputs by position and sorts highest first', () => {
    const result = scoresToCompositions(onehot(labels.length, labels.indexOf('Rayon')), labels);
    expect(result[0]).toEqual({ material: 'Rayon', percentage: 80 });
  });

  it('refuses a model whose class count differs from the app labels', () => {
    expect(() => scoresToCompositions(onehot(labels.length + 1, 0), labels)).toThrow(
      /outputs 13 classes but the app has 12 labels/,
    );
    expect(() => scoresToCompositions(onehot(labels.length - 1, 0), labels)).toThrow(
      /outputs 11 classes/,
    );
  });

  it('refuses output that is not a softmax distribution', () => {
    const logits = Array.from({ length: labels.length }, (_, i) => i - 5);
    expect(() => scoresToCompositions(logits, labels)).toThrow(/not a probability distribution/);

    const unnormalized = Array.from({ length: labels.length }, () => 0.5);
    expect(() => scoresToCompositions(unnormalized, labels)).toThrow(/sum to/);
  });

  it('refuses NaN output', () => {
    const scores = onehot(labels.length, 0);
    scores[3] = NaN;
    expect(() => scoresToCompositions(scores, labels)).toThrow();
  });
});

describe('bundled model labels file', () => {
  it('lists the same fibers, in the same order, as the app', () => {
    const file = readFileSync(
      join(__dirname, '../../../../assets/models/fabric_classifier.labels.txt'),
      'utf8',
    );
    const fileLabels = file.split(/\r?\n/).filter(Boolean);
    expect(fileLabels).toEqual([...SUPPORTED_FABRICS]);
  });
});
