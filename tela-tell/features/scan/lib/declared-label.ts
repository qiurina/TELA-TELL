import {
  findUnsupportedFibers,
  resolveAllFabricAliases,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import {
  assessScanReliability,
  CLEAR_SHARE_MIN_PERCENT,
  TRACE_DETECTION_MIN_PERCENT,
} from '@/data/scans/scan-confidence';

/**
 * Compares the label the seller or care tag declared with what the scan found.
 *
 * The classifier is single-label: its top-3 are confidence scores, not a measured blend. So the
 * check is deliberately graded instead of a yes/no:
 *  - match:    every declared fiber is the scan's top match or has a clear share (>= 15%)
 *  - weak:     every declared fiber was seen, but at least one only faintly (2% to 15%)
 *  - mismatch: a declared fiber is not in the scan's top 3 at all (under 2%)
 *  - unsure:   the scan itself was unsure (see assessScanReliability), so it can neither call the
 *              label wrong nor confirm it. Takes the place of match, weak and mismatch.
 *  - unreadable: nothing the label says can be checked (unknown names, imitation leather, ...)
 *  - none:     no label was entered
 * Only `mismatch` raises the "label may not match" warning, so trace fibers (e.g. 5% spandex) never
 * cause a false alarm, a faint hit is never reported as a clean match either, and a scan that
 * could not tell what the fabric is never accuses a label of being wrong.
 */
export type DeclaredLabelStatus = 'none' | 'unreadable' | 'match' | 'weak' | 'mismatch' | 'unsure';

export type DeclaredLabelCheck = {
  status: DeclaredLabelStatus;
  title: string;
  message: string;
  declared: SupportedFabric[];
  /** Declared fibers the scan did not find in its top 3. */
  missing: SupportedFabric[];
  /** Declared fibers the scan found only faintly. */
  weak: { fabric: SupportedFabric; percentage: number }[];
  /** Fibers named on the label that the model cannot recognize. */
  unsupported: string[];
};

type CompositionLike = { material: string; percentage: number };

const NO_LABEL: DeclaredLabelCheck = {
  status: 'none',
  title: '',
  message: '',
  declared: [],
  missing: [],
  weak: [],
  unsupported: [],
};

function listNames(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? '';
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function evaluateDeclaredLabel(
  dominantFabric: string,
  declaredLabel: string | null | undefined,
  compositions: CompositionLike[] = [],
): DeclaredLabelCheck {
  const label = declaredLabel?.trim() ?? '';
  if (!label) {
    return NO_LABEL;
  }

  const declared = resolveAllFabricAliases(label);
  const unsupported = findUnsupportedFibers(label);

  if (declared.length === 0) {
    return {
      ...NO_LABEL,
      status: 'unreadable',
      unsupported,
      title: "Can't check this label",
      message:
        unsupported.length > 0
          ? `TELA-TELL can't recognize ${listNames(unsupported)}, so it can't compare this label with the scan.`
          : "TELA-TELL couldn't find a fiber name it knows in this label. Try names like Cotton or Polyester.",
    };
  }

  const shares = new Map<SupportedFabric, number>();
  for (const item of compositions) {
    const fabric = resolveFabricAlias(item.material);
    if (fabric) {
      shares.set(fabric, Math.max(shares.get(fabric) ?? 0, item.percentage));
    }
  }
  const topFabric = resolveFabricAlias(dominantFabric);

  const missing: SupportedFabric[] = [];
  const weak: DeclaredLabelCheck['weak'] = [];

  for (const fiber of declared) {
    const percentage = shares.get(fiber) ?? 0;
    if (fiber !== topFabric && percentage < TRACE_DETECTION_MIN_PERCENT) {
      missing.push(fiber);
    } else if (fiber !== topFabric && percentage < CLEAR_SHARE_MIN_PERCENT) {
      weak.push({ fabric: fiber, percentage });
    }
  }

  const skippedNote =
    unsupported.length > 0
      ? ` ${listNames(unsupported)} can't be checked by the scan, so it was left out.`
      : '';
  const base = { declared, missing, weak, unsupported };

  // A scan that could not name one fiber has nothing solid to compare the label with: it must not
  // call the label wrong, and it must not confirm it either (the card would then say "Label
  // matches" next to "Scan found: Unsure").
  if (!assessScanReliability(compositions).reliable) {
    const detail =
      missing.length > 0
        ? `it can't tell whether ${listNames(missing)} is really missing`
        : "it can't confirm the label either way";
    return {
      ...base,
      status: 'unsure',
      title: "Can't confirm this label",
      message: `The scan wasn't sure what this fabric is, so ${detail}. Try another scan, or check the care tag.${skippedNote}`,
    };
  }

  if (missing.length > 0) {
    return {
      ...base,
      status: 'mismatch',
      title: 'The label may not match the prediction',
      message: `The scan may not have found ${listNames(missing)}. Check the care tag before deciding.${skippedNote}`,
    };
  }

  if (weak.length > 0) {
    return {
      ...base,
      status: 'weak',
      title: 'Label only partly confirmed',
      message: `The scan found only a small share of ${listNames(
        weak.map((item) => `${item.fabric} (${item.percentage}%)`),
      )}. This is a visual estimate, so check the care tag too.${skippedNote}`,
    };
  }

  return {
    ...base,
    status: 'match',
    title: 'Label matches',
    message: skippedNote.trim(),
  };
}
