import type { FabricComposition } from '@/data/scans/mock-data';
import { MODEL_LABELS } from '@/features/scan/lib/ml/constants';
import { imageToModelInput } from '@/features/scan/lib/ml/preprocess-raw';
import { scoresToCompositions } from '@/features/scan/lib/ml/scores';
import type { AnalysisProgressListener } from '@/features/scan/lib/analysis-progress';

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
      let loadTensorflowModel: (source: { url: string }, delegates: string[]) => Promise<TFLiteModel>;
      let Asset: { loadAsync(moduleId: number): Promise<{ localUri: string | null }[]> };
      try {
        // Lazy require: keeps jest/web from loading the native module until a scan runs.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ loadTensorflowModel } = require('react-native-fast-tflite'));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ({ Asset } = require('expo-asset'));
      } catch {
        throw new ModelUnavailableError('react-native-fast-tflite or expo-asset is not installed.');
      }

      try {
        // In a release APK the bundled model is a raw Android resource, and React Native resolves
        // it to a bare resource name ("assets_models_fabric_classifier"). fast-tflite's Android
        // loader only reads URLs (java.net.URL), so passing the asset id worked through Metro's
        // http:// URL in development but failed in every APK. expo-asset copies the model to a
        // file:// path first (downloading it from Metro in development), which the loader can read.
        // Metro resolves the bundled .tflite asset id via require; there is no ES import form.
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

/**
 * Classifies a burst of photos of the same fabric and averages their scores.
 * Averaging over multiple shots reduces the per-shot noise (framing/focus/lighting
 * micro-variation) that otherwise flips the top-1 result between repeat scans.
 */
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
    // Copy the scores: react-native-fast-tflite returns the same output buffer on every run and
    // overwrites it, so keeping a view would leave every photo holding the last photo's scores.
    scoreSets.push(new Float32Array(outputs[0]).slice());
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
