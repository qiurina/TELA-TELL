import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

// Must match ml-training/common/labels.py.
export const MODEL_LABELS = SUPPORTED_FABRICS;

export const IMAGE_SIZE = 224;

// Ends with the model file's MD5 prefix; model-version.test.ts checks it.
export const MODEL_VERSION = 'efficientnet-lite0-grayscale-6a47bf37';
