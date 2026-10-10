import { classifyFabric } from '@/features/scan/lib/ml/model';

// The native TFLite module and the preprocessing (which needs the image libraries) are replaced,
// so this checks only what classifyFabric itself does: averaging a burst, ranking, and reporting
// how many photos were used and how long the work took.
const mockScores = new Float32Array([0.8, 0.05, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.005, 0.005]);

jest.mock('@/features/scan/lib/ml/preprocess', () => ({
  imageToInputTensor: jest.fn(async () => new Float32Array(224 * 224 * 3)),
}));

jest.mock(
  'react-native-fast-tflite',
  () => ({
    loadTensorflowModel: jest.fn(async () => ({
      runSync: () => [new Float32Array(mockScores).buffer],
    })),
  }),
  { virtual: true },
);

jest.mock('@/assets/models/fabric_classifier.tflite', () => 1, { virtual: true });

describe('classifyFabric', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports the burst size, the model time summed over the burst, and the whole-call time', async () => {
    // Every reading of the clock advances by 10 ms: start, then a start/end pair per photo, then end.
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

  it('refuses an empty capture', async () => {
    await expect(classifyFabric([])).rejects.toThrow(/No captured images/);
  });
});
