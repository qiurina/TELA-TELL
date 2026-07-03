import { Asset } from 'expo-asset';
import { Image, Platform } from 'react-native';

export const DEVICE_MOCK_CAPTURE = require('@/assets/images/testfabric.jpg');

let cachedUri: string | null = null;

function resolveWebAssetUri(module: unknown): string | null {
  if (typeof module === 'string') {
    return module;
  }

  if (!module || typeof module !== 'object') {
    return null;
  }

  const record = module as { uri?: string; default?: string | { uri?: string } };

  if (typeof record.uri === 'string') {
    return record.uri;
  }

  const nested = record.default;

  if (typeof nested === 'string') {
    return nested;
  }

  if (nested && typeof nested === 'object' && typeof nested.uri === 'string') {
    return nested.uri;
  }

  return null;
}

export async function getDeviceMockCaptureUri(): Promise<string> {
  if (cachedUri) {
    return cachedUri;
  }

  if (Platform.OS === 'web') {
    const webUri = resolveWebAssetUri(DEVICE_MOCK_CAPTURE);
    if (!webUri) {
      throw new Error('Unable to resolve mock capture image on web.');
    }
    cachedUri = webUri;
    return cachedUri;
  }

  if (typeof Image.resolveAssetSource === 'function') {
    const resolved = Image.resolveAssetSource(DEVICE_MOCK_CAPTURE);
    if (resolved?.uri) {
      cachedUri = resolved.uri;
      return cachedUri;
    }
  }

  const asset = Asset.fromModule(DEVICE_MOCK_CAPTURE);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  cachedUri = asset.localUri ?? asset.uri;
  if (!cachedUri) {
    throw new Error('Unable to resolve mock capture image.');
  }

  return cachedUri;
}
