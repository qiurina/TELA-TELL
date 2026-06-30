import { Image } from 'react-native';

export const DEVICE_MOCK_CAPTURE = require('@/assets/images/testfabric.jpg');

let cachedUri: string | null = null;

export async function getDeviceMockCaptureUri(): Promise<string> {
  if (cachedUri) {
    return cachedUri;
  }

  const { uri } = Image.resolveAssetSource(DEVICE_MOCK_CAPTURE);
  cachedUri = uri;
  return uri;
}
