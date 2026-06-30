export type ScanMode = 'single' | 'dual';

let scanMode: ScanMode = 'single';

export function getScanMode(): ScanMode {
  return scanMode;
}

export function setScanMode(mode: ScanMode): void {
  scanMode = mode;
}

export function resetScanSession(): void {
  scanMode = 'single';
}
