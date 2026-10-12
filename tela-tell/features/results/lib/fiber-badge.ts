import type { StatusTone } from '@/constants/status-colors';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getPredictedSyntheticFibers } from '@/data/fabrics/synthetic-health-risk';
import { CLEAR_SHARE_MIN_PERCENT, type CompositionInput } from '@/data/scans/scan-confidence';

/**
 * The small badge on the scan photo. It always names the fiber, so it can never be read as a
 * comment on the headline fiber, and it only ever says what the model predicted:
 *  - likely:   the headline (top) fiber is itself synthetic.
 *  - possible: a synthetic fiber is a lower prediction with a clear share (>= 15%). A trace share
 *              (a few percent) is model noise and shows nothing.
 * There is no badge for an Unsure scan or when no synthetic prediction qualifies, and nothing is
 * shown that could be read as "no synthetic fibers", because the scan cannot prove that.
 *
 * The 15% line is a display heuristic only (it reuses CLEAR_SHARE_MIN_PERCENT). It is not a
 * scientifically validated threshold and not a measure of fiber content: the classifier is
 * single-label, so these percentages are the model's confidence, not how much of each fiber the
 * fabric contains. It only keeps a trace score (a few percent) from putting a badge on the photo.
 *
 * Both badges use the same amber tone: "synthetic" is information about the predicted fiber, not a
 * warning, and the wording ("Likely" / "Other prediction") carries the difference.
 */
export type FiberBadge = {
  kind: 'likely' | 'possible';
  label: string;
  fibers: SupportedFabric[];
  tone: Extract<StatusTone, 'caution'>;
  infoTitle: string;
  infoMessage: string;
};

/** More names than this are summarised as "Polyester +1" so the badge stays short on the photo. */
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
    return null;
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
