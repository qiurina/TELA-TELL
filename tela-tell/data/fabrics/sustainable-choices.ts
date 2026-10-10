import type { EcoClaim } from '@/data/scans/mock-data';

/**
 * The "Sustainable choices" card on Scan results. It replaces the retired sustainability score
 * (archived in docs/sustainability-score-archive.md). It makes no claim about the scanned garment:
 * it points to reuse and wearing clothes longer, the two things the sources we reviewed support,
 * and sends the person to Eco tips for the practical options (resale, donate, upcycle).
 */

export const SUSTAINABLE_CHOICES_TITLE = 'Sustainable choices';

export const SUSTAINABLE_CHOICES_TEXT =
  'The studies we reviewed point to reusing clothes and wearing them longer. Fiber type alone does not tell you a garment’s overall impact.';

export const SUSTAINABLE_CHOICES_ACTION = 'See reuse tips';

export const SUSTAINABLE_CHOICES_SHEET_TITLE = 'About sustainable choices';

export const SUSTAINABLE_CHOICES_SHEET_NOTE =
  'This is general guidance, not a measurement of your garment. The app does not score a garment’s sustainability, labor conditions or brand.';

export const SUSTAINABLE_CHOICES_CLAIMS: EcoClaim[] = [
  {
    kind: 'benefit',
    aspect: 'Reselling or donating',
    text: 'Reselling or donating clothes usually has less environmental impact than throwing them away, mainly when the item replaces buying something new.',
    sourceIds: ['sandin-peters-2018'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Reselling or donating',
    text: 'The benefit can disappear if the item does not replace a new purchase, or if extra transport is needed.',
    sourceIds: ['sandin-peters-2018'],
  },
  {
    kind: 'benefit',
    aspect: 'Wearing clothes longer',
    text: 'In one foundation’s own calculation, greenhouse gas emissions would be 44% lower if garments were worn twice as often on average.',
    sourceIds: ['emf-new-textiles-economy-2017'],
  },
  {
    kind: 'tradeoff',
    aspect: 'Wearing clothes longer',
    text: 'That figure is a model of the production phase only, not a measurement of any garment. It is a global estimate from 2017.',
    sourceIds: ['emf-new-textiles-economy-2017'],
  },
];
