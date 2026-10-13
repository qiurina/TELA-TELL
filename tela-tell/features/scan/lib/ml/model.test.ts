import { classifyFabric } from '@/features/scan/lib/ml/model';

const mockScores = new Float32Array([0.8, 0.05, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.005, 0.005]);

const freshScores = () => [new Float32Array(mockScores).buffer];
let mockRunSync: () => ArrayBuffer[] = freshScores;

jest.mock('@/features/scan/lib/ml/preprocess-raw', () => ({
  imageToModelInput: jest.fn(async () => new Float32Array(224 * 224 * 3)),
}));

jest.mock(
  'react-native-fast-tflite',
  () => ({
    loadTensorflowModel: jest.fn(async () => ({
      runSync: () => mockRunSync(),
    })),
  }),
  { virtual: true },
);

jest.mock('@/assets/models/fabric_classifier.tflite', () => 1, { virtual: true });

let mockLocalUri: string | null = 'file:///data/user/0/com.telatell.app/cache/fabric_classifier.tflite';
jest.mock('expo-asset', () => ({
  Asset: { loadAsync: jest.fn(async () => [{ localUri: mockLocalUri }]) },
}));

describe('classifyFabric', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockRunSync = freshScores;
  });

  it('reports the burst size, the model time summed over the burst, and the whole-call time', async () => {
    let now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => {
      now += 10;
      return now;
    });

    const result = await classifyFabric(['a.jpg', 'b.jpg', 'c.jpg']);

    expect(result.burstCount).toBe(3);
    expect(result.inferenceMs).toBe(30);
    expect(result.totalMs).toBe(70);
    expect(result.dominantFabric).toBe('Cotton');
    expect(result.confidence).toBe(80);
    expect(result.compositions).toHaveLength(3);
  });

  it('reports a single photo as a burst of one', async () => {
    const result = await classifyFabric(['only.jpg']);
    expect(result.burstCount).toBe(1);
    expect(Number.isInteger(result.inferenceMs)).toBe(true);
    expect(result.totalMs).toBeGreaterThanOrEqual(result.inferenceMs);
  });

  it('averages every photo even though the model reuses its output memory between runs', async () => {
    const reused = new ArrayBuffer(12 * 4);
    const perPhoto = [
      { cotton: 0.9, polyester: 0.1 },
      { cotton: 0.9, polyester: 0.1 },
      { cotton: 0.1, polyester: 0.9 },
    ];
    let run = 0;
    mockRunSync = () => {
      const scores = new Float32Array(reused);
      scores.fill(0);
      scores[0] = perPhoto[run].cotton;
      scores[4] = perPhoto[run].polyester;
      run += 1;
      return [reused];
    };

    const result = await classifyFabric(['a.jpg', 'b.jpg', 'c.jpg']);

    expect(run).toBe(3);
    expect(result.dominantFabric).toBe('Cotton');
    expect(result.compositions).toEqual([
      { material: 'Cotton', percentage: 63 },
      { material: 'Polyester', percentage: 37 },
    ]);
  });

  it('reports each stage as it starts: the model load, then every photo in order', async () => {
    const onProgress = jest.fn();
    await classifyFabric(['a.jpg', 'b.jpg', 'c.jpg'], onProgress);
    expect(onProgress.mock.calls.map(([progress]) => progress)).toEqual([
      { stage: 'loading_model' },
      { stage: 'reading_photo', photo: 1, photos: 3 },
      { stage: 'reading_photo', photo: 2, photos: 3 },
      { stage: 'reading_photo', photo: 3, photos: 3 },
    ]);
  });

  it('refuses an empty capture', async () => {
    await expect(classifyFabric([])).rejects.toThrow(/No captured images/);
  });
});

/* eslint-disable @typescript-eslint/no-require-imports */
describe('loading the bundled model', () => {
  afterEach(() => {
    mockLocalUri = 'file:///data/user/0/com.telatell.app/cache/fabric_classifier.tflite';
  });

  it('passes fast-tflite a file:// URL from expo-asset, never the raw asset id', async () => {
    await jest.isolateModulesAsync(async () => {
      const { classifyFabric: classify } = require('@/features/scan/lib/ml/model');
      const tflite = require('react-native-fast-tflite');
      tflite.loadTensorflowModel.mockClear();
      await classify(['a.jpg']);
      expect(tflite.loadTensorflowModel).toHaveBeenCalledWith(
        { url: 'file:///data/user/0/com.telatell.app/cache/fabric_classifier.tflite' },
        [],
      );
    });
  });

  it('reports the model as unavailable when expo-asset gives no local path', async () => {
    mockLocalUri = null;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await jest.isolateModulesAsync(async () => {
      const { classifyFabric: classify, ModelUnavailableError } = require('@/features/scan/lib/ml/model');
      await expect(classify(['a.jpg'])).rejects.toBeInstanceOf(ModelUnavailableError);
    });
  });
});
/* eslint-enable @typescript-eslint/no-require-imports */
