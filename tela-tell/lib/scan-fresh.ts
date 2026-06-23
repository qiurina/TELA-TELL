let pendingFreshScan = false;

export function requestFreshScan() {
  pendingFreshScan = true;
}

export function consumeFreshScan() {
  const shouldReset = pendingFreshScan;
  pendingFreshScan = false;
  return shouldReset;
}
