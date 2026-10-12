import type { EcoClaim } from '@/data/scans/mock-data';
import { resolveSources, type Source } from '@/data/fabrics/source-registry';

/**
 * Short background on fast fashion for the About screen, with the claims behind it for a sources
 * sheet. It is general information about clothing, not about a scanned garment, which is why it
 * lives on the About screen and not next to a scan's eco tips. (Secondhand and reuse evidence
 * is on the Sustainable choices sheet; see `SUSTAINABLE_CHOICES_CLAIMS`.)
 *
 * Rules for editing:
 * - Every sentence in `FAST_FASHION_TEXT` must be backed by a claim below with a source in
 *   `source-registry.ts`, published in the last 10 years.
 * - Do not claim that a fabric or a purchase is eco-friendly, or that any one choice is always
 *   better. The sources support "can", "may" and "usually", with conditions.
 */

export const FAST_FASHION_TITLE = 'Fast fashion';

export const FAST_FASHION_TEXT =
  'Fast fashion means styles that change quickly at low prices, so more clothes get made and each is worn less. Clothing production roughly doubled in 15 years, while wears per garment fell 36%. Buying fewer clothes and wearing them longer matters alongside which fabric you pick.';

export const FAST_FASHION_BASIS_TITLE = 'About fast fashion';

/** The limits that apply to every point on the sheet. */
export const FAST_FASHION_KEEP_IN_MIND =
  "These are global estimates, not measurements of your garment, and not specific to the Philippines. How big fast fashion's impact is remains debated. A fabric alone does not make a purchase eco-friendly; how much is bought and how often it is worn also matter.";

const EMF = 'emf-new-textiles-economy-2017';
const PETERS = 'peters-2021-fast-fashion';

export const FAST_FASHION_CLAIMS: EcoClaim[] = [
  {
    kind: 'fact',
    aspect: 'More clothes, worn less',
    text: 'In the 15 years before 2017, clothing production roughly doubled worldwide, while the number of times a garment is worn fell 36%.',
    sourceIds: [EMF],
  },
  {
    kind: 'fact',
    aspect: 'Climate impact',
    text: 'One 2021 study estimated the climate impact of buying clothes and shoes rose from 1.0 to 1.3 billion tonnes of CO2 equivalent in the 15 years to 2015, even as the impact per garment improved.',
    sourceIds: [PETERS],
  },
  {
    kind: 'benefit',
    aspect: 'Wearing clothes more often',
    text: 'The Ellen MacArthur Foundation estimates that wearing clothes more often would lower the emissions from making clothes, because fewer new ones are needed.',
    sourceIds: [EMF],
  },
];

export const FAST_FASHION_SOURCE_IDS: string[] = [
  ...new Set(FAST_FASHION_CLAIMS.flatMap((claim) => claim.sourceIds ?? [])),
];

export function getFastFashionSources(): Source[] {
  return resolveSources(FAST_FASHION_SOURCE_IDS);
}
