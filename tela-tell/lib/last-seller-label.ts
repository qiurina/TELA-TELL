/** Holds the seller-declared fabric label for the current scan session. */
let lastSellerLabel: string | null = null;

export function setLastSellerLabel(label: string) {
  lastSellerLabel = label.trim() || null;
}

export function getLastSellerLabel(): string | null {
  return lastSellerLabel;
}

export function clearLastSellerLabel() {
  lastSellerLabel = null;
}
