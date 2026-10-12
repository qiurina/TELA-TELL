import type { EcoClaim } from '@/data/scans/mock-data';

/**
 * The "Sustainable choices" card on Scan results. It replaces the retired sustainability score
 * (archived in docs/sustainability-score-archive.md). It makes no claim about the scanned garment:
 * it points to reuse and wearing clothes longer, the two things its sources support, and its link
 * opens the sheet that explains both.
 */

export const SUSTAINABLE_CHOICES_TITLE = 'Sustainable choices';

export const SUSTAINABLE_CHOICES_TEXT =
  'Reusing clothes and wearing them longer can help the environment. Fiber type alone does not tell you a garment’s overall impact.';

export const SUSTAINABLE_CHOICES_ACTION = 'About sustainable choices';

export const SUSTAINABLE_CHOICES_SHEET_TITLE = 'About sustainable choices';

/** The (i) sheet: one sentence per point, each with its source. */
export const SUSTAINABLE_CHOICES_CLAIMS: EcoClaim[] = [
  {
    kind: 'benefit',
    aspect: 'Reselling or donating',
    text: 'Usually better for the environment than throwing clothes away, mainly when it replaces buying something new.',
    sourceIds: ['sandin-peters-2018'],
  },
  {
    kind: 'benefit',
    aspect: 'Wearing clothes longer',
    text: 'Wearing clothes more often means fewer new ones need to be made, which lowers the emissions from making clothes, according to one foundation’s estimate.',
    sourceIds: ['emf-new-textiles-economy-2017'],
  },
];

/** The limits that apply to both points, in one place. */
export const SUSTAINABLE_CHOICES_KEEP_IN_MIND =
  'These are general studies, not about your garment or the Philippines. The benefit can disappear if the item does not replace a new purchase.';
