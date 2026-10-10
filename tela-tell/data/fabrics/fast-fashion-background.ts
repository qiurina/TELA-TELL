import type { EcoClaim } from '@/data/scans/mock-data';
import { resolveSources, type Source } from '@/data/fabrics/source-registry';

/**
 * Short background on fast fashion for the About screen, with the claims behind it for a sources
 * sheet. It is general information about clothing, not about a scanned garment, which is why it
 * lives on the About screen and not next to a scan's eco tips. (Secondhand and reuse evidence
 * belongs to the Resale and Donate tips; see `REUSE_CLAIMS` in `eco-alternatives.ts`.)
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

export const FAST_FASHION_EDITORIAL_NOTE =
  "This is general background, not a measurement of your garment. A fabric's score does not make a purchase eco-friendly; how much is bought and how often it is worn also matter.";

const EMF = 'emf-new-textiles-economy-2017';
const PETERS = 'peters-2021-fast-fashion';

export const FAST_FASHION_CLAIMS: EcoClaim[] = [
  {
    kind: 'fact',
    text: 'In the 15 years before 2017, clothing production roughly doubled worldwide, and the average number of times a garment is worn before it is no longer used fell 36%. The report links the rise to fast fashion: quicker turnaround of styles, more collections a year and often lower prices.',
    sourceIds: [EMF],
  },
  {
    kind: 'fact',
    text: 'A 2021 modeling study estimated the climate impact of clothing and footwear consumption rose from 1.0 to 1.3 billion tonnes of CO2 equivalent over the 15 years to 2015, while the impact per garment improved. Its authors note the scale of fast fashion impacts is debated, and argue for ending fast fashion as a business model.',
    sourceIds: [PETERS],
  },
  {
    kind: 'benefit',
    text: 'The Ellen MacArthur Foundation estimates that if garments were worn twice as often on average, greenhouse gas emissions would be 44% lower. This is its own calculation for the production phase, assuming second-hand handling uses ten times less energy than making clothes.',
    sourceIds: [EMF],
    aspect: 'Wearing clothes more often',
  },
];

export const FAST_FASHION_SOURCE_IDS: string[] = [
  ...new Set(FAST_FASHION_CLAIMS.flatMap((claim) => claim.sourceIds ?? [])),
];

export function getFastFashionSources(): Source[] {
  return resolveSources(FAST_FASHION_SOURCE_IDS);
}
