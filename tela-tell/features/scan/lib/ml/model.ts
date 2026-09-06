import type { FabricComposition } from '@/data/scans/mock-data';
import { MODEL_LABELS } from '@/features/scan/lib/ml/constants';
import { imageToInputTensor } from '@/features/scan/lib/ml/preprocess';

export type ClassificationResult = {
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
};

export class ModelUnavailableError extends Error {
  constructor(message = 'Fabric classification model is not bundled yet.') {
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
        ({ loadTensorflowModel } = require('react-native-fast-tflite'));
      } catch {
        throw new ModelUnavailableError('react-native-fast-tflite is not installed.');
      }

      try {
        const asset = require('@/assets/models/fabric_classifier.tflite');
        // The native side requires an actual array here (an empty array means
        // "use the default CPU delegate") — passing undefined throws a native
        // error with no readable JS message.
        return await loadTensorflowModel(asset, []);
      } catch (error) {
        console.error('[TELA-TELL] loadTensorflowModel failed:', error);
        throw new ModelUnavailableError();
      }
    })().catch((error) => {
      // Let the next scan attempt retry instead of replaying this same failure forever.
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

function scoresToCompositions(scores: Float32Array): FabricComposition[] {
  const total = scores.reduce((sum, value) => sum + value, 0) || 1;
  return MODEL_LABELS.map((material, index) => ({
    material,
    percentage: Math.round((scores[index] / total) * 100),
  }))
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);
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

  const model = await loadModel();
  const scoreSets: Float32Array[] = [];
  for (const uri of imageUris) {
    const input = await imageToInputTensor(uri);
    const outputs = model.runSync([input.buffer as ArrayBuffer]);
    scoreSets.push(new Float32Array(outputs[0]));
  }

  const scores = scoreSets.length > 1 ? averageScores(scoreSets) : scoreSets[0];

  const compositions = scoresToCompositions(scores).slice(0, 3);
  const top = compositions[0];
  if (!top) {
    throw new ModelUnavailableError('Model produced no classification output.');
  }

  return {
    dominantFabric: top.material,
    compositions,
    confidence: top.percentage,
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