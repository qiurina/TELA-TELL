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

export type DeclaredLabelStatus = 'none' | 'unreadable' | 'match' | 'weak' | 'mismatch' | 'unsure';

export type DeclaredLabelCheck = {
  status: DeclaredLabelStatus;
  title: string;
  message: string;
  declared: SupportedFabric[];
  missing: SupportedFabric[];
  weak: { fabric: SupportedFabric; percentage: number }[];
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
