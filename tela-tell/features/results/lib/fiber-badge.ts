import type { StatusTone } from '@/constants/status-colors';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getPredictedSyntheticFibers } from '@/data/fabrics/synthetic-health-risk';
import { CLEAR_SHARE_MIN_PERCENT, type CompositionInput } from '@/data/scans/scan-confidence';

export type FiberBadge = {
  kind: 'likely' | 'possible' | 'not_synthetic';
  label: string;
  fibers: SupportedFabric[];
  tone: Extract<StatusTone, 'caution' | 'good'>;
  infoTitle: string;
  infoMessage: string;
};

const MAX_NAMED_FIBERS = 2;

function summarise(fibers: SupportedFabric[]): string {
  if (fibers.length <= MAX_NAMED_FIBERS) {
    return fibers.join(', ');
  }
  return `${fibers[0]} +${fibers.length - 1}`;
}

function sentenceList(fibers: SupportedFabric[]): string {
  if (fibers.length <= 1) {
    return fibers[0] ?? '';
  }
  return `${fibers.slice(0, -1).join(', ')} and ${fibers[fibers.length - 1]}`;
}

const INFO_CLOSING =
  'This is a visual prediction, not a measurement of what the fabric contains. Check the care tag for the actual fiber content.';

export function getFiberBadge(
  dominantFabric: string,
  compositions: CompositionInput[] | null | undefined,
  isUnsure: boolean,
): FiberBadge | null {
  if (isUnsure) {
    return null;
  }

  const top = resolveFabricAlias(dominantFabric);
  if (top && getFabricCategory(top) === 'Synthetic') {
    return {
      kind: 'likely',
      label: `Likely synthetic: ${top}`,
      fibers: [top],
      tone: 'caution',
      infoTitle: 'Top fiber prediction',
      infoMessage: `The model's top prediction is ${top}, a synthetic fiber. ${INFO_CLOSING}`,
    };
  }

  const possible = getPredictedSyntheticFibers(
    dominantFabric,
    compositions ?? [],
    CLEAR_SHARE_MIN_PERCENT,
  );
  if (possible.length === 0) {
    if (!top) {
      return null;
    }
    return {
      kind: 'not_synthetic',
      label: `Likely not synthetic: ${top}`,
      fibers: [top],
      tone: 'good',
      infoTitle: 'Top fiber prediction',
      infoMessage: `The model's top prediction is ${top}, which is not a synthetic fiber. The scan can't rule out synthetic fibers blended in. ${INFO_CLOSING}`,
    };
  }

  return {
    kind: 'possible',
    label: `${possible.length > 1 ? 'Other predictions' : 'Other prediction'}: ${summarise(possible)}`,
    fibers: possible,
    tone: 'caution',
    infoTitle: 'Other fiber predictions',
    infoMessage: `The model's other predictions include ${sentenceList(possible)}. ${INFO_CLOSING}`,
  };
}
