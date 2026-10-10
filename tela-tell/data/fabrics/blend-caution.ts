import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { assessScanReliability, type CompositionInput } from '@/data/scans/scan-confidence';

/**
 * A neutral limitation note for results that name a natural or semi-synthetic fiber.
 *
 * It states only what this app cannot do: the classifier names the single most likely fiber and
 * cannot see a blend (see the "What they aren't" text on the percentages sheet). It makes no
 * claim about how common blends are, about shedding, or about health, so it needs no outside
 * source. (Background on blends is in the paper's RRL 2.1.2.)
 */
export type BlendCaution = {
  title: string;
  pill: string;
  message: string;
};

/** Fibers the note is shown for. Other fibers are not named here (the note would not add anything). */
export const BLEND_CAUTION_FIBERS: readonly SupportedFabric[] = ['Cotton', 'Linen', 'Rayon', 'Wool'];

const BLEND_CAUTION: BlendCaution = {
  title: "Blends aren't visible to this scan",
  pill: 'Note',
  message:
    'A fabric that looks like one fiber can be a blend. This scan names only the single most likely fiber and cannot see a blend, so check the care tag for the full fiber content.',
};

/**
 * The note for a scan, or null. Null for an Unsure scan (it names no fiber, so there is nothing to
 * qualify) and for any fiber outside BLEND_CAUTION_FIBERS.
 */
export function getBlendCaution(
  dominantFabric: string,
  compositions: CompositionInput[] | null | undefined,
): BlendCaution | null {
  if (!assessScanReliability(compositions).reliable) {
    return null;
  }
  const fiber = resolveFabricAlias(dominantFabric);
  return fiber && BLEND_CAUTION_FIBERS.includes(fiber) ? BLEND_CAUTION : null;
}
