import {
  findUnsupportedFibers,
  resolveAllFabricAliases,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import {
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
 *  - unreadable: nothing the label says can be checked (unknown names, imitation leather, ...)
 *  - none:     no label was entered
 * Only `mismatch` raises the "possible mislabel" warning, so trace fibers (e.g. 5% spandex) never
 * cause a false alarm, and a faint hit is never reported as a clean match either.
 */
export type DeclaredLabelStatus = 'none' | 'unreadable' | 'match' | 'weak' | 'mismatch';

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

  if (missing.length > 0) {
    return {
      ...base,
      status: 'mismatch',
      title: 'Possible Mislabeling Detected',
      message: `The scan did not find ${listNames(missing)}. Consider negotiating the price.${skippedNote}`,
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
