import type { FabricComposition } from '@/data/scans/mock-data';
import { MODEL_LABELS } from '@/features/scan/lib/ml/constants';
import { imageToModelInput } from '@/features/scan/lib/ml/preprocess-raw';
import { scoresToCompositions } from '@/features/scan/lib/ml/scores';
import type { AnalysisProgressListener } from '@/features/scan/lib/analysis-progress';

export type ClassificationResult = {
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  burstCount: number;
  inferenceMs: number;
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
      let loadTensorflowModel: (source: { url: string }, delegates: string[]) => Promise<TFLiteModel>;
      let Asset: { loadAsync(moduleId: number): Promise<{ localUri: string | null }[]> };
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ loadTensorflowModel } = require('react-native-fast-tflite'));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ Asset } = require('expo-asset'));
      } catch {
        throw new ModelUnavailableError('react-native-fast-tflite or expo-asset is not installed.');
      }

      try {
        // Release APKs need a file:// path; fast-tflite cannot read bundled asset ids.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const [asset] = await Asset.loadAsync(require('@/assets/models/fabric_classifier.tflite'));
        if (!asset?.localUri) {
          throw new Error('The model file has no local path after loading.');
        }
        return await loadTensorflowModel({ url: asset.localUri }, []);
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

export async function classifyFabric(
  imageUris: string[],
  onProgress?: AnalysisProgressListener,
): Promise<ClassificationResult> {
  if (imageUris.length === 0) {
    throw new ModelUnavailableError('No captured images to classify.');
  }

  const startedAt = nowMs();
  onProgress?.({ stage: 'loading_model' });
  const model = await loadModel();
  const scoreSets: Float32Array[] = [];
  let inferenceMs = 0;
  for (const [index, uri] of imageUris.entries()) {
    onProgress?.({ stage: 'reading_photo', photo: index + 1, photos: imageUris.length });
    const input = await imageToModelInput(uri);
    const runStartedAt = nowMs();
    const outputs = model.runSync([input.buffer as ArrayBuffer]);
    inferenceMs += nowMs() - runStartedAt;
    // Copy: fast-tflite reuses its output buffer on every run.
    scoreSets.push(new Float32Array(outputs[0]).slice());
  }

  const scores = scoreSets.length > 1 ? averageScores(scoreSets) : scoreSets[0];

  if (!scores.every((value) => Number.isFinite(value))) {
    throw new ModelUnavailableError('Model produced invalid output.');
  }

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
