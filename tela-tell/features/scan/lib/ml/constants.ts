import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

/** Must stay in sync with ml-training/common/labels.py FABRIC_CLASSES. */
export const MODEL_LABELS = SUPPORTED_FABRICS;

/** Must stay in sync with ml-training/common/labels.py IMAGE_SIZE. */
export const IMAGE_SIZE = 224;

/**
 * Identifies the bundled model, saved with every scan. Format: `<architecture>-<variant>-<first 8
 * hex digits of the .tflite file's MD5>`. Bump it whenever assets/models/fabric_classifier.tflite
 * is replaced; model-version.test.ts fails if the hash here no longer matches the bundled file.
 */
export const MODEL_VERSION = 'efficientnet-lite0-grayscale-6a47bf37';
