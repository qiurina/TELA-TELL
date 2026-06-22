import { Asset } from 'expo-asset';

export const DEVICE_MOCK_CAPTURE = require('@/assets/images/testfabric.jpg');

let cachedUri: string | null = null;

export async function getDeviceMockCaptureUri(): Promise<string> {
  if (cachedUri) {
    return cachedUri;
  }

  const asset = Asset.fromModule(DEVICE_MOCK_CAPTURE);

  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  cachedUri = asset.localUri ?? asset.uri;
  return cachedUri;
}
