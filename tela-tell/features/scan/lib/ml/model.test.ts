import { classifyFabric } from '@/features/scan/lib/ml/model';

// The native TFLite module and the preprocessing (which needs the image libraries) are replaced,
// so this checks only what classifyFabric itself does: averaging a burst, ranking, and reporting
// how many photos were used and how long the work took.
const mockScores = new Float32Array([0.8, 0.05, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.005, 0.005]);

// Each test can swap how the fake model answers; by default it returns mockScores in fresh memory.
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

describe('classifyFabric', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockRunSync = freshScores;
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

  it('averages every photo even though the model reuses its output memory between runs', async () => {
    // react-native-fast-tflite allocates one output buffer per output tensor and overwrites it on
    // every run (HybridTfliteModel.cpp, getOutputBufferForTensor). Labels: 0 = Cotton, 4 = Polyester.
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

    // The average of the three photos (Cotton 63%, Polyester 37%), not the last photo alone
    // (Polyester 90%, Cotton 10%).
    expect(run).toBe(3);
    expect(result.dominantFabric).toBe('Cotton');
    expect(result.compositions).toEqual([
      { material: 'Cotton', percentage: 63 },
      { material: 'Polyester', percentage: 37 },
    ]);
  });

  it('refuses an empty capture', async () => {
    await expect(classifyFabric([])).rejects.toThrow(/No captured images/);
  });
});
