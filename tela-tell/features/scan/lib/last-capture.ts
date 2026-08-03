
let lastCaptureUri: string | null = null;

export function setLastCaptureUri(uri: string) {
  lastCaptureUri = uri;
}

export function getLastCaptureUri(): string | null {
  return lastCaptureUri;
}

export function clearLastCaptureUri() {
  lastCaptureUri = null;
}
