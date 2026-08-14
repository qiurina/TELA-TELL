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

type TFLiteModel = { runSync(inputs: Float32Array[]): Float32Array[] };

let modelPromise: Promise<TFLiteModel> | null = null;

// react-native-fast-tflite is only installed once the app moves to a custom dev
// client (see ml-training/README.md); require() is deferred so the app still
// bundles and falls back to mock results before that dependency exists.
async function loadModel(): Promise<TFLiteModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      let loadTensorflowModel: (asset: number) => Promise<TFLiteModel>;
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ loadTensorflowModel } = require('react-native-fast-tflite'));
      } catch {
        throw new ModelUnavailableError('react-native-fast-tflite is not installed.');
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const asset = require('@/assets/models/fabric_classifier.tflite');
        return await loadTensorflowModel(asset);
      } catch {
        throw new ModelUnavailableError();
      }
    })();
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

export async function classifyFabric(imageUri: string): Promise<ClassificationResult> {
  const model = await loadModel();
  const input = await imageToInputTensor(imageUri);
  const outputs = model.runSync([input]);
  const scores = outputs[0];

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