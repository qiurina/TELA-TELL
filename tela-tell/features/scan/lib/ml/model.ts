import type { FabricComposition } from '@/data/scans/mock-data';
import { MODEL_LABELS } from '@/features/scan/lib/ml/constants';
import { imageToInputTensor } from '@/features/scan/lib/ml/preprocess';
import { scoresToCompositions } from '@/features/scan/lib/ml/scores';

export type ClassificationResult = {
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  /** Photos classified and averaged. */
  burstCount: number;
  /** Milliseconds inside the model's run call, summed over the burst. */
  inferenceMs: number;
  /** Milliseconds for the whole call (preprocessing + model for every photo + any model load). */
  totalMs: number;
};

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

export class ModelUnavailableError extends Error {
  constructor(message = 'Fabric classification model could not be loaded.') {
    super(message);
    this.name = 'ModelUnavailableError';
  }
}

type TFLiteModel = { runSync(inputs: ArrayBuffer[]): ArrayBuffer[] };

let modelPromise: Promise<TFLiteModel> | null = null;


async function loadModel(): Promise<TFLiteModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      let loadTensorflowModel: (asset: number, delegates: string[]) => Promise<TFLiteModel>;
      try {
        // Lazy require: keeps jest/web from loading the native module until a scan runs.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ loadTensorflowModel } = require('react-native-fast-tflite'));
      } catch {
        throw new ModelUnavailableError('react-native-fast-tflite is not installed.');
      }

      try {
        // Metro resolves the bundled .tflite asset id via require; there is no ES import form.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const asset = require('@/assets/models/fabric_classifier.tflite');
        return await loadTensorflowModel(asset, []);
      } catch (error) {
        console.error('[TELA-TELL] loadTensorflowModel failed:', error);
        throw new ModelUnavailableError();
      }
    })().catch((error) => {
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

function averageScores(scoreSets: Float32Array[]): Float32Array {
  const length = scoreSets[0]?.length ?? 0;
  const averaged = new Float32Array(length);
  for (const scores of scoreSets) {
    for (let i = 0; i < length; i += 1) {
      averaged[i] += scores[i];
    }
  }
  for (let i = 0; i < length; i += 1) {
    averaged[i] /= scoreSets.length;
  }
  return averaged;
}

/**
 * Classifies a burst of photos of the same fabric and averages their scores.
 * Averaging over multiple shots reduces the per-shot noise (framing/focus/lighting
 * micro-variation) that otherwise flips the top-1 result between repeat scans.
 */
export async function classifyFabric(imageUris: string[]): Promise<ClassificationResult> {
  if (imageUris.length === 0) {
    throw new ModelUnavailableError('No captured images to classify.');
  }

  const startedAt = nowMs();
  const model = await loadModel();
  const scoreSets: Float32Array[] = [];
  let inferenceMs = 0;
  for (const uri of imageUris) {
    const input = await imageToInputTensor(uri);
    const runStartedAt = nowMs();
    const outputs = model.runSync([input.buffer as ArrayBuffer]);
    inferenceMs += nowMs() - runStartedAt;
    scoreSets.push(new Float32Array(outputs[0]));
  }

  const scores = scoreSets.length > 1 ? averageScores(scoreSets) : scoreSets[0];

  if (!scores.every((value) => Number.isFinite(value))) {
    throw new ModelUnavailableError('Model produced invalid output.');
  }

  // Throws if the model's output count or shape does not fit MODEL_LABELS (see scores.ts), so a
  // wrongly sized model fails loudly instead of mislabelling every scan.
  const compositions = scoresToCompositions(scores, MODEL_LABELS).slice(0, 3);
  const top = compositions[0];
  if (!top) {
    throw new ModelUnavailableError('Model produced no classification output.');
  }

  return {
    dominantFabric: top.material,
    compositions,
    confidence: top.percentage,
    burstCount: scoreSets.length,
    inferenceMs: Math.round(inferenceMs),
    totalMs: Math.round(nowMs() - startedAt),
  };
}

export async function isModelAvailable(): Promise<boolean> {
  try {
    await loadModel();
    return true;
  } catch {
    return false;
  }
}